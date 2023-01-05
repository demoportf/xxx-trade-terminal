<template>
  <v-container fluid class="py-0 px-1">
    <v-row dense>
      <v-col cols="12" md="4">
        <v-row dense>
          <v-col cols="12">
            <v-card height="490">
              <v-toolbar dense flat>
                <v-toolbar-title>Strategies</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-btn @click="StartStrategy" icon small>
                  <v-icon>play_circle_outline</v-icon>
                </v-btn>
                <v-btn @click="StopStrategy" icon small>
                  <v-icon>pause_circle_outline</v-icon>
                </v-btn>
                <v-btn icon small disabled></v-btn>
                <v-menu bottom left v-model="createMenu" :close-on-content-click="false" min-width=200 max-width=200>
                  <template v-slot:activator="{ on }">
                    <v-btn v-on="on" icon small>
                      <v-icon>add</v-icon>
                    </v-btn>
                  </template>

                  <v-list dense>
                    <v-list-item @click="CreatePortfolio">
                      <v-list-item-title>Portfolio</v-list-item-title>
                    </v-list-item>
                    <v-list-group>
                      <template v-slot:activator>
                        <v-list-item-title>Strategy</v-list-item-title>
                      </template>
                      <v-list-group v-for="(cat, i) in categories" :key="i" no-action sub-group>
                        <template v-slot:activator>
                          <v-list-item-title>{{ cat.name }}</v-list-item-title>
                        </template>
                        <v-list-item v-for="(script, i) in cat.scripts" :key="i" @click="CreateStrategy(script.id)">
                          <v-list-item-title>{{ script.name }}</v-list-item-title>
                        </v-list-item>
                      </v-list-group>
                    </v-list-group>
                  </v-list>
                </v-menu>
                <v-btn @click="DeleteStrategy" icon small>
                  <v-icon>delete</v-icon>
                </v-btn>
              </v-toolbar>
              <v-divider></v-divider>
              <v-sheet class="overflow-y-auto" height="435">
                <v-treeview :items="portfolios" item-children="strategies" @update:active="SelectStrategy" transition
                  activatable dense>
                  <template v-slot:prepend="{ item, open }">
                    <v-icon v-if="item.strategies">{{ open? 'mdi-folder-open': 'mdi-folder' }}</v-icon>
                    <v-icon v-else>mdi-file-document-outline</v-icon>
                  </template>
                  <template v-slot:append="{ item: { strategies, state } }">
                    <v-chip v-if="!strategies" :color="GetStateColor(state)" dark label x-small>{{ state }}</v-chip>
                  </template>
                </v-treeview>
              </v-sheet>
            </v-card>
          </v-col>
          <v-col cols="12" class="pt-0">
            <v-card height="390">
              <v-container v-if="isStrategy">
                <v-row dense>
                  <v-col>
                    <v-text-field v-model="newInstrument.ticker" label="Ticker" dense></v-text-field>
                  </v-col>
                  <v-col>
                    <v-select :items="vaccounts" item-text="name" item-value="id" v-model="newInstrument.account"
                      label="Account" dense single-line></v-select>
                  </v-col>
                  <v-col cols="auto">
                    <v-btn icon small :disabled="!newInstrument.ticker || !newInstrument.account"
                      @click="CreateInstrument"><v-icon>mdi-plus</v-icon></v-btn>
                  </v-col>
                </v-row>
                <v-row dense>
                  <v-col>
                    <v-data-table :headers="instrumentsHeaders" :items="instruments" dense height="100" fixed-header
                      disable-pagination hide-default-footer hide-default-header>
                      <template v-slot:item.action="{ item }">
                        <v-icon small @click="DeleteInstrument(item.id)">cancel</v-icon>
                      </template>
                    </v-data-table>
                  </v-col>
                </v-row>
              </v-container>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
      <v-col cols="12" md="8">
        <v-row dense>
          <v-col>
            <v-card height="490">
              <v-toolbar dense flat>
                <v-toolbar-title>График</v-toolbar-title>
                <v-spacer></v-spacer>
              </v-toolbar>
              <v-divider></v-divider>
            </v-card>
          </v-col>
          <v-col cols="12" class="pt-0">
            <v-card height="390">
              <v-container fluid>
                <v-tabs height="45">
                  <v-tab>Logs</v-tab>
                  <v-tab>Orders</v-tab>
                  <v-tab>Trades</v-tab>
                  <v-tab-item transition="none" reverse-transition="none">
                    <v-data-table :headers="logsHeaders" :items="logs" item-key="id" height="300" dense disable-sort
                      fixed-header disable-pagination hide-default-footer>
                    </v-data-table>
                  </v-tab-item>
                  <v-tab-item transition="none" reverse-transition="none">
                    <v-data-table :headers="ordersHeaders" :items="orders" item-key="id" height="300" dense disable-sort
                      fixed-header disable-pagination hide-default-footer>
                      <template v-slot:item.state="{ item: { state } }">
                        <v-chip :color="GetStateColor(state)" dark label x-small>{{ state }}</v-chip>
                      </template>
                      <template v-slot:item.side="{ item: { side } }">
                        <v-chip :color="GetSideColor(side)" label x-small outlined>{{ side }}</v-chip>
                      </template>
                      <template v-slot:item.action="{ item: { id, state } }">
                        <v-icon v-if="IsCancelable(state)" small @click="CancelOrder(id)">cancel</v-icon>
                      </template>
                    </v-data-table>
                  </v-tab-item>
                  <v-tab-item transition="none" reverse-transition="none">
                    <v-data-table :headers="tradesHeaders" :items="trades" item-key="id" height="300" dense disable-sort
                      fixed-header disable-pagination hide-default-footer>
                      <template v-slot:item.side="{ item: { side } }">
                        <v-chip :color="GetSideColor(side)" label x-small outlined>{{ side }}</v-chip>
                      </template>
                    </v-data-table>
                  </v-tab-item>
                </v-tabs>
              </v-container>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
