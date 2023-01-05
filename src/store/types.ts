export interface IMainState {
  connected: boolean;
  errors: string[];
  userId: string;
}

export interface IVAccount {
  id: string;
  name: string;
  executor: string;
  raccount: string;
}

export interface IRAccount {
  id: string;
  name: string;
  executor: string;
}

export interface ISymbol {
  ticker: string;
  type: string;
  currency: string;
  exchange: string;
  minIncrement: number;
  minIncrementAmount: number;
  bid: number;
  ask: number;
}

export interface IOrder {
  id: string;
  ticker: string;
  account: string;
  side: string;
  price: number;
  volume: number;
  leaves: number;
  state: string;
  time: number;
}

export interface ITrade {
  id: string;
  ticker: string;
  account: string;
  order: string;
  side: string;
  price: number;
  volume: number;
  time: number;
  fee: number;
}

export interface ITest {
  id: string;
  name: string;
  parent: string;
  state: string;
  progress: number;
  begin: number;
  end: number;
  interval: number;
  strategies: IStrategy[];
}

export interface IStrategy {
  id: string;
  name: string;
  source: string;
  portfolio: string;
  state: string;
  instruments: IInstrument[];
}

export interface IInstrument {
  ticker: string;
  account: string;
  position: number;
}

export interface ILogEntry {
  time: number;
  level: number;
  text: TemplateStringsArray;
}

export interface IOhlcPayload {
  ticker: string;
  interval: string;
  begin: number;
  end: number;
}
