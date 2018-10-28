const express = require('express');
const WebSocket = require('ws');
const path = require('path');
const { blackCards, whiteCards } = require('./cards/cards');
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
        console.log('received: %s', data);
        const request = JSON.parse(data.message);
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
        this.ws.send(JSON.stringify({
            type: "yourCards",
            message: this.cards
        }))
    }
    win() {
        this.points++;
    }
    hasCard(text) {
        return this.cards.some((card) => {
            return card === text;
        })
    }
    playCard(text) {
        if (this.hasCard(text)) {
            this.cards = this.cards.filter((card) => {
                return card !== text;
            })
            return true;
        } else {
            return false;
        }
    }
    playerTests() {
        this.cards = ["sample", "bottom text"]
        const lv = this.cards.length;
        //this.dealCards([{ id: 4, text: "meme" }, { id: 5, text: "Kartentext" }]);
        if (this.cards.length === (lv + 2)) console.log("DealCards successs");
        if (this.hasCard("sample") && !this.hasCard("nicht enthalten")) console.log("HasCard success");
        if (this.playCard("sample") && this.cards[0] !== "sample") console.log("Playcard success");

    }
}
class GameRoom {
    constructor(id, password) {
        this.id = id;
        this.pw = password;
        this.players = [];
        this.rounds = {};
        this.counter = 0;
        this.acceptPlays = false;
        this.running = false;
    }
    get password() {
        return this.pw;
    }
    join(uuid, ws, name) {
        if (typeof name !== "string") return { type: "error", message: "no name" };
        if (ws === undefined) return { type: "error", message: "ws error" };
        while (this.players.some((player) => {
            return player.name === name;
        })) {
            name = `${name} ist dumm`;
        }
        this.players.push(new Player(uuid, ws, name, 0));
        const frontendPlayers = this.players.map(player => {
            return { name: player.name, points: player.points }
        })
        this.players.forEach(player => {
            player.ws.send(JSON.stringify({
                type: "allplayers",
                message: frontendPlayers
            }))
        })
    }
    leave(uuid) {
        players = players.filter((player) => {
            return player.uuid !== uuid;
        })
    }
    startRound() {
        if (running) return
        // Verteile Karten an spieler
        const amountOfCards = couplayRoundnt === 0 ? 8 : 1;
        this.players.forEach(player => {
            for (let i = 0; i <= amountOfCards; i++) {
                player.dealCards(whiteCards[Math.round(Math.random() * whiteCards.length)]);
            }
        });
        // Speichere die Lösungen mit UUID in rounds
        this.acceptPlays = true;
        this.players.forEach(player => {
            player.ws.send(JSON.stringify({
                type: "roundStart",
                message: this.counter
            }))
        })
        // Alle voten...

        // Winner Incrementiern

        //Nächste runde, wenn counter
    }
    collectResults(uuid, roundID, text) {
        if (this.acceptPlays) {
            this.rounds[roundID][uuid] = text;
        }
        this.players.every(player => {
            return this.rounds[this.counter][player.uuid] !== undefined
        })
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
                message: { from: name, message: message }
            }));
        })
    }
}
(function execTests() {
    const player = new Player("uuid", "test", "testName", 0);
    player.playerTests();
})();

function findRoom(roomID, password) {
    if (password === false) {
        return allRooms.find((thisRoom) => {
            return thisRoom.id === roomID;
        });
    } else {
        return allRooms.find((thisRoom) => {
            return thisRoom.id === roomID && thisRoom.password === password;
        });
    }
}
function error(ws, message) {
    ws.send(JSON.stringify({
        type: "error",
        message: message
    }))
}
const requestTypes = {
    newRoom: function (req, ws) {
        const { room, pw, name, uuid } = req;
        if (findRoom(room, false) !== undefined) {
            error(ws, "Roomname Already exists");
            return;
        }
        const gRoom = new GameRoom(room, pw);
        gRoom.join(uuid, ws, name);
        allRooms.push(gRoom);
    },
    joinRoom: function (req, ws) {
        const { room, pw, name, uuid } = req;
        foundRoom = findRoom(room, pw);
        if (typeof foundRoom == "undefined") {
            error(ws, "No Room found, or Password Incorrect");
        }
        else {
            foundRoom.join(uuid, ws, name);
        }
    },
    chat: function (req, ws) {
        const { room, pw, message, uuid } = req;
        foundRoom = findRoom(room, pw);
        if (typeof foundRoom == "undefined") {
            console.log("Invalid Room ID");
            error(ws, "Invalid Room ID");
        }
        else {
            foundRoom.chat(uuid, message);
        }
    },
    playCard: function (req, ws) {
        const { room, pw, text, uuid, roundID } = req;
        foundRoom = findRoom(room, pw);
        if (typeof foundRoom == "undefined") {
            console.log("Invalid Room ID");
            error(ws, "Room doesnt exsit");
        }
        else {
            foundRoom.collectResults(uuid, roundID, text);
        }
    },
    startRound: function (req, ws) {
        const { room, pw } = req;
        foundRoom = findRoom(room, pw);
        if (typeof foundRoom == "undefined") {
            console.log("Invalid Room ID");
            error(ws, "Invalid Room ID");
        } else {

        }
    }
}