module.exports = class Player {
    /**
     * @constructor
     * @param {string} uuid 
     * @param {WebSocket} ws 
     * @param {string} name 
     * @param {number} points 
     */
    constructor(uuid, ws, name, points) {
        this.uuid = uuid;
        this.ws = ws;
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
        this.ws.send(JSON.stringify({
            type: "yourCards",
            message: this.cards
        }))
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
    playerTests() {
        this.cards = ["sample", "bottom text"]
        const lv = this.cards.length;
        if (this.hasCard("sample") && !this.hasCard("nicht enthalten")) console.log("HasCard success");
        if (this.playCard("sample") && this.cards[0] !== "sample") console.log("Playcard success");

    }
}