import HighchartsVue from 'highcharts-vue';
import Highcharts from 'highcharts';
import stockInit from 'highcharts/modules/stock';
import { IOrder, ITrade, ILogEntry } from '../store/types';

stockInit(Highcharts);
Vue.use(HighchartsVue);

export default Vue.extend({
  data() {
    return {
      createMenu: false,
      max40chars: (v) => v.length <= 40 || 'Input too long!',
      paramsHeader: [
        { text: 'Param', align: 'left', sortable: false, value: 'key' },
        { text: 'Value', align: 'left', sortable: false, value: 'value' },
      ],
      logsHeaders: [
        { text: 'Time', value: 'time', width: 100 },
        { text: 'Level', value: 'level', width: 50 },
        { text: 'Text', value: 'text', width: 300 },
      ],
      ordersHeaders: [
        { text: 'Time', value: 'time' },
        { text: 'State', value: 'state' },
        { text: 'Type', value: 'type' },
        { text: 'Ticker', value: 'ticker' },
        { text: 'Side', value: 'side' },
        { text: 'Price', value: 'price' },
        { text: 'Quantity', value: 'quantity' },
        { text: 'Action', value: 'action' },
      ],
      tradesHeaders: [
        { text: 'Time', value: 'time' },
        { text: 'Ticker', value: 'ticker' },
        { text: 'Side', value: 'side' },
        { text: 'Price', value: 'price' },
        { text: 'Quantity', value: 'quantity' },
      ],
      newInstrument: {
        ticker: '',
        account: '',
        position: '0',
      },
      instrumentsHeaders: [
        { text: 'Ticker', value: 'ticker' },
        { text: 'Account', value: 'account' },
        { text: 'Action', value: 'action' },
      ],
    };
  },

  computed: {
    categories() { return this.$store.state.scripts.categories; },
    portfolios() { return this.$store.state.strategies.portfolios; },
    isPortfolio() { return this.$store.state.strategies.portfolio.id; },
    portfolio() { return this.$store.state.strategies.portfolio; },
    isStrategy() { return this.$store.state.strategies.strategy.id; },
    strategy() { return this.$store.state.strategies.strategy; },
    vaccounts() { return this.$store.state.terminal.vaccounts; },
    instruments() {
      return this.$store.state.strategies.strategy.instruments.map((instrument, idx) => {
        const vacc = this.$store.state.terminal.vaccounts.find((acc) => acc.id === instrument.account);
        return {
          id: idx,
          ticker: instrument.ticker,
          account: vacc ? vacc.name : instrument.account,
        };
      });
    },
    trades() {
      return this.$store.state.strategies.trades.map((trade: ITrade) => {
        return {
          id: trade.id,
          ticker: trade.ticker,
          side: trade.side,
          price: trade.price.toLocaleString(),
          quantity: trade.volume,
          time: new Date(trade.time).toLocaleString(),
        };
      });
    },
    orders() {
      return this.$store.state.strategies.orders.map((order: IOrder) => {
        return {
          id: order.id,
          state: order.state,
          ticker: order.ticker,
          type: 'limit',
          side: order.side,
          price: order.price.toLocaleString(),
          quantity: order.volume,
          time: new Date(order.time).toLocaleString(),
        };
      });
    },
    logs() {
      return this.$store.state.strategies.logs.map((log: ILogEntry, index: number) => {
        return {
          id: index,
          time: new Date(log.time).toLocaleString(),
          level: log.level,
          text: log.text,
        };
      });
    },
  },
  methods: {
    CreatePortfolio() {
      this.createMenu = false;
      this.$store.dispatch('strategies/CreatePortfolio');
    },
    CreateStrategy(scriptId) {
      this.createMenu = false;
      this.$store.dispatch('strategies/CreateStrategy', scriptId);
    },
    async SelectStrategy(selected: string[]) {
      if (selected.length > 0) {
        const id = selected[0];
        const portfolio = this.portfolios.find((cat) => cat.id === id);
        if (portfolio) {
          this.$store.commit('strategies/SetPortfolio', { ...portfolio });
        } else {
          await this.$store.dispatch('strategies/GetStrategy', id);
          await this.$store.dispatch('strategies/GetStrategyLogs', id);
        }
      }
    },

    DeleteStrategy() {
      if (this.isPortfolio) {
        this.$store.dispatch('strategies/DeletePortfolio');
      } else {
        this.$store.dispatch('strategies/DeleteStrategy');
      }
    },
    StartStrategy() {
      if (!this.isPortfolio) { this.$store.dispatch('strategies/StartStrategy'); }
    },
    StopStrategy() {
      if (!this.isPortfolio) { this.$store.dispatch('strategies/StopStrategy'); }
    },
    GetStateColor(state: string) {
      let сolor = 'grey';
      switch (state) {
        case 'run': сolor = 'green'; break;
        case 'error': сolor = 'red'; break;
        case 'stop': сolor = 'grey'; break;
      }
      return сolor;
    },
    GetSideColor(side: string) {
      return side === 'buy' ? 'green' : 'red';
    },
    CreateInstrument() {
      this.$store.commit('strategies/CreateInstrument', { ...this.newInstrument });
      this.$store.dispatch('strategies/UpdateStrategy');
    },
    DeleteInstrument(idx: number) {
      this.$store.commit('strategies/DeleteInstrument', idx);
      this.$store.dispatch('strategies/UpdateStrategy');
    },
  },
  async created() {
    await this.$store.dispatch('terminal/GetVAccounts');
    await this.$store.dispatch('scripts/GetScripts');
    await this.$store.dispatch('strategies/GetPortfolios');
    await this.$store.dispatch('strategies/SubscribeStrategies');
  },
  beforeDestroy() {
    this.$store.dispatch('strategies/UnsubscribeStrategies');
  },
});
</script>