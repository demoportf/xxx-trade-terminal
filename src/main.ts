import Vue from 'vue';
import App from './App.vue';
import '@/plugins';
import router from './router';
import vuetify from './plugins/vuetify';
import store from './store';

Vue.config.productionTip = false;

Vue.$log.info(`BACKEND API: ${process.env.VUE_APP_BACKEND_API_URI}`);
Vue.$log.info(`BACKEND SOCKET API: ${process.env.VUE_APP_BACKEND_SOCKET_URI}`);

new Vue({
  router,
  store,
  vuetify,
  render: (h) => h(App),
}).$mount('#app');
