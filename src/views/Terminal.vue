<template>
  <v-container fluid>
    <v-row>
      <v-col xs="12" sm="12" md="12" lg="12" xl="12">
        <v-row>
          <v-col xs="12" sm="12" md="12" lg="5" xl="5">
            <v-card height="100%">
              <v-container fluid>
                <v-row align="center" justify="start">
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn icon @click="CreateSymbol(ticker)">
                      <v-icon>mdi-plus</v-icon>
                    </v-btn>
                    <v-text-field v-model="ticker" label="Ticker" name="ticker" type="text"></v-text-field>
                  </v-card-actions>
                </v-row>
                <v-data-table dense height="300" :headers="symbolsHeaders" :items="symbols" item-key="ticker" v-model="selectedSymbols"
                  single-select disable-sort fixed-header disable-pagination hide-default-footer @click:row="SelectSymbol">
                  <template v-slot:item.action="{ item }">
                    <v-icon small @click="DeleteSymbol(item.ticker)">cancel</v-icon>
                  </template>
                </v-data-table>
              </v-container>
            </v-card>
          </v-col>
          <v-col xs="12" sm="12" md="8" lg="5" xl="5">
            <v-card height="100%">
              <v-container>
                <highcharts ref="OhlcChart" class="stock" :constructor-type="'stockChart'" :options="chartOptions"></highcharts>
              </v-container>
            </v-card>
          </v-col>
          <v-col xs="12" sm="12" md="4" lg="2" xl="2">
            <v-card height="100%">
              <v-container fluid>
                <v-form ref="form" v-model="newOrder.valid" lazy-validation>
                  <v-row dense>
                    <v-text-field label="Symbol" :value="selectedSymbol.ticker" dense readonly outline/>
                  </v-row>
                  <v-row dense>
                    <v-col>
                      <v-text-field label="Bid" :value="selectedSymbol.bid" dense readonly outline/>
                    </v-col>
                    <v-col>
                      <v-text-field label="Ask" :value="selectedSymbol.ask" dense readonly outline/>
                    </v-col>
                  </v-row>
                  <v-row dense>
                    <v-col>
                      <v-select label="Type" :items="['Limit', 'Market']" v-model="newOrder.type" dense></v-select>
                    </v-col>
                    <v-col>
                      <v-select label="Expiration" :items="['Day','GTC']" v-model="newOrder.expiration" dense></v-select>
                    </v-col>
                  </v-row>
                  <v-row dense>
                    <v-col> 
                      <v-text-field dense v-model.number="newOrder.price" label="Price" :rules="newOrder.priceRules"></v-text-field>
                    </v-col>
                    <v-col>
                      <v-text-field dense v-model.number="newOrder.volume" label="Volume" :rules="newOrder.volumeRules"></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col class="ma-1">
                      <v-btn small block :disabled="!IsSendAvailable()" color="success" @click="SendOrder('buy')">Buy</v-btn>
                    </v-col>
                    <v-col class="ma-1">
                      <v-btn small block :disabled="!IsSendAvailable()" color="error" @click="SendOrder('sell')">Sell</v-btn>
                    </v-col>
                  </v-row>
                </v-form>
              </v-container>
            </v-card>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-card height="100%">
              <v-container fluid>
                <v-tabs height="45">
                  <v-tab>Positions</v-tab>
                  <v-tab>Orders</v-tab>
                  <v-tab>Trades</v-tab>
                  <v-tab-item transition="none" reverse-transition="none">
                    <v-data-table :headers="positionsHeaders" :items="positions" item-key="id" dense height="300" fixed-header disable-pagination hide-default-footer></v-data-table>
                  </v-tab-item>
                  <v-tab-item transition="none" reverse-transition="none">  
                    <v-data-table :headers="ordersHeaders" :items="orders" item-key="id" height="300" dense disable-sort fixed-header disable-pagination hide-default-footer>
                      <template v-slot:item.state="{item: {state}}">
                        <v-chip :color="GetStateColor(state)" dark label x-small>{{state}}</v-chip>
                      </template>
                      <template v-slot:item.side="{item: {side}}">
                        <v-chip :color="GetSideColor(side)" label x-small outlined>{{side}}</v-chip>
                      </template>
                      <template v-slot:item.action="{item: {id, state}}">
                        <v-icon v-if="IsCancelable(state)" small @click="CancelOrder(id)">cancel</v-icon>
                      </template>
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
import { IOrder, ITrade} from '@/store/types';

stockInit(Highcharts);
Vue.use(HighchartsVue);

