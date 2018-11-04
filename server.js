const express = require('express');
const http = require('http');
//const WebSocket = require('ws');
const path = require('path');
const socket = require('socket.io');
const GameRoom = require('./classes/gameroom');

const app = express()
  .use(express.static('public'))
  .get('/app', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
  });

const server = http.Server(app);
const io = socket(server);
io.on('connection', function(socket) {
  function error(message) {
    socket.emit('error_msg', { message });
  }
  function errorUser(message) {
    socket.emit('error_msg_user', { message });
  }
  function errorRoom(message) {
    socket.emit('error_msg_room', { message });
  }
  console.log('A user connected.');
  socket.on('newRoom', function(data) {
    const { room, pw, name, uuid } = data;
    if (findRoom(room, false) !== undefined) {
      errorRoom('Roomname Already exists');
      return;
    }
    const gRoom = new GameRoom(room, pw, io);
    gRoom.join(uuid, socket, name);
    socket.emit('confirmJoin', {
      roomName: room,
      roomPw: pw,
      userName: name
    });
    allRooms.push(gRoom);
  });
  socket.on('joinRoom', function(data) {
    const { room, pw, name, uuid } = data;
    if (typeof name !== 'string' || name === '') {
      errorUser('You cant play without a name.');
      return;
    }
    foundRoom = findRoom(room, pw);
    if (typeof foundRoom == 'undefined') {
      errorRoom('No Room found, or Password Incorrect');
    } else if (foundRoom.players.some((player) => player.uuid === uuid)) {
      errorUser('You are already Playing');
    } else {
      foundRoom.join(uuid, socket, name);
      socket.emit('confirmJoin', {
        roomName: room,
        roomPw: pw,
        userName: name
      });
    }
  });
  socket.on('chat', function(data) {
    const { room, pw, message, uuid } = data;
    foundRoom = findRoom(room, pw);
    if (typeof foundRoom == 'undefined') {
      console.log('Invalid Room ID');
      errorRoom('Invalid Room ID');
    } else {
      foundRoom.chat(uuid, message);
    }
  });
  socket.on('playCard', function(data) {
    const { room, pw, textArray, uuid, roundNr } = data;
    console.log('playcard', data);
    foundRoom = findRoom(room, pw);
    if (typeof foundRoom == 'undefined') {
      console.log('Invalid Room ID');
      errorRoom('Room doesnt exsit');
    } else {
      foundRoom.collectResults(uuid, roundNr, textArray);
    }
  });
  socket.on('startRound', function(data) {
    const { room, pw } = data;
    foundRoom = findRoom(room, pw);
    if (typeof foundRoom == 'undefined') {
      console.log('Invalid Room ID');
      error('Invalid Room ID');
    } else {
      foundRoom.startRound();
    }
  });
  socket.on('vote', function(data) {
    const { room, pw, vote, uuid } = data;
    foundRoom = findRoom(room, pw);
    if (typeof foundRoom == 'undefined') {
      console.log('Invalid Room ID');
      error('Invalid Room ID');
    } else if (typeof vote.length === 'undefined') {
      console.log('Invalid Vote from', uuid);
      error('Invalid Vote');
    } else {
      console.log(vote);
      foundRoom.collectVote(vote, uuid);
    }
  });
});
server.listen(process.env.PORT || 8000, () => console.log('Server Listening'));
const allRooms = [];
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
