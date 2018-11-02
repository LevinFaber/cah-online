<template>
  <v-app>
    <title-bar title="" 
    :roomName="roomName" 
    :roomPw="roomPw" 
    :userName="userName"></title-bar>
    <v-content>
      <v-layout
        id="content"
        row
        wrap
      >
        <v-flex xs12>
          <v-card>
            <control v-bind:uuid="uuid" v-show="!isConnected"></control>
          </v-card> 
            <game v-show="isConnected" :game="{userName: userName, roomName: roomName, roomPw: roomPw}"></game>
        </v-flex>
      </v-layout>
    </v-content>
  </v-app>
</template>

<script>
import TitleBar from './components/TitleBar'
import Control from './components/Control'
import Game from './components/Game'

export default {
  name: 'App',
  components: {
    TitleBar, Control, Game
  },
  data () {
    return {
      title: "cards.levin.pw",
      isConnected: false,
      userName: '',
      roomName: '',
      roomPw: '',
      uuid: this.generateUUID()
    }
  },
  methods: {
    generateUUID: () => ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c => (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16))
  },
  sockets: {
    connect() {
      console.log("%c Successesfully established Websocket Connection!!", "color: green");
    },
    error_msg(data) {
      console.error(data.message);
    },
    chat(data) {
      console.log(`Chat from ${data.from}: "${data.message}"`)
    },
    confirmJoin(data) {
      this.$data.isConnected = true;
      this.$data.roomName = data.roomName;
      this.$data.roomPw = data.roomPw;
      this.$data.userName = data.userName;
    }
  }
}
</script>

<style lang="scss" scoped>
#content {
  padding: 11px;

  .flex {
    padding: 4px;
  }
}
</style>

