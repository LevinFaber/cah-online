module.exports = class Player {
    /**
     * @constructor
     * @param {string} uuid 
     * @param {WebSocket} ws 
     * @param {string} name 
     * @param {number} points 
     */
    constructor(uuid, socket, name, points) {
        console.log({uuid, socket, name, points})
        this.uuid = uuid;
        this.socket = socket;
        this.name = name;
        this.points = points;
        this.cards = [];
    }
    /**
     * Adds an array of cards to the players current Hand
     * @param {Array} newCard 
     */

    dealCards(newCards) {
        this.cards = [...this.cards, ...newCards];
        this.socket.emit('yourCards', this.cards);
    }
    /**
     * Adds the points to the player
     * @param {number} points 
     */
    getPoints(points) {
        this.points = this.points + points;
    }
    /**
     * Checks whether player has card with text
     * @param {string} text 
     */
    hasCard(text) {
        return this.cards.some((card) => {
            return card === text;
        })
    }
    /**
     * Remove card from players hand, return true if he has this card, false if he doesnt
     * @param {string} textArray 
     */
    playCards(textArray) {
        if (textArray.every(card => this.hasCard(card))) {
            this.cards = this.cards.filter((card) => {
                return !textArray.some(cardR => card === cardR);
            })
            return textArray;
        } else {
            return ["false"];
        }
    }
}
