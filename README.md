# cah-online

## ToDo:
- Frontend (Vue, react etc?)
- Inputvalidation / cleaning (start game only once)
- Removing played cards
- Stop game and declare winner on round limit
- Pack Selection

## Websocket Topics

### To Frontend: 

- yourCards
    - message: Array of your Cards
- error 
    - message: Error Message
- allPlayers:
    - message: All players, Array of {name, points, uuid}
- roundStart: 
    - message: { roundNr, blackCard }
- chat: 
    - message: {from, messsage}
- allAnswers: 
    - message: Array of Arrays of Text

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
- vote: 
    - message: { room, pw, vote }