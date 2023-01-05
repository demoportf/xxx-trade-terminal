<template>
  <v-container fluid class="pt-0 pb-0">
    <v-row>
      <v-col xs="12" sm="12" md="12" lg="12" xl="12">
        <v-row>
          <v-col xs="12" sm="12" md="10" lg="10" xl="10">
            <v-card height="100%">
              <v-container fluid>
                <v-data-table
                  :headers="account_header"
                  v-model="selectedVaccounts"
                  :items="vaccounts"
                  :items-per-page="5"
                  item-key="id"
                  class="elevation-0"
                  height="300"
                  fixed-header
                  disable-pagination
                  hide-default-footer
                  dense
                  loading-text="Loading... Please wait"
                  @click:row="SelectVAccount"
                  single-select
                  disable-sort
                >
                  <template v-slot:item.actions="{ item }">
                    <v-icon small @click="DeleteVirtualAccount(item.id)">cancel</v-icon>
                  </template>
                </v-data-table>
              </v-container>
            </v-card>
          </v-col>
          <v-col xs="12" sm="12" md="2" lg="2" xl="2">
            <v-card height="100%">
              <v-card-text>
                <v-form ref="form">
                  <v-row align="center" justify="space-between">
                    <v-text-field
                      v-model="newAccount.Name"
                      :counter="20"
                      label="Name"
                      required
                      class="mx-2"
                    ></v-text-field>
                    <v-select
                      v-model="newAccount.ExecutorId"
                      :items="ExecutorsIds"
                      label="Executor"
                      required
                      class="mx-2"
                      :disabled="!validName"
                    ></v-select>
                    <v-select
                      v-model="newAccount.RealAccount"
                      :items="filteredRaccounts"
                      label="Real Account"
                      required
                      class="mx-2"
                      :disabled="!validExecutor"
                    ></v-select>
                  </v-row>
                  <v-row align="center" justify="space-between">
                    <v-btn
                      class="ma-2"
                      small
                      color="success"
                      :disabled="!validRealAccount"
                      @click="CreateVirtualAccount()"
                    >Create</v-btn>
                  </v-row>
                </v-form>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
        <v-row>
          <v-col xs="12" sm="12" md="3" lg="3" xl="3">
            <v-card height="100%">
              <v-container>
                <v-card-title>
                  <v-row>
                    <v-col cols="12" sm="6" md="6">
                      <v-menu
                        v-model="beginDateMenu"
                        :close-on-content-click="false"
                        :nudge-right="40"
                        transition="scale-transition"
                        offset-y
                        min-width="290px"
                      >
                        <template v-slot:activator="{ on }">
                          <v-text-field
                            v-model="beginDate"
                            label="Begin date"
                            prepend-icon="event"
                            readonly
                            v-on="on"
                          ></v-text-field>
                        </template>
                        <v-date-picker v-model="beginDate" @input="beginDateMenu = false"></v-date-picker>
                      </v-menu>
                    </v-col>
                    <v-col cols="12" sm="6" md="6">
                      <v-menu
                        v-model="endDateMenu"
                        :close-on-content-click="false"
                        :nudge-right="40"
                        transition="scale-transition"
                        offset-y
                        min-width="290px"
                      >
                        <template v-slot:activator="{ on }">
                          <v-text-field
                            v-model="endDate"
                            label="End date"
                            prepend-icon="event"
                            readonly
                            v-on="on"
                          ></v-text-field>
                        </template>
                        <v-date-picker v-model="endDate" @input="endDateMenu = false"></v-date-picker>
                      </v-menu>
                    </v-col>
                    <v-spacer></v-spacer>
                  </v-row>
                </v-card-title>
                <v-card-text>
                  <v-data-table
                    :headers="reports_header"
                    :items="reports"
                    :items-per-page="5"
                    item-key="title"
                    class="elevation-0"
                    height="300"
                    fixed-header
                    disable-pagination
                    hide-default-header
                    hide-default-footer
                    dense
                    loading-text="Loading... Please wait"
                  ></v-data-table>
                </v-card-text>
              </v-container>
            </v-card>
          </v-col>
          <v-col xs="12" sm="12" md="5" lg="5" xl="5">
            <v-card>
              <v-card-title>
                <v-icon large left>show_chart</v-icon>
                <span class="title font-weight-light">Report</span>
              </v-card-title>
              <v-card-text>
                <highcharts class="stock" :constructor-type="'stockChart'" :options="chartOptions"></highcharts>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col xs="12" sm="12" md="4" lg="4" xl="4">
            <v-card height="100%">
              <v-card-title>
                <v-icon large left>show_chart</v-icon>
                <span class="title font-weight-light">Trades</span>
              </v-card-title>
              <v-card-text>
                <v-container fluid>
                  <v-data-table
                    :headers="trades_headers"
                    :items="trades"
                    item-key="id"
                    height="300"
                    dense
                    disable-sort
                    fixed-header
                    disable-pagination
                    hide-default-footer
                  >
                    <template v-slot:item.time="{ item }">{{ getTimeOrderFormat(item.time) }}</template>
                    <template v-slot:item.side="{item: {side}}">
                      <v-chip :color="GetSideColor(side)" label x-small outlined>{{side}}</v-chip>
                    </template>
                  </v-data-table>
                </v-container>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue, { VueConstructor } from 'vue';
