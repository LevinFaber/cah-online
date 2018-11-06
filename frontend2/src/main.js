import Vue from "vue";
import "./plugins/vuetify";
import App from "./App.vue";
import "./registerServiceWorker";
import VueSocketio from "vue-socket.io-extended";
import io from "socket.io-client";

Vue.use(VueSocketio, io());
Vue.config.productionTip = false;

new Vue({
  render: h => h(App)
}).$mount("#app");
