// The dry probe. It stands the fresh box the cold probe stands, and runs level
// zero on it with no model and no key: the hook module the client loads,
// under a harness raising a session's events the way a client raises them,
// against the index the start road brings up. It asks whether level zero runs.
// [[spec/tickets/level0-runs-on-the-door]]

import { HEARD } from "../../.claude/skills/level0/lib/guidance.js";
import { SESSION } from "../../.claude/skills/level0/lib/log.js";
import { PLUGIN_FOLDER } from "../../.claude/skills/level0/lib/vehicle.js";
import { HOOKS_FILE } from "../../.claude/skills/level0/hooks/cage.js";
import { COLD, coldLines, coldPort, coldTree, stops, tail } from "./probe-cold.js";
import { logRows } from "./probe.js";

// The module the plugin manifest names, which the client loads. [[spec/design_output/level0#the-bridgehead-and-the-server]]
const MODULE = "hooks/pull-tool.js";
// The span one event of the scripted session takes before the probe reads it as hung. [[spec/tickets/level0-runs-on-the-door]]
const EVENT_WAIT = 240_000;
// The owner's prompt reaches the hook as the client's composer sends it. [[spec/design_output/level0#which-prompt-opens-a-turn]]
const OWNER = { kind: "composer" };
const STREAMS = new Set(["turn.step"]);
const CANARY_LINE = /level0 holds this session: \d+ rules?, \d+ notes?, the stop hook (?:on|off)\./;

// [[spec/tickets/level0-runs-on-the-door]]
export const DRY = {
  checks: ["door", "rules", "prompt", "tools", "guard", "canary", "quiet"],
};

// [[spec/tickets/level0-runs-on-the-door]]
export async function probeDry(root, it, say = console.log, delta = "") {
  const temp = it.disk.tempDir("se-dry-");
  const tree = it.join(temp, "tree");
  const port = coldPort(it.pid);
  try {
    if (!coldTree(root, it, say, { temp, tree, port, delta })) return 1;
    const seen = await session(it, tree);
    const checks = readsDry(logRows(it.disk, it.join(tree, SESSION)), seen);
    for (const line of coldLines(checks)) say(line);
    return checks.every((one) => one.pass) ? 0 : 1;
  } finally {
    stops(it, tree);
    it.disk.remove(temp);
  }
}

// The harness a client hands the hook, over the clone: its files, its processes, its posts, and what the hook says and registers. [[spec/tickets/level0-runs-on-the-door]]
export function harnessOf(it, tree, env) {
  const at = (rel) => (String(rel).startsWith("/") ? String(rel) : it.join(tree, rel));
  const seen = { registered: [], said: [], posts: [], held: [] };
  const $ = {
    fs: {
      read: async (rel) => it.disk.read(at(rel)),
      exists: async (rel) => it.disk.exists(at(rel)),
      write: async (rel, text) => {
        it.disk.makeDir(it.join(at(rel), ".."));
        it.disk.write(at(rel), text);
      },
    },
    process: {
      run: (argv, init = {}) =>
        bounded(
          it.proc.start(argv, {
            cwd: init.cwd ?? tree,
            env: { ...env, ...(init.env ?? {}) },
          }),
          init.timeoutMs ?? EVENT_WAIT,
        ),
    },
    http: {
      fetch: async (url, init = {}) => {
        seen.posts.push({ url: String(url), event: eventOf(init.body) });
        const said = await it.http.send(String(url), init);
        return {
          ok: said.status >= 200 && said.status < 300,
          status: said.status,
          text: said.text,
        };
      },
    },
    env: { get: async (key) => env[key] },
    tool: { register: async (spec) => void seen.registered.push(String(spec?.name)) },
    ui: { log: (line) => void seen.said.push(String(line)) },
    session: {
      messages: async () => seen.held,
      usage: async () => ({ context: { tokens: 1000 } }),
    },
    agent: { spawn: async () => ({ text: "" }) },
    command: { run: async () => ({}) },
    prompt: { submit: async () => ({}) },
  };
  return { $, seen };
}

function eventOf(body) {
  try {
    return String(JSON.parse(String(body ?? "{}")).event ?? "");
  } catch {
    return "";
  }
}

