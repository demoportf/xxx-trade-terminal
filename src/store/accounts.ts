import Vue from 'vue';
import { Module } from 'vuex';
import { IMainState, ITrade, IVAccount, IRAccount } from './types';

export interface IAccountsState {
  vaccounts: IVAccount[];
  raccounts: IRAccount[];
  trades: ITrade[];
  vaccount: IVAccount;
}

const accounts: Module<IAccountsState, IMainState> = {
  namespaced: true,
  state: {
    vaccounts: [],
    raccounts: [],
    trades: [],
    vaccount: {
      id: '',
      name: '',
      executor: '',
      raccount: '',
    },
  },
  mutations:  {
    SetVAccounts(state, vaccounts: IVAccount[]) {
      state.vaccounts = vaccounts;
    },
    SetRAccounts(state, raccounts: IRAccount[]) {
      state.raccounts = raccounts;
    },
    SetVAccountTrades(state, trades: ITrade[]) {
      Vue.set(state, 'trades', trades);
    },
    SetVAccount(state, vaccount: IVAccount) {
      Vue.set(state, 'vaccount', vaccount);
    },
    CreateTrade(state, trade: ITrade) {
      state.trades.push(trade);
    },
  },
  actions: {
    async GetVAccounts({commit}) {
      try {
        const vaccounts = await Vue.$cf.RPC({ method: 'GetVAccounts' });
        commit('SetVAccounts', vaccounts);
      } catch (error) {
        commit('SetError', error);
        throw error;
      }
    },
    async CreateVAccount({commit, dispatch}, newVAccount: any) {
      try {
        await Vue.$cf.RPC({ method: 'CreateVAccount', params: newVAccount });
      } catch (error) {
        commit('SetError', error);
        throw error;
      }
    },
    async DeleteVAccount({commit, dispatch}, accountId: string) {
      try {
        await Vue.$cf.RPC({ method: 'DeleteVAccount', params: { id: accountId } });
      } catch (error) {
        commit('SetError', error);
        throw error;
      }
    },
    async GetVAccountOrders({commit}) {
      try {
        const orders = await Vue.$cf.RPC({ method: 'GetVAccountOrders' });
      } catch (error) {
        commit('SetError', error);
        throw error;
      }
    },
    async GetVAccountTrades({commit}, accountId: string) {
      try {
        const trades = await Vue.$cf.RPC({ method: 'GetVAccountTrades', params: { account: accountId }});
        commit('SetVAccountTrades', trades);
      } catch (error) {
        commit('SetError', error);
        throw error;
      }
    },
   SubscribeVAccounts({state, commit, rootState}) {
    Vue.$cf.Subscribe(`vaccounts#${rootState.userId}`, ({data}) => {
      let vaccounts = state.vaccounts;
      if (data.command === 'create') {
        vaccounts.push(data.params);
        commit('SetVAccounts', vaccounts);
      }
      if (data.command === 'delete') {
        vaccounts = vaccounts.filter((vaccount) => vaccount.id !== data.params.id);
        commit('SetVAccounts', vaccounts);
      }
     });
    },
    UnsubscribeVAccounts({state, rootState}) {
      Vue.$cf.Unsubscribe(`vaccounts#${rootState.userId}`);
    },
    SubscribeAccountTrades({state, commit, rootState}) {
      Vue.$cf.Subscribe(`trades:${state.vaccount.id}#${rootState.userId}`, ({data}) => {
        if (data.command === 'create') {
          commit('CreateTrade', data.params);
        }
      });
    },
    UnsubscribeAccountTrades({state, rootState}) {
      Vue.$cf.Unsubscribe(`trades:${state.vaccount.id}#${rootState.userId}`);
    },
    async GetRAccounts({commit}) {
      try {
        const raccounts = await Vue.$cf.RPC({ method: 'GetRAccounts' });
        commit('SetRAccounts', raccounts);
      } catch (error) {
        commit('SetError', error);
        throw error;
      }
    },
    SetVAccount({commit}, vaccount: any) {
       commit('SetVAccount', vaccount);
    },
  },
};

export default accounts;
