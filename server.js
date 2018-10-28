const express = require('express');
const WebSocket = require('ws');
const path = require('path')
const app = express();
const wss = new WebSocket.Server({ port: 8080 });

/***** Static Server */
app.get('/app', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
})

app.use(express.static('public'));
app.listen(8000);
/***** End Static Server */
/***** Websocket Server */
wss.on('connection', function connection(ws, req) {
    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
        const request = JSON.parse(message);
        requestTypes[request.type](request, ws);
    });
});
/***** End Websocket Server */
/***** Gamelogic */
const allRooms = []
class Player {
    constructor(uuid, ws, name, points) {
        this.uuid = uuid;
        this.ws = ws;
        this.name = name;
        this.points = points;
        this.cards = [];
    }
    dealCards(newCards) {
        this.cards.push(...newCards);
    }
    win() {
        this.points++;
    }
    hasCard(id) {
        return this.cards.some((card) => {
            return card.id === id;
        })
    }
    playCard(id) {
        if (this.hasCard(id)) {
            this.cards = this.cards.filter((card) => {
                return card.id !== id;
            })
            return true;
        } else {
            return false;
        }
    }
    playerTests() {
        this.cards = [{ id: 0, text: "sample" },
        { id: 1, text: "bottom text" }]
        const lv = this.cards.length;
        this.dealCards([{ id: 4, text: "meme" }, { id: 5, text: "Kartentext" }]);
        if (this.cards.length === (lv + 2)) console.log("DealCards successs");
        if (this.hasCard(0) && !this.hasCard(8)) console.log("HasCard success");
        if (this.playCard(0) && this.cards[0].id !== 0) console.log("Playcard success");

    }
}
class GameRoom {
    constructor(id, password) {
        this.id = id;
        this.pw = password;
        this.players = [];
        this.allCards = [];
    }
    get password() {
        return this.pw;
    }
    join(uuid, ws, name) {
        if (typeof name !== "string") return { type: "error", msg: "no name" };
        if (ws === undefined) return { type: "error", msg: "ws error" };
        while (this.players.some((player) => {
            return player.name === name;
        })) {
            name = `${name} ist dumm`;
        }
        this.players.push(new Player(uuid, ws, name, 0));
    }
    leave(ws, name) {

    }
    setGamesettings(settings) {

    }
    dealCards() {
    }
    getPlayer(uuid) {
        return this.players.find((player) => {
            return player.uuid === uuid;
        })
    }
    chat(uuid, message) {
        const { name } = this.getPlayer(uuid);
        this.players.forEach(player => {
            player.ws.send(JSON.stringify({
                type: 'chat',
                from: name,
                message: message
            }));
        })
    }
}
(function execTests() {
    const player = new Player("uuid", "test", "testName", 0);
    player.playerTests();
})();

const requestTypes = {
    newRoom: function (req, ws) {
        const { room, pw, name, uuid } = req;
        const gRoom = new GameRoom(room, pw);
        gRoom.join(uuid, ws, name);
        allRooms.push(gRoom);
    },
    chat: function (req, ws) {
        const { room, pw, message, uuid } = req;
        foundRoom = allRooms.find((thisRoom) => {
            return thisRoom.id === room && thisRoom.password === pw;
        });
        if (typeof foundRoom == "undefined")
            console.log("Invalid Room ID");
        else {
            foundRoom.chat(uuid, message);
        }


    },
    joinRoom: function (req, ws) {

    },
    playCards: function (req, ws) {

    }
}