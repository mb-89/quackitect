// The world beneath the plugin the kit tests share: a hooks door standing or
// down, the binary's runs, and what the session shows, each answered from
// memory and recorded.
// [[spec/tickets/level0-tests-to-plugin-test]]

import type { On } from "claude-code";
import { mock } from "claude-code/testing";

type Body = Record<string, any>;
type Ran = { exitCode: number; stdout: string; stderr: string };

export type World = {
  up: boolean;
  events?: string[];
  door: (path: string, body: Body) => unknown;
  run: (argv: readonly string[]) => Ran | null;
  posts: { path: string; body: Body }[];
  runs: { argv: string[]; init: Body }[];
  said: string[];
  wrote: Map<string, string>;
  spawned: Body[];
  commands: string[];
  prompts: string[];
  harness: Body[];
  registered: string[];
};

// The events a test raises, whole as the engine raises them. [[spec/tickets/level0-tests-to-plugin-test]]
export const START = { cwd: "/tree", surface: null } as never;
export const DONE = { answer: "", durationMs: 1, isAborted: false, reason: "answer" } as never;
export const STEP = { turnId: "t1", index: 0, model: "m", messageCount: 1 } as never;

const EMPTY: Ran = { exitCode: 0, stdout: "", stderr: "" };

export function world(on: On, given: Partial<World> = {}): World {
  const w: World = {
    up: true,
    door: () => ({}),
    run: () => EMPTY,
    posts: [],
    runs: [],
    said: [],
    wrote: new Map(),
    spawned: [],
    commands: [],
    prompts: [],
    harness: [],
    registered: [],
    ...given,
  };
  const value = (v: unknown) => ({ value: v }) as never;
  const deny = (why: string) => ({ deny: why }) as never;
  mock.env(on, {});
  on("fs.read", async (_$, e) =>
    e.path.endsWith("hooks.json") && w.up
      ? value(JSON.stringify({ port: 7001, token: "t", ...(w.events ? { events: w.events } : {}) }))
      : w.wrote.has(e.path)
        ? value(w.wrote.get(e.path))
        : deny("ENOENT: no such file"),
  );
  on("fs.write", async (_$, e) => {
    w.wrote.set(e.path, e.text);
    return value(undefined);
  });
  on("http.fetch", async (_$, e) => {
    if (!w.up) return deny("connect ECONNREFUSED");
    const path = e.url.replace(/^.*\//, "");
    const body = JSON.parse(String(e.init?.body ?? "{}"));
    w.posts.push({ path, body });
    return value({ ok: true, status: 200, text: JSON.stringify(w.door(path, body) ?? null) });
  });
  on("process.run", async (_$, e) => {
    w.runs.push({ argv: [...e.argv], init: { ...(e.init ?? {}) } });
    const ran = w.run(e.argv);
    return ran ? value(ran) : deny("spawn ENOENT");
  });
  on("ui.log", async (_$, e) => {
    w.said.push(String((e as Body)?.text ?? e));
    return value(undefined);
  });
  on("session.usage", async () => value({ context: { tokens: 42 } }));
  on("session.messages", async () => value([{ role: "user", content: "hi" }]));
  on("agent.spawn", async (_$, e) => {
    w.spawned.push(e as Body);
    return { model: "m", agentId: "a1" } as never;
  });
  on("command.run", async (_$, e) => {
    w.commands.push(String((e as Body).command));
    return {} as never;
  });
  on("prompt.submit", async (_$, e) => {
    w.prompts.push(String((e as Body).text));
    return { text: (e as Body).text } as never;
  });
  on("turn.complete", async (_$, e) => ({ text: (e as Body).answer }) as never);
  on("turn.step", async function* (_$, e) {
    yield { kind: "text", index: 0, text: "level0 holds" } as never;
    return { turnId: e.turnId, index: e.index, answer: "level0 holds", toolUses: [], stopReason: "end_turn", usage: null } as never;
  });
  on("tool.register", async (_$, e) => {
    w.registered.push(String((e as Body).name));
    return value(undefined);
  });
  on("session.start", async (_$, e) => ({ cwd: (e as Body).cwd }) as never);
  on("tool.call", async (_$, e) => {
    w.harness.push(e as Body);
    return { result: "the harness ran it" } as never;
  });
  return w;
}

// A run whose argv names the word answers what the table gives it, and every other run answers empty. [[spec/tickets/level0-tests-to-plugin-test]]
export function answering(table: Record<string, Partial<Ran> | null>): World["run"] {
  return (argv) => {
    const word = Object.keys(table).find((one) => argv.includes(one));
    if (word === undefined) return EMPTY;
    const ran = table[word];
    return ran === null ? null : { ...EMPTY, ...ran };
  };
}

// The step the door answers an event with, by event, and an empty step for the rest. [[spec/tickets/level0-tests-to-plugin-test]]
export function stepping(table: Record<string, unknown>): World["door"] {
  return (path, body) => (path === "hook" ? { step: table[body.event] ?? {} } : (table[path] ?? null));
}
