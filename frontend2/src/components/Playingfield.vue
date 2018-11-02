<template>
  <div>
    <v-layout
      v-show="isRunning"
      row
      wrap
    >
      <v-flex xs2>
        <v-card
          color="black"
          class="white--text"
          >
          <v-card-title primary-title>
            <div class="headline">{{ blackCard.text }}</div>
          </v-card-title>
          <v-card-text>
            <span class="text-xs-right">{{ blackCard.pick}}</span>
          </v-card-text>
        </v-card>
      </v-flex>
      <v-flex :key="card" v-for="card in yourPlayedCards" xs2>
        //yourPlayedCards
          <v-card color="pink" height="220px"> 
              <v-card-title>
                <div class="headline">{{card}}</div>
              </v-card-title>
          </v-card>
      </v-flex>
      <v-flex :key="card" v-for="card in playedCards" xs2>
        //yourPlayedCards
          <v-card color="pink" height="220px"> 
              <v-card-title>
                <div class="headline">{{card}}</div>
              </v-card-title>
          </v-card>
      </v-flex>
      <v-flex xs12>
        <v-layout 
          row
          wrap
        >
          <v-flex xs2 v-for="card in yourCards" :key="card">
            <v-card height="220px"> 
              <v-card-title>
                <div class="headline">{{card}}</div>
              </v-card-title>
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
  </div>
</template>

<script>
export default {
  name: 'Playingfield',
  props: {
    game: Object
  },
  data() {
    return {
      roundNr: 0,
      yourCards: [],
      yourPlayedCards: [],
      playedCards: [],
      blackCard: {},
      allCards: [{}],
      isRunning: false
    }
  },
  methods: {
    emit(topic, data) {
      this.$socket.emit(topic, {
        room: this.$data.roomName,
        pw: this.$data.roomPw,
        uuid: this.uuid,
        ...data
      });
    },
    startGame() {
      console.log("StartGame");
      this.emit("startRound", {room: this.game.roomName, pw: this.game.roomPw});
    }
  },
  sockets: {
    roundStart(data) {
      this.$data.isRunning = true;
      const { roundNr, blackCard } = data;
      this.$data.blackCard = blackCard;
      this.$data.roundNr = roundNr;
    },
    yourCards(data) {
      this.$data.yourCards = data;
    }
  }
}
</script>

<style lang="scss" scoped>
.flex {
  padding: 8px;
}
</style>

