import Vue from 'vue';

const validators = {
  max15chars: (v: string) => (v && v.length <= 15) || 'Input too long',
  isNum: (v: string) => (v && /^[0-9]+[.,]{0,1}[0-9]*$/.test(v)) || 'Not a number',
  notEmpty: (v: any) => (v && v.toString().length > 0) || 'Required field',
  notZero: (v: string) => (!!v) || 'Not a zero',
  isDate: (v: any) => (new Date(v) instanceof Date && !isNaN(new Date(v).getTime())) || 'Invalid date',
};

const validatorsPlugin = {
  install() {
    Object.defineProperty(Vue.prototype, '$validators', { value: validators });
  },
};

Vue.use(validatorsPlugin);
declare module 'vue/types/vue' {
  export interface Vue {
    $validators: typeof validators;
  }
}
