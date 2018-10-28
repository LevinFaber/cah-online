# cah-online

## Websocket Topics

### To Frontend: 

- yourCards
    - message: Array of your Cards
- error 
    - message: Error Message
- allPlayers:
    - message: All players, Array of {name, points}
- roundStart: 
    - message: Round Number
- chat: 
    - message: {from, messsage}

### To Backend

- newRoom:
    - message: { room, pw, name, uuid}
- joinRoom: 
    - message: { room, pw, name, uuid}
- chat: 
    - message: { room, pw, message, uuid}
- playCard:
    - message: { room, pw, text, uuid, roundID}
- startRound: 
    - message: { room, pw }