function bounded(promise, ms) {
  let timer;
  const cut = new Promise((_, fail) => {
    timer = setTimeout(() => fail(new Error(`no answer in ${ms}ms`)), ms);
  });
  return Promise.race([promise, cut]).finally(() => clearTimeout(timer));
}

// The engine the client runs: each registration wraps the ones after it, a filter names the fields an event must carry, and the client's own answer stands last. [[spec/tickets/level0-runs-on-the-door]]
export function engineOf(register, options = {}) {
  const held = [];
  register((event, filter, made) => {
    held.push({ event, filter: made ? filter : null, run: made ?? filter });
  }, options);
  // A stream event takes its own registrations alone, since the catch-all answers once and a stream yields many. [[spec/tickets/level0-runs-on-the-door]]
  const takes = (one, event, e) =>
    (one.event === event || (one.event === "*" && !STREAMS.has(event))) &&
    Object.entries(one.filter ?? {}).every(([key, value]) => e?.[key] === value);
  return {
    raise($, event, e, last, origin) {
      const chain = held.filter((one) => takes(one, event, e));
      const step = (at) =>
        Object.assign(
          (said) => (at < chain.length ? chain[at].run($, said, step(at + 1)) : last(said)),
          { event, ...(origin ? { origin } : {}) },
        );
      return step(0)(e);
    },
  };
}

// The session a client runs on a cold box: it starts, the owner's prompt arrives while the start road stands the door, the context reads, the answer opens on the canary, a read and a guarded call run, and the turn stops. [[spec/tickets/level0-runs-on-the-door]]
async function session(it, tree) {
  const env = { CLAUDE_CODE_REMOTE: "true", CLAUDE_CODE_ENABLE_FUNCTION_HOOKS: "1" };
  const { $, seen } = harnessOf(it, tree, env);
  const loaded = await import(`${fileUrl(it.join(tree, PLUGIN_FOLDER, MODULE))}?dry=${Date.now()}`);
  const engine = engineOf(loaded.register, {});
  const raise = (event, e, last = async (said) => ({ passed: said }), origin) =>
    bounded(engine.raise($, event, e, last, origin), EVENT_WAIT);

  const opening = raise("session.start", { session_id: `dry-${it.pid}`, cwd: tree });
  const prompt = { text: COLD.prompt };
  const submitted = await raise("prompt.submit", prompt, async (said) => said, OWNER);
  // The client's transcript keeps each row as the session runs, which the answer door reads the reply off. [[spec/tickets/a-reply-follows-its-prompt]]
  seen.held.push({ role: "user", id: "u1", text: String(submitted?.text ?? "") });
  const context = await raise("prompt.context", {}, async () => ({ blocks: [] }));
  await opening;
  const blocks = context?.blocks ?? [];
  const sentence = CANARY_LINE.exec(blocks.map((one) => one.text).join("\n"))?.[0] ?? "";
  const answer = `${sentence}\nThis session probes a fresh box, so it reads README.md and runs git log.`;
  for await (const _ of engine.raise(
    $,
    "turn.step",
    { turnId: "t1", index: 0 },
    async function* () {
      yield { kind: "text", text: answer };
    },
  )) {
  }
  seen.held.push({ role: "assistant", id: "a1", text: answer });
  // The chat shows the text, which pays the answer the owner's prompt asks for. [[spec/design_output/level0#the-owners-prompt-comes-first]]
  await raise("classic.MessageDisplay", { delta: answer });
  const read = await raise("tool.call", { tool: "Read", file_path: it.join(tree, "README.md") });
  const guarded = await raise("tool.call", {
    tool: "Bash",
    command: "git log -1 --oneline",
    description: "show the newest commit",
  });
  await raise("classic.Stop", {}, async () => ({}));
  return {
    door: it.disk.exists(it.join(tree, HOOKS_FILE)),
    blocks,
    sentence,
    prompt,
    submitted,
    read,
    guarded,
    ...seen,
  };
}

function fileUrl(path) {
  return `file://${path.startsWith("/") ? "" : "/"}${path.replaceAll("\\", "/")}`;
}

// [[spec/tickets/level0-runs-on-the-door]]
export function readsDry(rows, seen) {
  return [
    { check: "door", ...doorStood(seen) },
    { check: "rules", ...rulesHanded(rows, seen) },
    { check: "prompt", ...promptHeld(seen) },
    { check: "tools", ...toolsHeld(seen) },
    { check: "guard", ...guardHeld(seen) },
    { check: "canary", ...canaryHeard(rows) },
    { check: "quiet", ...quietRun(rows, seen) },
  ];
}

