<template>
  <v-dialog
    v-model="dialogData.show"
  >
    <v-card>
      <v-card-title>
        <div class="headline">
          {{ dialogData.headline }}
        </div>
      </v-card-title>
        <v-layout
          row>
          <v-flex xs12 md4 :key="result.uuid" v-for="(result, index) in dialogData.data">
            <v-card v-bind:color="color(index)" height="100%">
              <v-layout
                column
                class="result-card"
              >
                <v-card-title>
                  <div :key="part" v-for="part in result.text" class="headline">
                    {{ part }} 
                  </div>
                </v-card-title>
                <v-card-text> 
                  Points: {{ result.points }}
                </v-card-text>
              </v-layout>
            </v-card>
          </v-flex>
        </v-layout>
      <v-card-actions>
        <v-card-text v-if="dialogData.newGame">New Game?</v-card-text>
        <v-spacer></v-spacer>
        <v-btn
          outline
          @click="dialogData.show = false"
        >
          OK
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'Dialog',
  props: {
    dialogData: Object
  },
  data() {
    return {
    }
  },
  methods: {
    color(index) {
      switch (index) {
        case 0:
          return "#FFEB3B";
        case 1: 
          return "#E0E0E0";
        case 2: 
          return "#F57C00";
        default:
          return "white";
      }
    }
  }
}
</script>

<style>
.flex {
  padding: 4px;
}
.result-card {
  height: 100%;
  justify-content: space-between;
}
.headline {
  width: 100%;
}
</style>
