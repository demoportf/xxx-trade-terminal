import Vue from 'vue';
import Vuex, { StoreOptions } from 'vuex';
import { IMainState } from './types';
import terminal from './terminal';
import scripts from './scripts';
import strategies from './strategies';
import tests from './tests';
import accounts from './accounts';
import jwt_decode from 'jwt-decode';

Vue.use(Vuex);

export interface ILoginPayload {
  username: string;
  password: string;
}

const options: StoreOptions<IMainState> = {
  state: {
    connected: false,
    errors: [],
    userId: '',
  },
  getters: {
    lastError: (state) => {
      return state.errors.length > 0 ? state.errors[state.errors.length - 1] : '';
    },
    errorsCount: (state) => {
      return state.errors.length;
    },
  },
  mutations: {
    SetUserId(state, id: string) {
      state.userId = id;
    },
    SetConnected(state, connected: boolean) {
      state.connected = connected;
    },
    SetError(state, error: string) {
      state.errors.push(error);
    },
  },
  actions: {
    async Login({ commit }, payload: ILoginPayload) {
      try {
        const resp = await Vue.$axios.get(`/auth?user=${payload.username}&pass=${payload.password}`);
        const token = resp.data;
        localStorage.setItem('authToken', token);

      } catch (err) {
        if (err.response) {
          commit('SetError', err.response.data);
        } else {
          commit('SetError', err.message);
        }
        throw err;
      }
    },

    async Connect({ commit }) {

      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw Error('Auth token not found');
        }
        const data: any = jwt_decode(token);
        commit('SetUserId', data.sub);
        Vue.$cf.SetToken(token);
        Vue.$cf.RemoveAllListeners();
        Vue.$cf.On('connect', (ctx) => {
          commit('SetConnected', true);
        });
        Vue.$cf.On('disconnect', (ctx) => {
          commit('SetConnected', false);
        });

        return new Promise((resolve, reject) => {
          Vue.$cf.On('connect', (ctx) => {
            resolve(ctx);
          });
          Vue.$cf.On('disconnect', (ctx) => {
            reject();
          });
          Vue.$cf.Connect();
        });

      } catch (err) {
        commit('SetError', err.message);
        throw err;
      }
    },
    Logout({ commit }) {
      localStorage.removeItem('authToken');
      commit('SetConnected', false);
      Vue.$cf.Disconnect();
    },
  },

  modules: {
    terminal: terminal,
    scripts: scripts,
    strategies: strategies,
    tests: tests,
    accounts: accounts,
  },
};

export default new Vuex.Store<IMainState>(options);
