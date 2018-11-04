<template>
  <div>
    <v-layout
      v-show="isRunning"
      row
      wrap
    >
      <v-flex xs2 class="black-card">
        <v-card
        color="black"
        class="white--text"
        >
        <v-card-title primary-title>
        <div class="headline">{{ blackCard.text }}</div>
        </v-card-title>
        <v-card-text>
        <span class="text-xs-right">{{ blackCard.pick }}</span>
        </v-card-text>
        </v-card>
      </v-flex>
      <v-flex v-if="yourPlayedCards.length > 0" xs2>
          <v-card color="pink" height="220px"> 
              <v-card-text :key="card" v-for="card in yourPlayedCards">
                <div :class="{headline: yourPlayedCards.length<2}">{{card}}</div>
              </v-card-text>
          </v-card>
      </v-flex>
      <v-flex :key="card.uuid" v-for="card in allPlayedCards" xs2>
          <v-card height="220px"> 
              <v-card-text :key="answer.toString()" v-for="answer in card.answer">
                <div :class="{headline: card.answer.length<2}">{{answer}}</div>
              </v-card-text>
              <v-btn
                flat
                @click="addVote(card.uuid)"
                v-show="mayVote"
              >
                Vote
              </v-btn>
          </v-card>
      </v-flex>
      <v-flex xs12>
        <v-layout 
          row
          wrap
        >
          <v-flex column xs2 v-for="card in yourCards" :key="card">
            <v-card 
              height="220px"
              > 
              <v-layout column class="yourCards">
              <v-card-title>
                <div class="headline">{{card}}</div>
              </v-card-title>
              
              <v-card-actions>
                <v-btn
                  v-show="mayPlay"
                  v-on:click="playCard(card)"
                  flat
                  >
                  Choose
                </v-btn>
              </v-card-actions>
              </v-layout>
            </v-card>
          </v-flex>
        </v-layout>
      </v-flex>
    </v-layout>
    <div class="text-xs-center" v-show="!isRunning">
      <v-btn
      outline
      v-on:click="startGame">
          Start Game
      </v-btn>
    </div>
    <Dialog :dialogData="dialogData"></Dialog>
  </div>
</template>

<script>
import Dialog from './Dialog'
export default {
  components: {
    Dialog
  },
  name: 'Playingfield',
  props: {
    game: Object
  },
  data() {
    return {
      roundNr: 0,
      yourCards: [],
      yourPlayedCards: [],
      allPlayedCards: [],
      blackCard: {},
      vote: [],
      dialogData: {},
      isRunning: false,
      mayPlay: true,
      mayVote: false,
    }
  },
  methods: {
    emit(topic, data) {
      console.log({
        room: this.game.roomName,
        pw: this.game.roomPw,
        uuid: this.game.uuid,
        ...data
      })
      this.$socket.emit(topic, {
        room: this.game.roomName,
        pw: this.game.roomPw,
        uuid: this.game.uuid,
        ...data
      });
    },
    playCard(card) {
      if (this.$data.yourPlayedCards.length < this.$data.blackCard.pick) {
        this.$data.yourPlayedCards = [...this.$data.yourPlayedCards, card];
        if (this.$data.yourPlayedCards.length === this.$data.blackCard.pick) {
          this.$data.mayPlay = false;
          this.emit('playCard', { 
            textArray: this.$data.yourPlayedCards,
            roundNr: this.$data.roundNr
            });
          return;
        }
      }
    },
    addVote(uuid) {
      if (this.$data.vote.length < this.$data.allPlayedCards.length) {
        this.$data.vote = [...this.$data.vote, uuid];
        if (this.$data.vote.length === this.$data.allPlayedCards.length) {
          this.$data.mayVote = false;
          this.emit('vote', 
            { 
              vote: this.$data.vote
            });
          return;
        }
      }
    },
    startGame() {
      console.log("StartGame");
      this.emit("startRound", {
        room: this.game.roomName, pw: this.game.roomPw
      });
    }
  },
  sockets: {
    roundStart(data) {
      console.log(data);
      this.$data.vote = [];
      this.$data.yourPlayedCards = [];
      this.$data.allPlayedCards = [];
      this.$data.mayPlay = true;
      this.$data.mayVote = false;
      this.$data.isRunning = true;
      const { roundNr, blackCard } = data;
      this.$data.blackCard = blackCard;
      this.$data.roundNr = roundNr;
    },
    roundEnd(data) {
      let resultData = Object.keys(data).map(key => {
        return { uuid: key, text: data[key].answer, points: data[key].points}
      });
      resultData = resultData.sort((a, b) => { 
        return b.points - a.points;
      })
      this.$data.dialogData = {
        show: true,
        headline: "Results",
        data: resultData
      };
    },
    yourCards(data) {
      this.$data.yourCards = data;
    },
    allAnswers(data) {
      Object.keys(data).forEach((key) => {
        if (key === this.game.uuid) {
          this.$data.yourPlayedCards = data[key].answer;
        }
        if (key !== "blackCard" && key !== this.game.uuid) {
          this.$data.allPlayedCards = [
            ...this.$data.allPlayedCards,
            {
              answer: data[key].answer,
              uuid: key
            }
          ];
        }
      })
      this.$data.mayVote = true;
    },
    gameEnd(data) {
      const players = data.sort((a,b) => b.points - a.points);
      const resultData = players.map(player => {
        return {
          text: [player.name],
          points: player.points
        }
      });
      this.$data.dialogData = {
        show: true,
        headline: "Game Over, Results:",
        data: resultData,
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.flex {
  padding: 8px;
  &.black-card {
    padding-left: 16px;
    padding-right: 4px;
    margin-right: 4px;
  }
}
.layout.yourCards {
  height: 100%;
  justify-content: space-between;
}
</style>

