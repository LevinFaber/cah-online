const { blackCards, whiteCards } = require('../cards/cards');
const Player = require('./player');

module.exports = class GameRoom {
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
    /**
     * Adds a new player with this uuid, ws and name, informs all players
     * @param {string} uuid new Player
     * @param {WebSocket} ws 
     * @param {string} name 
     */
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
    /**
     * Remove player with uuid from players
     * @param {string} uuid 
     */
    leave(uuid) {
        players = players.filter((player) => {
            return player.uuid !== uuid;
        })
    }
    startRound(next) {
        if (this.currentRound !== 0 && !next) return;
        console.log(`Starting round ${this.currentRound}`)
        this.running = true;
        // Verteile Karten an Spieler
        const amountOfCards = this.currentRound === 0 ? 8 : this.rounds[this.currentRound - 1].blackCard.pick;
        this.players.forEach(player => {
            let newCards = []
            for (let i = 0; i < amountOfCards; i++) {
                newCards = [...newCards, whiteCards[Math.round(Math.random() * whiteCards.length)]];
            }
            player.dealCards(newCards);
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
            textArray = textArray.slice(0, this.rounds[this.currentRound].blackCard.pick);
            this.rounds[this.currentRound][uuid] = {};
            this.rounds[this.currentRound][uuid].answer = this.getPlayer(uuid).playCards(textArray);
        }
        if (this.allPlayed()) {
            // TODO: Remove the Played Cards
            console.log("Everybody played, ", this.rounds);
            this.acceptPlays = false;
            this.startVote();
        }
    }
    /**
     * Initiates voting process
     */
    startVote() {
        console.log("start vote")
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
    /**
     * Accepts an array of votes from uuid
     * @param {Array} vote 
     * @param {string} uuid 
     */
    collectVote(vote, uuid) {
        if (!this.acceptVotes) return;
        this.rounds[this.currentRound][uuid].vote = vote;

        if (this.allVoted()) {
            console.log("Everybody voted, ", this.rounds);
            this.acceptVotes = false;
            this.endRound();
        }
    }
    /**
     * Ends the round, does cleanup
     */
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
            this.startRound(true);
        } else {
            // Clear State
            // TODO Declare winner
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
        })
    }
    /**
     * Send Message from UUID (Name) to all players
     * @param {string} uuid 
     * @param {string} message 
     */
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