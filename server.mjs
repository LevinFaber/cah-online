import express from "express";
import WebSocket from "ws";
import path from "path";
import { GameRoom } from "./classes/gameroom"
const app = express()
    .use(express.static('public'))
    .get('/app', (req, res) => {
        res.sendFile(path.join(__dirname, './public/index.html'));
    })
    .listen(process.env.PORT || 8000);
const wss = new WebSocket.Server({ server: app });

wss.on('connection', function connection(ws, req) {
    console.log("WS Registration from ", req.connection.remoteAddress)
    ws.on('message', function incoming(data) {
        console.log('received: %s', data);
        const request = JSON.parse(data);
        requestTypes[request.type](request.message, ws);
    });
});
const allRooms = [];
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
/**
 * Find Room, return Room or Undefined
 * @param {string} roomID 
 * @param {string} password 
 */
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
/**
 * Send Error to Client
 * @param {WebSocket} ws 
 * @param {String} message 
 */
function error(ws, message) {
    ws.send(JSON.stringify({
        type: "error",
        message: message
    }))
}