import { mapGetters, mapActions } from 'vuex';
import HighchartsVue from 'highcharts-vue';
import Highcharts from 'highcharts';
import stockInit from 'highcharts/modules/stock';
import { ITrade, IRAccount, IVAccount } from '@/store/types';
import uuid from 'uuid/v4';

stockInit(Highcharts);
Vue.use(HighchartsVue);

export default (Vue as VueConstructor<any>).extend({
  data() {
    return {
      beginDate: new Date().toISOString().substr(0, 10),
      endDate: new Date().toISOString().substr(0, 10),
      beginDateMenu: false,
      endDateMenu: false,
      selectedVaccounts: [],
      reports: [
        { title: 'Profile', value: '10' },
        { title: 'Tax', value: '1' },
      ],
      validateAccount: false,
      filteredRaccounts: [],
      newAccount: {
        Name: '',
        ExecutorId: '',
        RealAccount: '',
        RealAccountId: '',
      },
      reports_header: [
        {
          text: 'title',
          value: 'title',
        },
        {
          text: 'value',
          value: 'value',
        },
      ],
      trades_headers: [
        { text: 'Time', value: 'time' },
        { text: 'Ticker', value: 'ticker' },
        { text: 'Side', value: 'side' },
        { text: 'Price', value: 'price' },
        { text: 'Quantity', value: 'quantity' },
      ],
      account_header: [
        {
          text: 'Id',
          value: 'id',
        },
        {
          text: 'Name',
          value: 'name',
        },
        {
          text: 'Executor',
          value: 'executor',
        },
        {
          text: 'Real Account',
          value: 'raccount',
        },
        {
          text: 'Actions',
          align: 'center',
          sortable: false,
          value: 'actions',
        },
      ],
      chartOptions: {
        chart: {
          type: 'area',
          animation: false,
        },
        navigator: {
          enabled: false,
        },
        scrollbar: {
          enabled: false,
        },
        title: {
          text: 'Account not selected',
        },
        rangeSelector: {
          enabled: false,
        },
        xAxis: {
          allowDecimals: false,
          labels: {
            formatter: function() {
              return this.value;
            },
          },
          accessibility: {
            rangeDescription: '',
          },
        },
        yAxis: {
          title: {
            text: 'Orders Volume',
          },
          labels: {
            formatter: function() {
              return this.value / 1000 + 'k';
            },
          },
        },
        tooltip: {
          pointFormat:
            '{series.name} had stockpiled <b>{point.y:,.0f}</b><br/>warheads in {point.x}',
        },
        plotOptions: {
          area: {
            pointStart: 1940,
            marker: {
              enabled: false,
              symbol: 'circle',
              radius: 2,
              states: {
                hover: {
                  enabled: true,
                },
              },
            },
          },
        },
        series: [
          {
            name: 'USA',
            data: [
              null,
              null,
              null,
              null,
              null,
              6,
              11,
              32,
              110,
              235,
              369,
              640,
              1005,
              1436,
              2063,
            ],
          },
        ],
      },
    };
  },
  watch: {
    'newAccount.ExecutorId'(newVal: any) {
      const filteredRaccounts = this.raccounts.filter(
        (raccount) => raccount.executor === newVal);
      this.filteredRaccounts = filteredRaccounts.map(
        (raccount) => raccount.name);
    },
    'newAccount.RealAccount'(newVal: any) {
      const RealAccountId = this.raccounts.filter(
        (raccount) => raccount.name === newVal);
      this.newAccount.RealAccountId = RealAccountId[0].id;
    },
  },
  computed: {
    validName() {
      return (
        (this.newAccount.Name && this.newAccount.Name.length <= 15) || false
      );
    },
    validExecutor() {
      return this.newAccount.ExecutorId && this.validName;
    },
    validRealAccount() {
      return (
        this.validExecutor && this.validName && this.newAccount.RealAccount
      );
    },
    validBalance() {
      return (
        this.validExecutor && this.validName && this.validRealAccount
      );
    },
    vaccounts() {
      return this.$store.state.accounts.vaccounts.map((vaccount: IVAccount) => {
        return vaccount;
      });
    },
    raccounts() {
      return this.$store.state.accounts.raccounts.map((raccount: IRAccount) => {
        return raccount;
      });
    },
    ExecutorsIds() {
      return this.$store.state.accounts.raccounts.map((raccount: IRAccount) => {
        return raccount.executor;
      });
    },
    trades() {
      return this.$store.state.accounts.trades.map((trade: ITrade) => {
        return trade;
      });
    },
    selectedVAccounts() {
      return this.selectedVaccounts.length > 0 ? this.selectedVaccounts[0] : {};
    },
  },
  methods: {
    async SelectVAccount(vaccount: any) {
      this.selectedVaccounts = [];
      this.selectedVaccounts.push(vaccount);
      this.chartOptions.title.text = this.selectedVAccounts.name;
      await this.$store.dispatch(
        'accounts/GetVAccountTrades',
        this.selectedVAccounts.id,
      );
    },
    async DeleteVirtualAccount(accountId: string) {
      Vue.$log.debug(`Delete account: ${accountId}`);
      await this.$store.dispatch('accounts/DeleteVAccount', accountId);
    },
    async CreateVirtualAccount() {
      const acc: IVAccount = {
        id: uuid(),
        name: this.newAccount.Name,
        executor: this.newAccount.ExecutorId,
        raccount: this.newAccount.RealAccountId,
      };
      await this.$store.dispatch('accounts/CreateVAccount', acc);
    },
    GetSideColor(side: string) {
      return side === 'buy' ? 'green' : 'red';
    },
    getTimeOrderFormat(time) {
      const d = new Date(time);
      return (
        d.getFullYear() +
        '-' +
        ('0' + (d.getMonth() + 1)).slice(-2) +
        '-' +
        ('0' + d.getDate()).slice(-2) +
        ' ' +
        d.getHours() +
        ':' +
        ('0' + d.getMinutes()).slice(-2) +
        ':' +
        d.getSeconds()
      );
    },
  },
  async created() {
    await this.$store.dispatch('accounts/GetVAccounts');
    await this.$store.dispatch('accounts/GetRAccounts');
    await this.$store.dispatch('accounts/SubscribeVAccounts');
  },
  async beforeDestroy() {
    await this.$store.dispatch('accounts/UnsubscribeVAccounts');
  },
});
</script>

