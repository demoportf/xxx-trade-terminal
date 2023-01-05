<template>
  <v-app id="inspire">
    <v-content>
      <v-container class="fill-height" fluid>
        <v-row align="center" justify="center">
          <v-col cols="12" sm="8" md="4">
            <v-card class="elevation-12">
              <v-toolbar color="primary" dark flat>
                <v-toolbar-title>Login</v-toolbar-title>
                <v-spacer></v-spacer>
              </v-toolbar>
              <v-card-text>
                <v-form @submit.prevent="submit">
                  <v-text-field v-model="username" label="Login" prepend-icon="person" type="text"></v-text-field>
                  <v-text-field v-model="password" label="Password" prepend-icon="lock" type="password"></v-text-field>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" type="submit">Login</v-btn>
                  </v-card-actions>
                </v-form>
              </v-card-text>
              <v-progress-linear :active="progressBar" indeterminate></v-progress-linear>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-content>
    <v-snackbar v-model="errorBar" color="error">
      {{ lastError }}
      <v-btn @click="errorBar = false" dark text>Close</v-btn>
    </v-snackbar>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  data: () => ({
    username: null,
    password: null,
    errorBar: false,
    progressBar: false,
  }),
  computed: {
    lastError()   { return this.$store.getters.lastError; },
    errorsCount() { return this.$store.getters.errorsCount; },
  },
  watch: {
    errorsCount() { this.errorBar = true; },
  },
  methods: {
    async submit() {
      this.progressBar = true;
      try {
        await this.$store.dispatch('Login', {
          password: this.password,
          username: this.username,
        });
        await this.$store.dispatch('Connect');
        this.$router.push('/terminal');
      } catch {
        // catch exception
      } finally {
        this.progressBar = false;
      }
    },
  },
});
</script>
