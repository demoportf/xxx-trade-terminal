import Vue from 'vue';
import { Module } from 'vuex';
import { IMainState, IVAccount, ISymbol, IOrder, ITrade, IOhlcPayload } from './types';

interface ITerminalState {
  vaccounts: IVAccount[];
  vaccount: string;
  symbols: ISymbol[];
  orders: IOrder[];
  trades: ITrade[];
}

export interface ICancelPayload {
  account: string;
  order: string;
}

const terminal: Module<ITerminalState, IMainState> = {
  namespaced: true,
  state: {
    vaccounts: [],
    vaccount: '',

    symbols: [],
    orders: [],
    trades: [],
  },
  mutations:  {
    SetVAccounts(state, accounts: IVAccount[]) {
      state.vaccounts = accounts;
    },
    SetVAccount(state, account: string) {
      state.vaccount = account;
    },
    SetSymbols(state, symbols: ISymbol[]) {
      state.symbols = symbols;
    },
    SetSymbol(state, data: any) {
      const symbol = state.symbols.find((symbol) => symbol.ticker === data.ticker);
      if (symbol) {
        if (data.bid) {
          Vue.set(symbol, 'bid', data.bid);
        }
        if (data.ask) {
          Vue.set(symbol, 'ask', data.ask);
        }
      }
    },
    SetOrders(state, orders: IOrder[]) {
      state.orders = orders;
    },
    SetOrder(state, data: IOrder) {
      const order = state.orders.find((order) => order.id === data.id);
      if (order) {
        order.state = data.state;
        order.leaves = data.leaves;
        order.time = data.time;
      } else {
        state.orders.push(data);
      }
    },
    SetTrades(state, trades: ITrade[]) {
      state.trades = trades;
    },
    CreateTrade(state, trade: ITrade) {
      state.trades.push(trade);
    },

  },
  actions: {
    async GetSymbols({commit}) {
      try {
        const data = await Vue.$cf.RPC({ method: 'GetSymbols' });
        commit('SetSymbols', data);
      } catch (error) {
        commit('SetError', error, {root: true});
        throw error;
      }
    },
    async CreateSymbol({commit}, ticker: string) {
      try {
        await Vue.$cf.RPC({ method: 'CreateSymbol', params: { ticker: ticker } });
        Vue.$cf.Subscribe(`symbols:${ticker}`, ({data}) => {
          data.ticker = ticker;
          commit('SetSymbol', data);
        });
      } catch (error) {
        commit('SetError', error, {root: true});
        throw error;
      }
    },
    async DeleteSymbol({commit}, ticker: string) {
      try {
        await Vue.$cf.RPC({ method: 'DeleteSymbol', params: ticker });
        Vue.$cf.Unsubscribe(`symbols:${ticker}`);
      } catch (error) {
        commit('SetError', error, {root: true});
        throw error;
      }
    },
    SubscribeSymbols({state, commit, rootState}) {
      Vue.$cf.Subscribe(`symbols#${rootState.userId}`, ({data}) => {
        let symbols = state.symbols;
        if (data.command === 'create') {
          symbols.push(data.params);
          commit('SetSymbols', symbols);
        } else
        if (data.command === 'delete') {
          symbols = symbols.filter((symbol) => symbol.ticker !== data.params);
          commit('SetSymbols', symbols);
        }
      });
      state.symbols.forEach((symbol) => {
        Vue.$cf.Subscribe(`symbols:${symbol.ticker}`, ({data}) => {
          data.ticker = symbol.ticker;
          commit('SetSymbol', data);
        });
      });
    },
    UnsubscribeSymbols({state, rootState}) {
      state.symbols.forEach((symbol) => {
        Vue.$cf.Unsubscribe(`symbols:${symbol.ticker}`);
      });
      Vue.$cf.Unsubscribe(`symbols#${rootState.userId}`);
    },
    async GetVAccounts({commit}) {
      try {
        const data = await Vue.$cf.RPC({ method: 'GetVAccounts' });
        commit('SetVAccounts', data);
      } catch (error) {
        commit('SetError', error, {root: true});
      }
    },
    async SetVAccount({state, dispatch, commit}, account: string) {
      if (state.vaccount) {
        await dispatch('UnsubscribeAccountOrders');
        await dispatch('UnsubscribeAccountTrades');
      }
      commit('SetVAccount', account);
      await dispatch('GetAccountOrders', account);
      await dispatch('SubscribeAccountOrders');
      await dispatch('GetAccountTrades', account);
      await dispatch('SubscribeAccountTrades');
    },
    async GetAccountOrders({commit}, account: string) {
      try {
        const data = await Vue.$cf.RPC({ method: 'GetVAccountOrders', params: { account: account } });
        commit('SetOrders', data);
      } catch (error) {
        commit('SetError', error, {root: true});
        throw error;
      }
    },
    SubscribeAccountOrders({state, commit, rootState}) {
      Vue.$cf.Subscribe(`orders:${state.vaccount}#${rootState.userId}`, ({data}) => {
        if (data.command === 'update') {
          commit('SetOrder', data.params);
        }
      });
    },
    UnsubscribeAccountOrders({state, rootState}) {
      Vue.$cf.Unsubscribe(`orders:${state.vaccount}#${rootState.userId}`);
    },
    async GetAccountTrades({commit}, account: string) {
      try {
        const data = await Vue.$cf.RPC({ method: 'GetVAccountTrades', params: { account: account } });
        commit('SetTrades', data);
      } catch (error) {
        commit('SetError', error, {root: true});
        throw error;
      }
    },
    SubscribeAccountTrades({state, commit, rootState}) {
      Vue.$cf.Subscribe(`trades:${state.vaccount}#${rootState.userId}`, ({data}) => {
        if (data.command === 'create') {
          commit('CreateTrade', data.params);
        }
      });
    },
    UnsubscribeAccountTrades({state, rootState}) {
      Vue.$cf.Unsubscribe(`trades:${state.vaccount}#${rootState.userId}`);
    },
    async SendOrder({commit}, order: IOrder) {
      try {
        await Vue.$cf.RPC({ method: 'SendOrder', params: order });
      } catch (error) {
        commit('SetError', error, {root: true});
        throw error;
      }
    },
    async CancelOrder({commit}, payload: ICancelPayload) {
      try {
        await Vue.$cf.RPC({ method: 'CancelOrder', params: payload });
      } catch (error) {
        commit('SetError', error, {root: true});
        throw error;
      }
    },
    async GetOhlc({commit}, payload: IOhlcPayload) {
      try {
        const data = await Vue.$cf.RPC({ method: 'GetOhlc', params: payload });
        return data;
      } catch (error) {
        commit('SetError', error, {root: true});
        return [];
      }
    },
  },
};

export default terminal;