export default Vue.extend({
  data() {
    return {
      ticker: '',
      symbolsHeaders: [
        {text: 'Ticker', value: 'ticker'},
        {text: 'Bid', value: 'bid'},
        {text: 'Ask', value: 'ask'},
        {text: 'Action', value: 'action'},
      ],
      selectedSymbols: [],
      positionsHeaders: [
        {text: 'Ticker', value: 'ticker'},
        {text: 'Position', value: 'position'},
        {text: 'Avg.Price', value: 'avgprice'},
        {text: 'Price', value: 'price'},
        {text: 'P&L', value: 'pnl'},
      ],
      ordersHeaders: [
        {text: 'Time', value: 'time'},
        {text: 'State', value: 'state'},
        {text: 'Type', value: 'type'},
        {text: 'Ticker', value: 'ticker'},
        {text: 'Side', value: 'side'},
        {text: 'Price', value: 'price'},
        {text: 'Quantity', value: 'quantity'},
        {text: 'Action', value: 'action'},
      ],
      tradesHeaders: [
        {text: 'Time', value: 'time'},
        {text: 'Ticker', value: 'ticker'},
        {text: 'Side', value: 'side'},
        {text: 'Price', value: 'price'},
        {text: 'Quantity', value: 'quantity'},
      ],
      newOrder: {
        type: 'Limit',
        expiration: 'GTC',
        price: 0,
        volume: 1,
        valid: false,
        priceRules: [(v) => !!v || 'Price is required'],
        volumeRules: [(v) => !!v || 'Volume is required'],
      },
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
        yAxis: {
        },
        series: [{
            dataGrouping: {
              enabled: false,
            },
          },
        ],
        credits: {
          enabled: false,
        },
      },
    };
  },

  computed: {
    symbols() {
      return this.$store.state.terminal.symbols;
    },
    positions() {
      return [];
    },
    orders() {
      return this.$store.state.terminal.orders.map((order: IOrder) => {
        return {
          id: order.id,
          state: order.state,
          ticker: order.ticker,
          type: 'limit',  // TODO
          side: order.side,
          price: order.price.toLocaleString(),
          quantity: order.volume,
          time: new Date(order.time).toLocaleString() };
        });
    },
    trades() {
      return this.$store.state.terminal.trades.map((trade: ITrade) => {
        return {
          id: trade.id,
          ticker: trade.ticker,
          side: trade.side,
          price: trade.price.toLocaleString(),
          quantity: trade.volume,
          time: new Date(trade.time).toLocaleString() };
        });
    },
    selectedSymbol() {
      return this.selectedSymbols.length > 0 ? this.selectedSymbols[0] : {};
    },
  },
  methods: {
    async SelectSymbol(symbol: any) {
      this.selectedSymbols = [];
      this.selectedSymbols.push(symbol);
      const data = await this.$store.dispatch('terminal/GetOhlc', {
        ticker: symbol.ticker,
        interval: 86400,
        begin: 0,
        end: 5000000000000});

      this.chartOptions.navigator.series.data = data;
      this.chartOptions.series[0].data = data;
      this.chartOptions.title.text = symbol.ticker;
      const chart = this.$refs.OhlcChart.chart;
      chart.xAxis[0].setExtremes();
    },
    CreateSymbol(ticker: string) {
      this.$store.dispatch('terminal/CreateSymbol', ticker);
      this.ticker = '';
    },
    DeleteSymbol(ticker: string) {
      this.$store.dispatch('terminal/DeleteSymbol', ticker);
    },
    IsSendAvailable(): boolean {
      return this.newOrder.valid && this.$store.state.terminal.vaccount !== '' && this.selectedSymbols.length > 0;
    },
    SendOrder(side: string) {
      const order = {
        account: this.$store.state.terminal.vaccount,
        side: side,
        price: this.newOrder.price,
        volume: this.newOrder.volume,
        ticker: this.selectedSymbol.ticker,
      };
      this.$store.dispatch('terminal/SendOrder', order);
    },
    IsCancelable(state: string): boolean {
      return state === 'open' || state === 'partially filled';
    },
    CancelOrder(order: string) {
      const payload = {
        account: this.$store.state.terminal.vaccount,
        order: order,
      };
      this.$store.dispatch('terminal/CancelOrder', payload);
    },
    GetStateColor(state: string) {
        let сolor = 'amber';
        switch (state) {
          case 'open':  сolor = 'green'; break;
          case 'partially filled': сolor = 'green'; break;
          case 'filled':  сolor = 'blue'; break;
          case 'rejected':  сolor = 'red'; break;
          case 'canceled':  сolor = 'grey'; break;
        }
        return сolor;
    },
    GetSideColor(side: string) {
      return side === 'buy' ? 'green' : 'red';
    },
    IsAccountSelected() {
        return this.$store.state.terminal.vaccount !== '';
    },
  },
  async created() {
    await this.$store.dispatch('terminal/GetVAccounts');
    await this.$store.dispatch('terminal/GetSymbols');
    await this.$store.dispatch('terminal/SubscribeSymbols');
  },
  beforeDestroy() {
    this.$store.dispatch('terminal/UnsubscribeSymbols');
  },
});
</script>