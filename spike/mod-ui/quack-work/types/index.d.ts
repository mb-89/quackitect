export type QuackRow = {
  name: string;
  kind: string;
  state: string;
  step: string;
  progress: string;
  group: string;
  urgent: boolean;
  person: boolean;
  path: string;
};

export type QuackYours = { ticket: string; path: string; step: string; queue: string };

export type QuackLog = { at: string; level: string; kind: string; said: string };

export type QuackSnapshot = {
  isOk: boolean;
  error: string;
  via: string;
  ms: number;
  stamp: number;
  branch: string;
  open: number;
  now: string;
  step: string;
  rows: QuackRow[];
  yours: QuackYours[];
  log: QuackLog[];
  surfaces: string[];
};

export type QuackShown = { name: string; text: string };

declare module "claude-code" {
  interface PluginState {
    "quack-work": {
      snap: QuackSnapshot | null;
      shown: QuackShown | null;
      said: string;
    };
  }
}
