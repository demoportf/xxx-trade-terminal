<template>
  <v-container>
    <v-row>
  
      <v-col cols="auto">
        <v-card min-width="200">
          <v-toolbar dense flat>
            <v-toolbar-title>Scripts</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-menu bottom left>
              <template v-slot:activator="{ on }">
                <v-btn v-on="on" icon small>
                  <v-icon>add</v-icon>
                </v-btn>
              </template>
              <v-list>
                <v-list-item @click="CreateScript">
                  <v-list-item-title>Script</v-list-item-title>
                </v-list-item>
                <v-list-item @click="CreateCategory">
                  <v-list-item-title>Category</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
            <v-btn @click="DeleteCategoryOrScript" icon small>
              <v-icon>delete</v-icon>
            </v-btn>
          </v-toolbar>
          <v-divider></v-divider>
          <v-sheet class="overflow-y-auto" height="300">
            <v-treeview :items="categories" item-children="scripts" @update:active="SelectScript" transition activatable dense>
              <template v-slot:prepend="{item, open}">
                <v-icon v-if="item.scripts">{{open ? 'mdi-folder-open' : 'mdi-folder'}}</v-icon>
                <v-icon v-else>mdi-file-document-outline</v-icon>
              </template>
            </v-treeview>
          </v-sheet>
        </v-card>
      </v-col>
      <v-col>
        <v-card v-if="scriptId">
          <v-container>
            <v-form>
              <v-row dense>
                <v-col cols="6">
                  <v-text-field v-model="scriptName" label="Name" dense></v-text-field>
                </v-col>
                <v-col cols="6">
                  <v-select :items="categories" v-model="scriptCategory" item-text="name" item-value="id" label="Category" dense></v-select>
                </v-col>
              </v-row>
              <v-row dense>
                <v-textarea rows="35" v-model="scriptSource" no-resize dense solo flat></v-textarea>
              </v-row>
              <v-row justify="end" dense>
                <v-btn color="success" @click="UpdateScript" small>Save</v-btn>
              </v-row>
            </v-form>
          </v-container>
        </v-card>
      </v-col>
      <v-col>
        <v-card>
          <v-container>
            <v-form>
              <v-row dense>
                <v-combobox v-model="strategyInstruments" :items="instruments" label="Instruments" multiple deletable-chips small-chips dense></v-combobox>              
              </v-row>
              <v-row dense>
                <v-col cols="4">
                  <v-menu v-model="beginMenu" :close-on-content-click="true" min-width="290px" offset-y>
                    <template v-slot:activator="{ on }">
                      <v-text-field v-model="testBegin" label="Begin" readonly v-on="on" dense></v-text-field>
                    </template>
                    <v-date-picker v-model="testBegin" @input="beginMenu = false"></v-date-picker>
                  </v-menu>
                </v-col>
                <v-col cols="4">
                  <v-menu v-model="endMenu" :close-on-content-click="true" min-width="290px" offset-y>
                    <template v-slot:activator="{ on }">
                      <v-text-field v-model="testEnd" label="End" readonly v-on="on" dense></v-text-field>
                    </template>
                    <v-date-picker v-model="testEnd" @input="endMenu = false"></v-date-picker>
                  </v-menu>
                </v-col>
                <v-col cols="4">
                  <v-select :items="intervals" v-model="testInterval" label="Interval" dense></v-select>
                </v-col>
              </v-row>
              <v-row justify="end" dense>
                <v-btn v-if="testState=='run'" color="warning" @click="StopTest" small>Stop</v-btn>
                <v-btn v-else color="success" @click="StartTest" small>Start</v-btn>
              </v-row>
            </v-form>
            <v-row dense>
              <v-progress-linear :value="testProgress" :active="testState=='run'"></v-progress-linear>
            </v-row>
            <v-row>
              <v-col>
                <highcharts ref="ReportChart" class="stock" :constructor-type="'stockChart'" :options="chartOptions"></highcharts>
              </v-col>
            </v-row>
            <v-row dense>
              <v-tabs height="45">
                <v-tab>Report</v-tab>
                <v-tab>Logs</v-tab>
                <v-tab>Trades</v-tab>
                <v-tab-item transition="none" reverse-transition="none">
                  <v-data-table :headers="reportHeaders" :items="report" item-key="name" height="300" dense disable-sort fixed-header disable-pagination hide-default-footer></v-data-table>
                </v-tab-item>
                <v-tab-item transition="none" reverse-transition="none">
                  <v-data-table :headers="logsHeaders" :items="logs" item-key="id" height="300" dense disable-sort fixed-header disable-pagination hide-default-footer>
                  </v-data-table>
                </v-tab-item>
                <v-tab-item transition="none" reverse-transition="none">
                  <v-data-table :headers="tradesHeaders" :items="trades" item-key="id" height="300" dense disable-sort fixed-header disable-pagination hide-default-footer>
                    <template v-slot:item.side="{item: {side}}">
                      <v-chip :color="GetSideColor(side)" label x-small outlined>{{side}}</v-chip>
                    </template>
                  </v-data-table>
                </v-tab-item>
              </v-tabs>
            </v-row>
          </v-container>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
