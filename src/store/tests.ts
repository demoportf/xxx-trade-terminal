import Vue from 'vue';
import uuid from 'uuid/v4';
import { Module } from 'vuex';
import { IMainState, ITest } from './types';

export interface ITestsState {
  test: ITest;
}

const tests: Module<ITestsState, IMainState> = {
  state: {
    test: {
      id: '',
      name: '',
      parent: '',
      state: '',
      progress: 0,
      begin: 0,
      end: 0,
      interval: 0,
      strategies: [],
    },
  },
  mutations:  {
    SetTest(state, test: ITest) {
      state.test = test;
    },
    SetTestBegin(state, begin: number)        { state.test.begin = begin; },
    SetTestEnd(state, end: number)            { state.test.end = end; },
    SetTestInterval(state, interval: number)  { state.test.interval = interval; },
  },
  actions: {
    async GetTest({commit}, id: string) {
      try {
        const data = await Vue.$cf.RPC({method: 'GetTest', params: {id: id}});
        commit('SetTest', data);
      } catch (error) {
        commit('SetError', error);
        throw error;
      }
    },
    async CreateTest({state, commit}, test: ITest) {
      try {
        await Vue.$cf.RPC({ method: 'CreateTest', params: test });
      } catch (error) {
        commit('SetError', error);
        throw error;
      }
    },
    async UpdateTest({state, commit}) {
      try {
        await Vue.$cf.RPC({method: 'UpdateTest', params: state.test});
      } catch (error) {
        commit('SetError', error);
        throw error;
      }
    },
  },
};

export default tests;
