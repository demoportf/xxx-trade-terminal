import VueLogger from 'vuejs-logger';
import Vue from 'vue';
const isProduction = process.env.NODE_ENV === 'production';

const options = {
  isEnabled: true,
  logLevel : isProduction ? 'error' : 'debug',
  stringifyArguments : false,
  showLogLevel : true,
  showMethodName : true,
  separator: '|',
  showConsoleColors: true,
};

interface ILogger {
  error: (data: any) => void;
  info: (data: any) => void;
  debug: (data: any) => void;
  warn: (data: any) => void;
}

Vue.use(VueLogger, options);
declare module 'vue/types/vue' {
  export interface VueConstructor {
    $log: ILogger;
  }
  export interface Vue {
    $log: ILogger;
  }
}
