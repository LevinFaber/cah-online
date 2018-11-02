<template>
  <v-layout
    row
    wrap
    id="game"
  >
    <v-flex xs8>
      //TODO Playingfield
      <playingfield :game="game"></playingfield>
    </v-flex>
    <v-flex xs4>
      <v-layout
        column
        fill-height="true"
      >
        <v-flex xs12 fill-height="true">
          <v-card>
            <playerlist></playerlist>
          </v-card>
        </v-flex>
          <v-flex xs12 fill-height="true">
            //TODO Chat
            <chat></chat>
            <v-card>
            </v-card>
          </v-flex>
        </v-layout>
    </v-flex>
  </v-layout>
</template>
<script>
import Playingfield from './Playingfield'
import Playerlist from './Playerlist'
import Chat from './Chat'
export default {
  name: 'Game',
  props: {
    game: Object
  },
  components: { Playerlist, Chat, Playingfield }
}
</script>
<style>
#game > .flex {
  padding: 4px;
}
.flex {
  padding-bottom: 4px;
}
</style>