function doorStood(seen) {
  return seen.door
    ? { pass: true, evidence: `${HOOKS_FILE} stands` }
    : { pass: false, evidence: `the start road left no ${HOOKS_FILE}` };
}

// The rules reach the session as the blocks the context read hands the client, which the client lays before the model. [[spec/design_output/level0#rules-ride-the-first-answer]]
function rulesHanded(rows, seen) {
  const names = (seen.blocks ?? []).map((one) => one.name);
  if (!names.includes("level0-canary"))
    return {
      pass: false,
      evidence: `the context read hands the client ${names.join(" ") || "no block"}`,
    };
  if (!seen.sentence)
    return { pass: false, evidence: "the canary block holds no canary sentence" };
  if (!rows.some((one) => one.kind === "context"))
    return { pass: false, evidence: "no context row" };
  return { pass: true, evidence: `the context read hands the client ${names.join(" ")}` };
}

// An owner's prompt reaches the model with the answer-first line before it. [[spec/design_output/level0#which-prompt-opens-a-turn]]
function promptHeld(seen) {
  const said = String(seen.submitted?.text ?? "");
  const given = String(seen.prompt?.text ?? "");
  if (said === given || !said.endsWith(given))
    return { pass: false, evidence: `the client reads the prompt as given: ${firstOf(said)}` };
  return { pass: true, evidence: `the prompt opens on: ${firstOf(said)}` };
}

// The hook registers the pull, so a name past it proves the index's tools reach the client. [[spec/tickets/level0-tools-leave-the-bridge]]
function toolsHeld(seen) {
  const names = seen.registered ?? [];
  if (names.length < 2)
    return { pass: false, evidence: `the hook registers ${names.join(", ") || "nothing"}` };
  return { pass: true, evidence: `the hook registers ${names.length} tools` };
}

// A read passes to the client, and a call the rules refuse comes back refused. [[spec/rationales/the-cage-refuses-while-down]]
function guardHeld(seen) {
  if (seen.read?.passed === undefined)
    return { pass: false, evidence: `the read never reaches the client: ${shown(seen.read)}` };
  const deny = String(seen.guarded?.deny ?? "");
  if (!deny || /answers nothing/.test(deny))
    return { pass: false, evidence: `the guarded call comes back ${shown(seen.guarded)}` };
  return { pass: true, evidence: `the read passes, and the door refuses: ${firstOf(deny)}` };
}

// The door hears the canary off the answer's text. [[spec/design_output/level0#the-line-lands-once]]
function canaryHeard(rows) {
  const heard = rows.find((one) => one.kind === "level0");
  if (!heard) return { pass: false, evidence: "no level0 row names the canary" };
  if (heard.said !== HEARD.same) return { pass: false, evidence: `the door hears: ${heard.said}` };
  return { pass: true, evidence: `the door hears: ${heard.said}` };
}

// Nothing posts past the hooks door, and no line or row says level zero answers nothing. [[spec/tickets/level0-runs-on-the-door]]
function quietRun(rows, seen) {
  const astray = (seen.posts ?? []).filter((one) => !one.url.endsWith("/hook"));
  if (astray.length)
    return { pass: false, evidence: `${astray.length} post(s) go past the door, first ${astray[0].event} to ${astray[0].url}` };
  const fell = (seen.said ?? []).find((one) => /ANSWERS NOTHING|STANDS DOWN/.test(one));
  if (fell) return { pass: false, evidence: `the session reads: ${firstOf(fell)}` };
  const ruled = rows.findIndex((one) => one.kind === "context");
  const late = rows.find(
    (one, at) => at > ruled && /answers nothing/.test(String(one.said ?? "")),
  );
  if (late) return { pass: false, evidence: `a row past the rules says: ${late.said}` };
  return { pass: true, evidence: `${seen.posts.length} post(s), every one to the hooks door` };
}

const firstOf = (text) => tail(String(text ?? "").split("\n")[0]).slice(0, 160);
const shown = (said) => firstOf(JSON.stringify(said ?? null));
