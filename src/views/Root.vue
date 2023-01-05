<template>
 <div>
    <v-overlay :value="!connected">
      <v-progress-circular indeterminate size="64">Connecting</v-progress-circular>
    </v-overlay>
  <v-app id="inspire">
    <v-navigation-drawer app mini-variant permanent disable-resize-watcher disable-route-watcher>
      <v-list dense>
        <v-list-item v-for="item in items" :to="item.to" :key="item.title" link>
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar app color="indigo" dark>
      <v-toolbar-title>{{ title }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-col v-if="title==='Terminal'" cols="5" xs="6" sm="6" md="3" lg="2" xl="2">
        <v-select :items="vaccounts" label="Select Account" dense single-line @change="SelectAccount"></v-select>
      </v-col>
      <v-btn icon @click="exit()">
        <v-icon>exit_to_app</v-icon>
      </v-btn>
    </v-app-bar>
    <v-content>
      <router-view></router-view>
    </v-content>
    <v-snackbar v-model="errorBar" color="error">
      {{ lastError }}
      <v-btn @click="errorBar = false" dark text>Close</v-btn>
    </v-snackbar>
  </v-app>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from 'vuex';

export default Vue.extend({
  data() {
    return {
      errorBar: false,
      items: [
        { title: 'Terminal', icon: 'mdi-desktop-classic', to: '/terminal' },
        { title: 'Scripts', icon: 'post_add', to: '/scripts' },
        { title: 'Strategies', icon: 'trending_up', to: '/strategies'},
        { title: 'Accounts', icon: 'account_balance_wallet', to: '/accounts'},
      ],
    };
  },
  computed: {
    ...mapGetters([
      'lastError',
      'errorsCount',
    ]),
    connected() { return this.$store.state.connected; },
    title()     { return this.$route.name; },
    vaccounts() {
      return this.$store.state.terminal.vaccounts.map((acc) => {
        return {
          value: acc.id,
          text: acc.name };
      });
    },
  },
  watch: {
    errorsCount: function() {
      this.errorBar = true;
    },
  },
  methods: {
    SelectAccount(account: string) {
      this.$store.dispatch('terminal/SetVAccount', account);
    },
    exit() {
       this.$store.dispatch('Logout');
       this.$router.push('/login');
    },
  },
});
</script>
