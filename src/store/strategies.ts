import Vue from 'vue';
import uuid from 'uuid/v4';
import { Module } from 'vuex';
import { IMainState, IInstrument, IStrategy, ITrade, ILogEntry, IOrder} from './types';

export interface IStrategiesState {
  portfolios: IPortfolio[];
  portfolio: IPortfolio;
  strategy: IStrategy;
  logs: ILogEntry[];
  orders: IOrder[];
  trades: ITrade[];
}

export interface IPortfolio {
  id: string;
  name: string;
  strategies: IStrategy[];
}

export interface IStrategyParams {
  key: string;
  value: string;
}

const strategies: Module<IStrategiesState, IMainState> = {
  namespaced: true,
  state: {
    portfolios: [],
    portfolio: {
      id: '',
      name: '',
      strategies: [],
    },
    strategy: {
      id: '',
      name: '',
      portfolio: '',
      source: '',
      instruments: [],
      state: '',
    },
    orders: [],
    trades: [],
    logs: [],
  },
  getters: {
    newPortfolioName: (state) => {
      let name: string;
      let idx = 0;
      do {
        ++idx;
        name = 'Portfolio ' + idx.toString();
      } while (state.portfolios.some((p) => p.name === name));
      return name;
    },
    newStrategyName: (state) => {
      let name: string;
      let idx = 0;
      do {
        ++idx;
        name = 'Strategy ' + idx.toString();
      } while (state.portfolios.some((p) => p.strategies.some((s) => s.name === name)));
      return name;
    },
  },
  mutations:  {
    SetPortfolios(state,  portfolios: IPortfolio[])   { state.portfolios = portfolios; },
    CreatePortfolio(state, portfolio: IPortfolio)     { state.portfolios.push(portfolio); },
    DeletePortfolio(state, id: string) {
      state.portfolios = state.portfolios.filter((p) => p.id !== id);
    },
    SetPortfolio(state, portfolio: IPortfolio)        { state.portfolio = portfolio; state.strategy.id = ''; },
    SetStrategy(state, strategy: IStrategy)           { state.strategy = strategy; state.portfolio.id = ''; },
    CreateStrategy(state, strategy: IStrategy) {
      const portfolio: IPortfolio =  state.portfolios.find((p) => p.id === strategy.portfolio);
      if (portfolio) {
        portfolio.strategies.push(strategy);
      }
    },
    DeleteStrategy(state, id: string) {
      state.portfolios.forEach((p) => p.strategies = p.strategies.filter((s) => s.id !== id));
    },
    UpdateStrategy(state, update: any) {
      let strategy: IStrategy;
      state.portfolios.some((p) => strategy = p.strategies.find((s) => s.id === update.id));
      if (strategy) {
        strategy.state = update.state;
      }
    },
    SetLogs(state, logs: ILogEntry[])                 { state.logs = logs; },
    CreateInstrument(state, instrument: IInstrument) {
      state.strategy.instruments.push(instrument);
    },
    DeleteInstrument(state, idx: number) {
      state.strategy.instruments.splice(idx, 1);
    },
  },
  actions: {
    async GetPortfolios({commit}) {
      try {
        const data = await Vue.$cf.RPC({method: 'GetPortfolios'});
        commit('SetPortfolios', data.portfolios);
      } catch (error) {
        commit('SetError', error, {root: true});
        throw error;
      }
    },
    async CreatePortfolio({commit, getters}) {
      try {
        await Vue.$cf.RPC({ method: 'CreatePortfolio', params: {
          id: uuid(),
          name: getters.newPortfolioName,
        }});
      } catch (error) {
        commit('SetError', error, {root: true});
        throw error;
      }
    },
    async DeletePortfolio({state, commit}) {
      try {
        if (state.portfolio.id) {
          await Vue.$cf.RPC({ method: 'DeletePortfolio', params: {id: state.portfolio.id}});
        }
      } catch (error) {
        commit('SetError', error, {root: true});
        throw error;
      }
    },
    SubscribeStrategies({commit, rootState: {userId}}) {
      Vue.$cf.Subscribe(`portfolios#${userId}`, ({data}) => {
        switch (data.command) {
          case 'create': commit('CreatePortfolio', {...data.params, strategies: []}); break;
          case 'delete': commit('DeletePortfolio', data.params.id); break;
        }
      });
      Vue.$cf.Subscribe(`strategies#${userId}`, ({data}) => {
        switch (data.command) {
          case 'create':  commit('CreateStrategy', data.params); break;
          case 'delete':  commit('DeleteStrategy', data.params); break;
          case 'state':   commit('UpdateStrategy', data.params); break;
        }
      });
    },
    UnsubscribeStrategies({rootState: {userId}}) {
      Vue.$cf.Unsubscribe(`portfolios#${userId}`);
      Vue.$cf.Unsubscribe(`strategies#${userId}`);
    },
    async GetStrategy({commit}, id: string) {
      try {
        const data = await Vue.$cf.RPC({method: 'GetStrategy', params: {id: id}});
        commit('SetStrategy', data);
      } catch (error) {
        commit('SetError', error, {root: true});
        throw error;
      }
    },
    async CreateStrategy({getters, state, commit}, scriptId) {
      try {
        await Vue.$cf.RPC({ method: 'CreateStrategy', params: {
          strategy: {
            id: uuid(),
            name: getters.newStrategyName,
            portfolio: state.portfolio.id,
          },
          scriptId: scriptId,
        }});
      } catch (error) {
        commit('SetError', error, {root: true});
        throw error;
      }
    },
    async DeleteStrategy({state, commit}) {
      try {
        if (state.strategy.id) {
          await Vue.$cf.RPC({ method: 'DeleteStrategy', params: {id: state.strategy.id}});
        }
      } catch (error) {
        commit('SetError', error, {root: true});
        throw error;
      }
    },
    async UpdateStrategy({state, commit}) {
      try {
        await Vue.$cf.RPC({method: 'UpdateStrategy', params: {strategy: state.strategy}});
      } catch (error) {
        commit('SetError', error, {root: true});
        throw error;
      }
    },
    async StartStrategy({state, commit}) {
      try {
        if (state.strategy.id) {
          await Vue.$cf.RPC({method: 'StartStrategy', params: {id: state.strategy.id}});
        }
      } catch (error) {
        commit('SetError', error, {root: true});
        throw error;
      }
    },
    async StopStrategy({state, commit}) {
      try {
        if (state.strategy.id) {
          await Vue.$cf.RPC({method: 'StopStrategy', params: {id: state.strategy.id}});
        }
      } catch (error) {
        commit('SetError', error, {root: true});
        throw error;
      }
    },
    async GetStrategyLogs({commit}, id: string) {
      try {
        const data = await Vue.$cf.RPC({method: 'GetStrategyLogs', params: {id: id}});
        commit('SetLogs', data.logs);
      } catch (error) {
        commit('SetError', error, {root: true});
        throw error;
      }
    },
  },
};

export default strategies;
