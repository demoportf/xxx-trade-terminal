import Vue from 'vue';
import uuid from 'uuid/v4';
import { Module } from 'vuex';
import { IMainState, ITest, IStrategy, IInstrument, ILogEntry, ITrade, IOhlcPayload } from './types';

// Scripts state interface
export interface IScriptsState {
  categories: ICategory[];
  category: ICategory;
  script: IScript;
  test: ITest;
  strategy: IStrategy;
  report: IReportEntry[];
  logs: ILogEntry[];
  trades: ITrade[];
}

// Category
export interface ICategory {
  id: string;
  name: string;
  scripts: IScript[];
}

// Script
export interface IScript {
  id: string;
  name: string;
  category: string;
  source: string;
}

export interface IGetTestStrategyRequest {
  testId: string;
  strategyId: string;
}

// ReportEntry
export interface IReportEntry {
  name: string;
  value: string;
}

// Scripts storage module
const scripts: Module<IScriptsState, IMainState> = {

  namespaced: true,

  // State
  state: {
    categories: [],
    category: {
      id: '',
      name: '',
      scripts: [],
    },
    script: {
      id: '',
      name: '',
      category: '',
      source: '',
    },
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
    strategy: {
      id: '',
      name: '',
      source: '',
      portfolio: '',
      state: '',
      instruments: [],
    },
    report: [],
    logs: [],
    trades: [],
  },
  getters: {
    newCategoryName: (state) => {
      let name: string;
      let idx = 0;
      do {
        ++idx;
        name = 'Category ' + idx.toString();
      } while (state.categories.some((cat) => cat.name === name));
      return name;
    },
    newScriptName: (state) => {
      let name: string;
      let idx = 0;
      do {
        ++idx;
        name = 'Script ' + idx.toString();
      } while (state.categories.some((cat) => cat.scripts.some((s) => s.name === name)));
      return name;
    },
  },
  mutations:  {
    SetCategories(state, categories: ICategory[]) {
      state.categories = categories;
    },
    CreateScript(state, script: IScript) {
      const cat: ICategory =  state.categories.find((cat) => cat.id === script.category);
      if (cat) {
        cat.scripts.push(script);
      }
    },
    DeleteScript(state, id: string) {
      state.categories.forEach((cat) => {
        cat.scripts = cat.scripts.filter((script) => script.id !== id);
      });
    },
    UpdateScript(state, update: IScript) {
      const src: ICategory =  state.categories.find((cat) => {
        return cat.scripts.find((scr) => scr.id === update.id);
      });
      const dst: ICategory =  state.categories.find((cat) => cat.id === update.category);
      const script = src.scripts.find((scr) => scr.id === update.id);

      if (src.id !== dst.id) {
        src.scripts = src.scripts.filter((scr) => scr.id !== update.id);
        dst.scripts.push(script);
      }
      script.name = update.name;
    },
    CreateCategory(state, category: ICategory) {
      state.categories.push(category);
    },
    DeleteCategory(state, id: string) {
      state.categories = state.categories.filter((cat) => cat.id !== id);
    },
    SetCategory(state, category: ICategory) {
      state.category = category;
      state.script.id = '';
    },
    SetScript(state, script: IScript) {
      state.script = script;
      state.category.id = '';
    },
    SetScriptName(state, name: string)          { state.script.name = name; },
    SetScriptCategory(state, category: string)  { state.script.category = category; },
    SetScriptSource(state, source: string)      { state.script.source = source; },
    SetTest(state, test: ITest)                 { state.test = test; },
    SetTestBegin(state, begin: number)          { state.test.begin = begin; },
    SetTestEnd(state, end: number)              { state.test.end = end; },
    SetTestInterval(state, interval: number)    { state.test.interval = interval; },
    SetTestState(state, data: any)              { state.test.state = data.state; state.test.progress = data.progress; },
    SetStrategy(state, strategy: IStrategy)     { state.strategy = strategy; },
    SetStrategyInstruments(state, instruments: IInstrument[]) { state.strategy.instruments = instruments; },
    SetStrategySource(state, source: string)    { state.strategy.source = source; },
    SetReport(state, report: IReportEntry[])    { state.report = report; },
    SetLogs(state, logs: ILogEntry[])           { state.logs = logs; },
  },
  actions: {
    async GetScripts({commit}) {
      try {
        const data = await Vue.$cf.RPC({method: 'GetScripts'});
        commit('SetCategories', data);
      } catch (error) {
        commit('SetError', error, {root: true});
        throw error;
      }
    },
    async GetScript({commit}, id: string) {
      try {
        const data = await Vue.$cf.RPC({method: 'GetScript', params: {id: id}});
        commit('SetScript', data);
      } catch (error) {
        commit('SetError', error, {root: true});
        throw error;
      }
    },
    async CreateScript({state, commit}, script: IScript) {
      try {
        await Vue.$cf.RPC({ method: 'CreateScript', params: script });
      } catch (error) {
        commit('SetError', error, {root: true});
        throw error;
      }
    },
    async DeleteScript({state, commit}) {
      try {
        if (state.script.id) {
          await Vue.$cf.RPC({ method: 'DeleteScript', params: {id: state.script.id}});
        }
      } catch (error) {
        commit('SetError', error, {root: true});
        throw error;
      }
    },
    async UpdateScript({state, commit}) {
      try {
        if (state.script.id) {
          await Vue.$cf.RPC({method: 'UpdateScript', params: state.script});
        }
      } catch (error) {
        commit('SetError', error, {root: true});
        throw error;
      }
    },
    async CreateCategory({state, commit}) {
      try {
        let name: string;
        let idx = 0;
        do {
          ++idx;
          name = 'Category ' + idx.toString();
        } while (state.categories.some((cat) => cat.name === name));

        await Vue.$cf.RPC({ method: 'CreateCategory', params: {
          id: uuid(),
          name: name,
        }});
      } catch (error) {
        commit('SetError', error, {root: true});
        throw error;
      }
    },
    async DeleteCategory({state, commit}) {
      try {
        if (state.category.id) {
          await Vue.$cf.RPC({ method: 'DeleteCategory', params: {id: state.category.id}});
        }
      } catch (error) {
        commit('SetError', error, {root: true});
        throw error;
      }
    },
    SubscribeScripts({state, commit, rootState}) {
      Vue.$cf.Subscribe(`categories#${rootState.userId}`, ({data}) => {
        if (data.command === 'create') {
          commit('CreateCategory', data.params);
        } else
        if (data.command === 'delete') {
          commit('DeleteCategory', data.params.id);
        }
      });
      Vue.$cf.Subscribe(`scripts#${rootState.userId}`, ({data}) => {
        if (data.command === 'create') {
          commit('CreateScript', data.params);
        } else
        if (data.command === 'delete') {
          commit('DeleteScript', data.params.id);
        } else
        if (data.command === 'update') {
          commit('UpdateScript', data.params);
        }
      });
    },
    UnsubscribeScripts({rootState}) {
      Vue.$cf.Unsubscribe(`categories#${rootState.userId}`);
      Vue.$cf.Unsubscribe(`scripts#${rootState.userId}`);
    },
    async GetTest({commit}, id: string) {
      try {
        const data = await Vue.$cf.RPC({method: 'GetTest', params: {id: id}});
        commit('SetTest', data);
      } catch (error) {
        commit('SetError', error, {root: true});
        throw error;
      }
    },
    async CreateTest({commit}, test: ITest) {
      try {
        await Vue.$cf.RPC({ method: 'CreateTest', params: test });
      } catch (error) {
        commit('SetError', error, {root: true});
        throw error;
      }
    },
    async UpdateTest({state, commit}) {
      try {
        await Vue.$cf.RPC({method: 'UpdateTest', params: state.test});
      } catch (error) {
        commit('SetError', error, {root: true});
        throw error;
      }
    },
    async GetTestStrategy({commit}, req: IGetTestStrategyRequest) {
      try {
        const data = await Vue.$cf.RPC({method: 'GetTestStrategy', params: req});
        commit('SetStrategy', data);
      } catch (error) {
        commit('SetError', error, {root: true});
        throw error;
      }
    },
    async UpdateTestStrategy({state, commit}) {
      try {
        const data = await Vue.$cf.RPC({method: 'UpdateTestStrategy', params: {
          testId: state.test.id,
          strategy: state.strategy,
        }});
      } catch (error) {
        commit('SetError', error, {root: true});
        throw error;
      }
    },
    async GetTestLogs({commit}, id: string) {
      try {
        const data = await Vue.$cf.RPC({method: 'GetTestLogs', params: {id: id}});
        commit('SetLogs', data.logs);
      } catch (error) {
        commit('SetError', error, {root: true});
        throw error;
      }
    },
    async GetTestReport({commit}, id: string) {
      try {
        const data = await Vue.$cf.RPC({method: 'GetTestReport', params: {id: id}});
        commit('SetReport', data);
      } catch (error) {
        commit('SetError', error, {root: true});
        throw error;
      }
    },
    async StartTest({commit}, id: string) {
      try {
        await Vue.$cf.RPC({method: 'StartTest', params: {id: id}});
      } catch (error) {
        commit('SetError', error, {root: true});
        throw error;
      }
    },
    async StopTest({commit}, id: string) {
      try {
        await Vue.$cf.RPC({method: 'StopTest', params: {id: id}});
      } catch (error) {
        commit('SetError', error, {root: true});
        throw error;
      }
    },
    SubscribeTests({state, commit, dispatch, rootState}) {
      Vue.$cf.Subscribe(`tests#${rootState.userId}`, async ({data}) => {
       if (data.id === state.test.id) {
          commit('SetTestState', data);
          if (data.state !== 'run') {
            await dispatch('GetTestReport', data.id);
            await dispatch('GetTestLogs', data.id);
          }
        }
      });
    },
    UnsubscribeTests({rootState}) {
      Vue.$cf.Unsubscribe(`tests#${rootState.userId}`);
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
    async GetEquity({commit}, id: string) {
      try {
        const data = await Vue.$cf.RPC({ method: 'GetTestEquity', params: {id: id} });
        return data;
      } catch (error) {
        commit('SetError', error, {root: true});
        return [];
      }
    },
  },
};

export default scripts;
