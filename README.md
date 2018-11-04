# cah-online

## ToDo:
- :iphone: Frontend :construction:
- :lock: Input validation / input cleaning
- :trophy: Declare Winner, Winner Screen
- :bookmark: Card-deck Selection

## Websocket Topics

### To Frontend: (maybe not current)

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
