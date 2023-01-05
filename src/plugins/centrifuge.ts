import Vue from 'vue';
import Centrifuge from 'centrifuge';

const centrifugePlugin = {

  cf: Centrifuge,
  subscriptions: new Map<string, Centrifuge.Subscription>(),

  install(vue: typeof Vue) {
    this.cf = new Centrifuge(`${process.env.VUE_APP_BACKEND_SOCKET_URI ? process.env.VUE_APP_BACKEND_SOCKET_URI : `wss://${location.hostname}`}/connection/websocket`);
    vue.$cf = this;
  },
  SetToken(token: string): void {
    this.cf.setToken(token);
  },
  RemoveAllListeners(): void {
    this.cf.removeAllListeners();
  },
  On(event: string, listener: (...args: any[]) => void): void {
    this.cf.on(event, listener);
  },
  Connect(): void {
    this.cf.connect();
  },

  Disconnect(): void {
    this.cf.disconnect();
  },
  async RPC(data: any) {
    const resp = await this.cf.rpc(data);
    if (resp.message) {
      throw resp.message;
    }
    return resp.data;
  },
  Subscribe(channel: string, handler: (...args: any[]) => void) {
    if (!this.subscriptions.has(channel)) {
      const sub: Centrifuge.Subscription = this.cf.subscribe(channel, handler);
      this.subscriptions.set(channel, sub);
    }
  },
  Unsubscribe(channel: string) {
    const sub: Centrifuge.Subscription = this.subscriptions.get(channel);
    if (sub) {
      sub.unsubscribe();
      sub.removeAllListeners();
      this.subscriptions.delete(channel);
    }
  },

};

Vue.use(centrifugePlugin);

declare module 'vue/types/vue' {
  interface VueConstructor {
    $cf: typeof centrifugePlugin;
  }
}
