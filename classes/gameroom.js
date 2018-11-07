const { blackCards, whiteCards } = require('../cards/cards');
const Player = require('./player');

module.exports = class GameRoom {
  constructor(id, password, io) {
    this.blackCards = blackCards;
    this.whiteCards = whiteCards;
    this.io = io;
    this.id = id;
    this.pw = password;
    this.players = [];
    this.rounds = [];
    this.currentRound = 0;
    this.currentCzar = 0;
    this.acceptPlays = false;
    this.acceptVotes = false;
    this.running = false;
  }
  get password() {
    return this.pw;
  }
  /**
   * Adds a new player with this uuid, ws and name, informs all players
   * @param {string} uuid new Player
   * @param {WebSocket} ws
   * @param {string} name
   */
  join(uuid, socket, name) {
    console.log(uuid)
    const existingPlayer = this.getPlayer(uuid);
    console.log(existingPlayer)
    if (typeof existingPlayer === "undefined") {
      this.players.push(new Player(uuid, socket, name, 0));
    } else {
      existingPlayer.socket = socket;
    }
    const frontendPlayers = this.frontendPlayers();
    socket.join(this.id);
    this.io.to(this.id).emit('allPlayers', [...frontendPlayers]);
  }
  /**
   * Remove player with uuid from players
   * @param {string} uuid
   */
  leave(uuid) {
    players = players.filter((player) => {
      return player.uuid !== uuid;
    });
    const frontendPlayers = this.players.map((player) => {
      return { name: player.name, points: player.points, uuid: player.uuid };
    });
    this.socket.to(this.id).emit('allPlayers', [...frontendPlayers]);
  }
  startRound(next) {
    if (this.currentRound !== 0 && !next) return;
    // Choose Czar
    this.players[this.currentCzar].isCzar = true;
    this.currentCzar = this.currentCzar + 1;
    if (this.currentCzar > this.players.length) {
      this.currentCzar = 0;
    }
    this.frontendPlayers = this.frontendPlayers();
    this.io.to(this.id).emit('allPlayers', [...frontendPlayers]);
    console.log(`Starting round ${this.currentRound}`);
    this.running = true;
    // Verteile Karten an Spieler
    const amountOfCards =
      this.currentRound === 0
        ? 8
        : this.rounds[this.currentRound - 1].blackCard.pick;
    this.players.forEach((player) => {
      let newCards = [];
      for (let i = 0; i < amountOfCards; i++) {
        const whiteCardIndex = Math.round(
          Math.random() * this.whiteCards.length
        );
        newCards = [...newCards, this.whiteCards[whiteCardIndex]];
        this.whiteCards = [
          ...this.whiteCards.slice(0, whiteCardIndex),
          ...this.whiteCards.slice(whiteCardIndex + 1)
        ];
      }
      player.dealCards(newCards);
    });
    // Speichere die Lösungen mit UUID in rounds
    this.acceptPlays = true;
    this.rounds[this.currentRound] = {};
    const blackCardIndex = Math.round(Math.random() * this.blackCards.length);
    this.rounds[this.currentRound].blackCard = this.blackCards[blackCardIndex];
    this.blackCards = [
      ...this.blackCards.slice(0, blackCardIndex),
      ...this.blackCards.slice(blackCardIndex + 1)
    ];
    this.io.to(this.id).emit('roundStart', {
      roundNr: this.currentRound,
      blackCard: this.rounds[this.currentRound].blackCard
    });
    console.info('Send Round details, listening for Results.');
  }
  /**
   * Accepts uuid, roundNr, and text of played card
   * @param {string} uuid
   * @param {number} roundNr
   * @param {string} textArray
   */
  collectResults(uuid, roundNr, textArray) {
    if (!this.acceptPlays) return;
    if (this.currentRound == roundNr) {
      console.info(`Got ${textArray} from ${uuid}`);
      console.log(this.rounds[this.currentRound].blackCard.pick);
      textArray = textArray.slice(
        0,
        this.rounds[this.currentRound].blackCard.pick
      );
      this.rounds[this.currentRound][uuid] = {};
      this.rounds[this.currentRound][uuid].answer = this.getPlayer(
        uuid
      ).playCards(textArray);
    }
    if (this.allPlayed()) {
      console.log('Everybody played, ', this.rounds);
      this.acceptPlays = false;
      this.startVote();
    }
  }
  /**
   * Initiates voting process
   */
  startVote() {
    console.log('start vote');
    const round = this.rounds[this.currentRound];
    this.io.to(this.id).emit('allAnswers', { ...round });
    this.acceptVotes = true;
  }
  /**
   * Accepts an array of votes from uuid
   * @param {Array} vote
   * @param {string} uuid
   */
  collectVote(vote, uuid) {
    if (!this.acceptVotes) return;
    this.rounds[this.currentRound][uuid].vote = vote;
    if (this.allVoted()) {
      console.log('Everybody voted, ', this.rounds);
      this.acceptVotes = false;
      this.endRound();
    }
  }
  /**
   * Ends the round, does cleanup
   */
  endRound() {
    const round = this.rounds[this.currentRound];
    let thisRoundsOutcome = {};
    Object.keys(round).forEach((key) => {
      if (key !== 'blackCard') {
        for (let i = 0; i < round[key].vote.length; i++) {
          console.log(round[key].vote[i]);
          const player = this.getPlayer(round[key].vote[i]);
          const points = round[key].vote.length - i;
          player.getPoints(points);
          if (typeof thisRoundsOutcome[round[key].vote[i]] === 'undefined') {
            thisRoundsOutcome[round[key].vote[i]] = {};
            thisRoundsOutcome[round[key].vote[i]].answer =
              round[round[key].vote[i]].answer;
            thisRoundsOutcome[round[key].vote[i]].points = points;
          } else {
            thisRoundsOutcome[round[key].vote[i]].points =
              thisRoundsOutcome[round[key].vote[i]].points + points;
          }
        }
      }
    });
    console.log({ thisRoundsOutcome });
    this.io.to(this.id).emit('roundEnd', thisRoundsOutcome);
    const frontendPlayers = this.frontendPlayers();
    this.io.to(this.id).emit('allPlayers', [...frontendPlayers]);
    if (this.currentRound <= 3) {
      this.currentRound++;
      this.startRound(true);
    } else {
      // Clear State
      // TODO Declare winner
      this.io.to(this.id).emit('gameEnd', frontendPlayers);
      this.running = false;
      this.rounds = {};
    }
  }
  /**
   * Return player with matching uuid
   * @param {string} uuid
   */
  getPlayer(uuid) {
    return this.players.find((player) => {
      return player.uuid === uuid;
    });
  }
  /**
   * Send Message from UUID (Name) to all players
   * @param {string} uuid
   * @param {string} message
   */
  chat(uuid, message) {
    const { name } = this.getPlayer(uuid);
    this.io.to(this.id).emit('chat', { from: name, message: message });
  }
  allPlayed() {
    return this.players.every((player) => {
      if (this.rounds[this.currentRound][player.uuid] === undefined)
        return false;
      else if (this.rounds[this.currentRound][player.uuid].answer === undefined)
        return false;
      else return true;
    });
  }
  allVoted() {
    return this.players.every((player) => {
      if (this.rounds[this.currentRound][player.uuid] === undefined)
        return false;
      else if (this.rounds[this.currentRound][player.uuid].vote === undefined)
        return false;
      else return true;
    });
  }
  frontendPlayers() {
    const frontendPlayers = this.players.map((player) => {
      return {
        name: player.name,
        points: player.points,
        uuid: player.uuid,
        czar: player.isCzar
      };
    });
    return frontendPlayers;
  }
};
