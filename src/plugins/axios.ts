import Vue from 'vue';
import axios, { AxiosInstance } from 'axios';

const axiosPlugin = {
  install(vue: typeof Vue) {
    const instance = axios.create({
      baseURL: `${process.env.VUE_APP_BACKEND_API_URI ? process.env.VUE_APP_BACKEND_API_URI : ''}/`,
      timeout: 1000,
      headers: {'Content-Type': 'application/json'},
    });

    vue.$axios = instance;
  },
};
Vue.use(axiosPlugin);

declare module 'vue/types/vue' {
  interface VueConstructor {
    $axios: AxiosInstance;
  }
}
