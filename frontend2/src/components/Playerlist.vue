<template>
  <v-data-table
    :items="players"
    :headers="headers"
    hide-actions
    must-sort
    class="elevation-1"
  >
    <template slot="items" slot-scope="props">
      <td><v-icon v-show="props.item.czar">speaker_notes</v-icon></td>
      <td class="text-xs-right">{{ props.item.name }}</td>
      <td class="text-xs-right">{{ props.item.points }}</td>
    </template>
  </v-data-table>
</template>

<script>
export default {
  name: 'Playerlist',
  props: {
    uuid: String
  },
  data() {
    return {
    headers: [
        {value: "player", sortable: false, text: "Players"},
        {value: "points", sortable: true, text: "Points"}
    ],
    players: []
    }
  },
  sockets: {
    allPlayers(data) {
        this.$data.players = data;
    },
  }
}
</script>


