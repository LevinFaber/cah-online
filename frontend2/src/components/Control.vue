<template>
  <v-container>
    <v-form>
      <v-text-field
        :error="userError"
        :error-messages="userErrorMsg"
        outline
        v-model="userName"
        label="Name"
      ></v-text-field>
      <v-text-field
        :error="roomError"
        outline
        v-model="roomName"
        label="Room Name"
      ></v-text-field>
      <v-text-field
        :error="roomError"
        :error-messages="roomErrorMsg"
        outline
        v-model="roomPw"
        label="Room Password"
      ></v-text-field>
      <v-btn
        outline
        v-on:click="join"
      >Join</v-btn>
      <v-btn
        outline
        v-on:click="create"
      >Create</v-btn>
    </v-form>
  </v-container>
</template>

<script>
export default {
  name: 'Control',
  props: {
    uuid: String
  },
  data() {
    return {
      userName: '',
      roomName: '',
      roomPw: '',
      roomError: false,
      roomErrorMsg: '',
      userError: false,
      userErrorMsg: '',      
    }
  },
  created() {
    const urlParams = new URLSearchParams(window.location.search);
    this.$data.roomName = urlParams.get('room');
    this.$data.roomPw= urlParams.get('pw');
  },
  methods: {
    emit(topic, data) {
      this.$socket.emit(topic, {
        room: this.$data.roomName,
        pw: this.$data.roomPw,
        uuid: this.uuid,
        ...data
      })
    },
    join() {
      this.emit('joinRoom', {name: this.$data.userName})
    },
    create() {
      this.emit('newRoom', { name: this.$data.userName});
    }
  },
  sockets: {
    error_msg_room(data) {
      this.$data.roomError = true;
      this.$data.roomErrorMsg = [...this.$data.roomErrorMsg, data.message];
      console.error(data.message);
    },
    error_msg_user(data) {
      this.$data.userError = true;
      this.$data.userErrorMsg = [...this.$data.userErrorMsg, data.message];
      console.error(data.message);
    },
  }
}
</script>

