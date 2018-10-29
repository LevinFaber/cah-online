const express = require('express');
const WebSocket = require('ws');
const path = require('path');
const { blackCards, whiteCards } = require('./cards/cards');
const app = express()
    .use(express.static('public'))
    .get('/app', (req, res) => {
        res.sendFile(path.join(__dirname, './public/index.html'));
    })
    .listen(process.env.PORT || 8000);
const wss = new WebSocket.Server({ server: app });

/***** End Static Server */
/***** Websocket Server */
wss.on('connection', function connection(ws, req) {
    console.log("WS Registration from ", req.connection.remoteAddress)
    ws.on('message', function incoming(data) {
        console.log('received: %s', data);
        const request = JSON.parse(data);
        requestTypes[request.type](request.message, ws);
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
    dealCard(newCard) {
        this.cards.push(newCard);
        this.ws.send(JSON.stringify({
            type: "yourCards",
            message: this.cards
        }))
    }
    getPoints(points) {
        this.points = this.points + points;
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
        if (this.hasCard("sample") && !this.hasCard("nicht enthalten")) console.log("HasCard success");
        if (this.playCard("sample") && this.cards[0] !== "sample") console.log("Playcard success");

    }
}
class GameRoom {
    constructor(id, password) {
        this.id = id;
        this.pw = password;
        this.players = [];
        this.rounds = [];
        this.currentRound = 0;
        this.acceptPlays = false;
        this.acceptVotes = false;
        this.running = false;
    }
    get password() {
        return this.pw;
    }
    join(uuid, ws, name) {
        this.players.push(new Player(uuid, ws, name, 0));
        const frontendPlayers = this.players.map(player => {
            return { name: player.name, points: player.points, uuid: player.uuid }
        });
        this.players.forEach(player => {
            player.ws.send(JSON.stringify({
                type: "allPlayers",
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
        if (this.currentRound !== 0) return;
        this.running = true;
        // Verteile Karten an spieler

        const amountOfCards = this.currentRound === 0 ? 8 : 1;
        this.players.forEach(player => {
            for (let i = 0; i <= amountOfCards; i++) {
                player.dealCard(whiteCards[Math.round(Math.random() * whiteCards.length)]);
            }
        });
        // Speichere die Lösungen mit UUID in rounds
        this.acceptPlays = true;
        this.rounds[this.currentRound] = {};
        this.rounds[this.currentRound].blackCard = blackCards[Math.round(Math.random() * blackCards.length)];
        this.players.forEach(player => {
            player.ws.send(JSON.stringify({
                type: "roundStart",
                message: {
                    roundNr: this.currentRound,
                    blackCard: this.rounds[this.currentRound].blackCard,
                }
            }))
        });
        console.info("Send Round details, listening for Results.")
        // Alle voten...

        // Winner Incrementiern

        //Nächste runde, wenn counter
    }
    collectResults(uuid, roundNr, text) {
        if (this.acceptPlays && this.currentRound == roundNr) {
            console.info(`Got ${text} from ${uuid}`);
            this.rounds[this.currentRound][uuid] = {};
            this.rounds[this.currentRound][uuid].answer = text;
        }
        if (this.allPlayed()) {
            console.log("Everybody played, ", this.rounds);
            this.acceptPlays = false;
            this.startVote();
        }
    }
    startVote() {
        const round = this.rounds[this.currentRound];
        const data = JSON.stringify({
            type: "allAnswers",
            message: round
        })
        this.players.forEach(player => {
            player.ws.send(data);
        })
        this.acceptVotes = true;
    }
    collectVote(vote, uuid) {
        if (!this.acceptVotes) return;
        this.rounds[this.currentRound][uuid].vote = vote;

        if (this.allVoted()) {
            console.log("Everybody voted, ", this.rounds);
            this.acceptVotes = false;
            this.endRound();
        }
    }
    endRound() {
        const round = this.rounds[this.currentRound];
        Object.keys(round).forEach((key) => {
            if (key !== "blackCard") {
                for (let i = 0; i < round[key].vote.length; i++) {
                    const player = this.getPlayer(round[key].vote[i]);
                    player.getPoints(round[key].vote.length - i);
                }
            }
        });
        const frontendPlayers = this.players.map(player => {
            return { name: player.name, points: player.points, uuid: player.uuid }
        });
        this.players.forEach(player => {
            player.ws.send(JSON.stringify({ type: "allPlayers", message: frontendPlayers }));
        })
        if (this.currentRound <= 9) {
            this.currentRound++;
            this.startRound();
        } else {
            // Clear State
            this.running = false;
            this.rounds = {};
        }
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
    allPlayed() {
        return this.players.every(player => {
            if (this.rounds[this.currentRound][player.uuid] === undefined)
                return false;
            else if (this.rounds[this.currentRound][player.uuid].answer === undefined)
                return false;
            else
                return true;
        })
    }
    allVoted() {
        return this.players.every(player => {
            if (this.rounds[this.currentRound][player.uuid] === undefined)
                return false;
            else if (this.rounds[this.currentRound][player.uuid].vote === undefined)
                return false;
            else
                return true;
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
        if (typeof name !== "string") error(ws, "no name");
        if (ws === undefined) error(ws, "ws error");
        foundRoom = findRoom(room, pw);
        if (typeof foundRoom == "undefined") {
            error(ws, "No Room found, or Password Incorrect");
        } else if (foundRoom.players.some(player => player.uuid === uuid)) {
            error(ws, "You are already Playing");
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
        const { room, pw, text, uuid, roundNr } = req;
        foundRoom = findRoom(room, pw);
        if (typeof foundRoom == "undefined") {
            console.log("Invalid Room ID");
            error(ws, "Room doesnt exsit");
        }
        else {
            foundRoom.collectResults(uuid, roundNr, text);
        }
    },
    startRound: function (req, ws) {
        const { room, pw } = req;
        foundRoom = findRoom(room, pw);
        if (typeof foundRoom == "undefined") {
            console.log("Invalid Room ID");
            error(ws, "Invalid Room ID");
        } else {
            foundRoom.startRound();
        }
    },
    vote: function (req, ws) {
        const { room, pw, vote, uuid } = req;
        foundRoom = findRoom(room, pw);
        if (typeof foundRoom == "undefined") {
            console.log("Invalid Room ID");
            error(ws, "Invalid Room ID");
        } else if (typeof vote.length === "undefined") {
            console.log("Invalid Vote from", uuid);
            error(ws, "Invalid Vote");
        } else {
            foundRoom.collectVote(vote, uuid);
        }
    }
}