import HighchartsVue from 'highcharts-vue';
import Highcharts from 'highcharts';
import stockInit from 'highcharts/modules/stock';
import { IOrder, ITrade, ILogEntry } from '@/store/types';
import uuid from 'uuid/v4';

stockInit(Highcharts);
Vue.use(HighchartsVue);

export default Vue.extend({
  data() {
    return {
      beginMenu: false,
      endMenu:   false,
      intervals: [{text: 'Minute', value: 60}, {text: 'Hour', value: 3600}, {text: 'Day', value: 86400}],
      instrumentsHeaders: [
        {text: 'Ticker', value: 'ticker'},
        {text: 'Account', value: 'account'},
        {text: 'Action', value: 'action'},
      ],
      instruments: ['RTS.FORTS.H2020', 'MXI.FORTS.H2020', 'Si.FORTS.H2020'],
      tradesHeaders: [
        {text: 'Time', value: 'time'},
        {text: 'Ticker', value: 'ticker'},
        {text: 'Side', value: 'side'},
        {text: 'Price', value: 'price'},
        {text: 'Quantity', value: 'quantity'},
      ],
      trades: [],
      logsHeaders: [
        {text: 'Time', value: 'time', width: 100},
        {text: 'Level', value: 'level', width: 50},
        {text: 'Text', value: 'text', width: 300},
      ],
      reportHeaders: [
        {text: 'Name', value: 'name'},
        {text: 'Value', value: 'value'},
      ],
      chartOptions: {
        chart: {
          type: 'candlestick',
          zoomType: 'x',
          animation: false,
        },
        navigator: {
          adaptToUpdatedData: false,
          series: {},
        },
        scrollbar: {
          enabled: false,
        },
        title: {
          text: 'Symbol not selected',
        },
        rangeSelector: {
          enabled: false,
        },
        xAxis: {
          events: {
          },
          minRange: 60 * 1000,
        },
        yAxis: [
          {height: '60%'},
          {height: '40%', top: '60%'},
        ],
        series: [
          {yAxis: 0, dataGrouping: {enabled: false}, data: [], type: 'candlestick'},
          {yAxis: 1, dataGrouping: {enabled: false}, data: [], type: 'area'},
        ],
        credits: {
          enabled: false,
        },
      },
    };
  },

  computed: {
    categories() {
      return this.$store.state.scripts.categories;
    },
    scriptId() {
      return this.$store.state.scripts.script.id;
    },
    scriptName: {
      get() { return this.$store.state.scripts.script.name; },
      set(value) { this.$store.commit('scripts/SetScriptName', value); },
    },
    scriptCategory: {
      get() { return this.$store.state.scripts.script.category; },
      set(value) { this.$store.commit('scripts/SetScriptCategory', value); },
    },
    scriptSource: {
      get() { return this.$store.state.scripts.script.source; },
      set(value) { this.$store.commit('scripts/SetScriptSource', value); },
    },
    categoryId() {
      return this.$store.state.scripts.category.id;
    },
    testState()     { return this.$store.state.scripts.test.state; },
    testProgress()  { return this.$store.state.scripts.test.progress; },
    testBegin: {
      get() { return new Date(this.$store.state.scripts.test.begin).toISOString().substr(0, 10); },
      set(value: string) {
        this.$store.commit('scripts/SetTestBegin', new Date(value).getTime());
        this.$store.dispatch('scripts/UpdateTest');
      },
    },
    testEnd: {
      get() { return new Date(this.$store.state.scripts.test.end).toISOString().substr(0, 10); },
      set(value: string) {
        this.$store.commit('scripts/SetTestEnd', new Date(value).getTime());
        this.$store.dispatch('scripts/UpdateTest');
      },
    },
    testInterval: {
      get() { return this.$store.state.scripts.test.interval; },
      set(value) {
        this.$store.commit('scripts/SetTestInterval', value);
        this.$store.dispatch('scripts/UpdateTest');
      },
    },
    strategyInstruments: {
      get() { return this.$store.state.scripts.strategy.instruments.map((instrument) => instrument.ticker); },
      set(value: string[]) {
        this.$store.commit('scripts/SetStrategyInstruments', value.map((ticker) => {
          return {ticker: ticker, account: 'test', position: '0'};
        }));
        this.$store.dispatch('scripts/UpdateTestStrategy');
      },
    },
    logs() {
      return this.$store.state.scripts.logs.map((log: ILogEntry, index: number) => {
        return {
          id: index,
          time: new Date(log.time).toLocaleString(),
          level: log.level,
          text: log.text,
        };
      });
    },
    report()  { return this.$store.state.scripts.report; },
  },
  methods: {
    async SelectScript(selected: string[]) {
      if (selected.length > 0) {
        const id = selected[0];
        const cat = this.categories.find((cat) => cat.id === id);
        if (cat) {
          this.$store.commit('scripts/SetCategory', {id: cat.id, name: cat.name});
        } else {
          await this.$store.dispatch('scripts/GetScript', id);
          await this.$store.dispatch('scripts/GetTest', id);
          const strategy = this.$store.state.scripts.test.strategies[0];
          await this.$store.dispatch('scripts/GetTestStrategy', {testId: id, strategyId: strategy.id});
          await this.$store.dispatch('scripts/GetTestReport', id);
          await this.$store.dispatch('scripts/GetTestLogs', id);

          const tickers = this.strategyInstruments;
          if (tickers.length > 0) {
            const ticker = tickers[0];
            const ohlc = await this.$store.dispatch('scripts/GetOhlc', {
              ticker: ticker,
              interval: 86400,
              begin: 0,
              end: 5000000000000});

            const equity = await this.$store.dispatch('scripts/GetEquity', id);

            this.chartOptions.navigator.series.data = ohlc;
            this.chartOptions.series[0].data = ohlc;
            this.chartOptions.series[1].data = equity;
            this.chartOptions.title.text = ticker;

            const chart = this.$refs.ReportChart.chart;
            chart.xAxis[0].setExtremes();
          }
        }
      }
    },
    async CreateScript() {
      const script = {
        id: uuid(),
        name: this.$store.getters['scripts/newScriptName'],
        category: this.categoryId ? this.categoryId : this.scriptCategory,
        source: '',
      };
      await this.$store.dispatch('scripts/CreateScript', script);
      const test = {
        id: script.id,
        name: script.name,
        parent: script.id,
        begin: Date.now() - 2592000000,
        end: Date.now(),
        interval: 60,
        strategies: [{
          id: uuid(),
          name: script.name,
          portfolio: script.id,
          source: '',
          instruments: [],
        }],
      };
      await this.$store.dispatch('scripts/CreateTest', test);
    },
    UpdateScript() {
      this.$store.dispatch('scripts/UpdateScript');
    },
    CreateCategory() {
      this.$store.dispatch('scripts/CreateCategory');
    },
    DeleteCategoryOrScript() {
      if (this.categoryId) {
        this.$store.dispatch('scripts/DeleteCategory');
      } else {
        this.$store.dispatch('scripts/DeleteScript');
      }
    },
    async StartTest() {
      this.$store.commit('scripts/SetStrategySource', this.$store.state.scripts.script.source);
      await this.$store.dispatch('scripts/UpdateTestStrategy');
      await this.$store.dispatch('scripts/StartTest', this.$store.state.scripts.test.id);
    },
    StopTest() {
      this.$store.dispatch('scripts/StopTest', this.$store.state.scripts.test.id);
    },
  },
  async created() {
    await this.$store.dispatch('scripts/GetScripts');
    await this.$store.dispatch('scripts/SubscribeScripts');
    await this.$store.dispatch('scripts/SubscribeTests');
  },
  beforeDestroy() {
    this.$store.dispatch('scripts/UnsubscribeScripts');
    this.$store.dispatch('scripts/UnsubscribeTests');
  },
});
</script>