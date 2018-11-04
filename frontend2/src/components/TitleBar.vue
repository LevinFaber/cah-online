<template>
  <v-toolbar app id="toolbar" height="80px">
    <v-toolbar-title class="headline" @click="darkMode = !darkMode" v-text="title"> {{ title }}</v-toolbar-title>
  <v-spacer></v-spacer>
</v-toolbar>
</template>

<script>
import Control from './Control'
export default {
  name: 'TitleBar',
  props: {
    roomName: String,
    roomPw: String,
    userName: String
  },
  components: {
    Control
  },
  data () {
    return {
      title: "cards.levin.pw"
    }
  }
}
</script>

<style>
</style>
