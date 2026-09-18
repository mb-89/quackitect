// THE BRIDGEHEAD. The one hook a project carries: it posts every event to the
// server at the port and does what the answer says, and a second hook reads
// the step's stream. It imports nothing, and a dead server blocks nothing.
// [[spec/design_output/level0#the-bridgehead-and-the-server]]

// The port base of [[spec/design_output/vehicle#the-register-holds-the-port]], held again here because this hook imports nothing.
const PORT = 6510;
const POINTER = ".se/vehicle.json";
const SESSION = ".se/run/log/session.jsonl";
// The hand's session file of [[spec/design_output/pull#the-hand-and-the-hold]], spelled again here because this hook imports nothing.
const HAND_FILE = ".se/run/session.json";
const COMPACT = "session.compact";
const LIMIT = 4_000_000;
const SHORT = 4000;
const TEXTS = 4;
const STARTING = 10_000;
// The code REASONS reads for a box carrying no node, which a refused spawn means. [[spec/design_output/level0#the-bridgehead-starts-it-too]]
const NO_NODE = 5;
let port = PORT;
let root = "";
let method = "";
let saidDown = false;
let started = false;
let stepText = "";

const url = () => `http://127.0.0.1:${port}/event`;

// THE CLOUD STARTS ITS OWN SERVER. A cloud box carries nobody to press the sidebar button, so the bridgehead starts what the first event finds missing. Node runs this, because a Windows box carries no shell and the guards read the same either way. [[spec/design_output/level0#the-bridgehead-starts-it-too]]
export const START = [
  "const { spawn } = require('node:child_process');",
  "const { existsSync, mkdirSync, openSync } = require('node:fs');",
  "const [here, method] = process.argv.slice(1);",
  "if (!process.env.CLAUDE_CODE_REMOTE && !process.env.SE_CLOUD) process.exit(3);",
  "if (!existsSync(method)) process.exit(4);",
  "if (!existsSync(method + '/node_modules')) process.exit(6);",
  "mkdirSync(here + '/.se/run/log', { recursive: true });",
  "const out = openSync(here + '/.se/run/log/serve.log', 'a');",
  "const argv = [method + '/src/bridge/server.js', method];",
  "const born = spawn(process.execPath, argv, { cwd: method, detached: true, stdio: ['ignore', out, out], windowsHide: true });",
  "born.unref();",
  "process.exit(0);",
].join("\n");

const REASONS = {
  0: ["info", "no server answered, so the bridgehead starts one"],
  1: ["warn", "the start of the server fails"],
  3: ["", "a person starts the server here"],
  4: ["warn", "the method root is absent, so no server starts"],
  5: ["warn", "this box carries no node, so no server starts"],
  6: ["warn", "the setup brings no modules, so no server starts"],
};

// [[spec/design_output/level0#the-bridgehead-starts-it-too]]
export function reasonOf(code) {
  return REASONS[Number(code)] ?? ["warn", `the start answers ${code}, which nobody names`];
}

// [[spec/design_output/pull#a-hand-of-its-own]]
export function spawnTagOf(held) {
  const id = String(held?.id ?? "").trim();
  if (!id) return "";
  return `You are the hand of session ${id} on this box, so you pull under no --as.`;
}

export function register(on, options) {
  method = String(options?.method ?? "");
  on("*", ($, e, next) => seen($, e, next));
  on("turn.step", streams);
  // [[spec/design_output/pull#a-hand-of-its-own]]
  on("agent.spawn", async ($, e, next) => {
    if (e?.own) return next(e);
    const line = spawnTagOf(await sessionHeld($));
    if (!line) return next(e);
    return next({ ...e, prompt: `${line}\n\n${String(e?.prompt ?? "")}` });
  });
}

async function sessionHeld($) {
  try {
    return JSON.parse(String(await $.fs.read(HAND_FILE)));
  } catch {
    return null;
  }
}

async function seen($, e, next) {
  const event = String(next?.event ?? "event");
  if (event === "engine.create") return next(e);
  if (event === "session.start") await opens($, e);
  const answer = await ask($, event, e, next);
  if (!answer) {
    if (event === "session.start") await starts($);
    return next(e);
  }
  if (Array.isArray(answer.register)) await registers($, answer.register);
  if (answer.needs === "reply") return spoke($, e, next);
  if (answer.spawn !== undefined) return spawns($, answer, next);
  if (answer.result !== undefined) return answer.result;
  if (answer.event !== undefined) return next(answer.event);
  if (answer.after !== undefined) return merged(await next(e), answer.after);
  return next(e);
}

async function spawns($, answer, next) {
  let said;
  try {
    said = await $.agent.spawn(answer.spawn);
  } catch (error) {
    said = { deny: String(error?.message ?? error) };
  }
  const back = {
    ...(answer.back ?? {}),
    text: said?.text ?? "",
    isError: Boolean(said?.isError),
    deny: said?.deny ?? "",
  };
  const done = await ask($, String(answer.back?.event ?? "agent.answered"), back, next);
  return done?.result ?? { result: "the helper answered, and the server said nothing" };
}

async function opens($, e) {
  if (e?.cwd) root = String(e.cwd);
  try {
    const said = JSON.parse(String(await $.fs.read(POINTER)));
    port = Number(said?.port) || PORT;
  } catch {
    port = PORT;
  }
}

async function ask($, event, e, next) {
  let body = "";
  try {
    body = JSON.stringify({ event, e: e ?? null, origin: next?.origin ?? null, root });
  } catch {
    body = JSON.stringify({ event, e: String(e), root });
  }
  if (event === COMPACT || body.length > LIMIT) body = JSON.stringify({ event, e: slim(e), origin: next?.origin ?? null, root });
  try {
    const said = await $.http.fetch(url(), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
    });
    if (!said.ok) throw new Error(`status ${said.status}`);
    saidDown = false;
    return JSON.parse(said.text || "{}");
  } catch (error) {
    await down($, event, error);
    return null;
  }
}

async function* streams($, e, next) {
  const kinds = {};
  stepText = "";
  for await (const chunk of next(e)) {
    const kind = String(chunk?.kind ?? typeof chunk);
    kinds[kind] = (kinds[kind] ?? 0) + 1;
    stepText += textOf(chunk);
    yield chunk;
  }
  await ask($, "turn.said", { turnId: e?.turnId, index: e?.index, kinds, text: stepText }, next);
}

async function lastTexts($) {
  const out = [];
  try {
    const rows = await $.session.messages();
    for (let at = rows.length - 1; at >= 0 && out.length < TEXTS; at--) {
      const said = String(rows[at]?.text ?? "").trim();
      if (rows[at]?.role === "assistant" && said) out.unshift(said);
    }
  } catch {}
  return out;
}

function textOf(chunk) {
  if (!chunk || typeof chunk !== "object" || chunk.kind !== "text") return "";
  return typeof chunk.text === "string" ? chunk.text : "";
}

async function spoke($, e, next) {
  const texts = await lastTexts($);
  const text = stepText || texts.at(-1) || "";
  const answer = await ask($, "agent.spoke", { tool: e?.tool, agentId: e?.agentId, text, texts }, next);
  if (!answer) return next(e);
  if (answer.result !== undefined) return answer.result;
  if (answer.after !== undefined) return merged(await next(e), answer.after);
  return next(e);
}

function slim(e) {
  if (!e || typeof e !== "object") return e ?? null;
  const out = {};
  for (const [key, value] of Object.entries(e)) {
    if (typeof value === "string") out[key] = value.slice(0, SHORT);
    else if (typeof value === "number" || typeof value === "boolean") out[key] = value;
  }
  return out;
}

async function registers($, specs) {
  for (const spec of specs) {
    try {
      await $.tool.register(spec);
    } catch {}
  }
}

function merged(said, after) {
  const out = said && typeof said === "object" ? { ...said } : {};
  for (const [key, value] of Object.entries(after ?? {})) {
    if (Array.isArray(value) && Array.isArray(out[key])) out[key] = [...out[key], ...value];
    else if (typeof value === "string" && typeof out[key] === "string" && out[key]) out[key] = `${out[key]}\n\n${value}`;
    else out[key] = value;
  }
  return out;
}

async function down($, event, error) {
  if (saidDown) return;
  saidDown = await wrote($, {
    level: "warn",
    said: `the server answers nothing at ${url()}`,
    event,
    detail: String(error?.message ?? error),
  });
}

// [[spec/design_output/level0#the-bridgehead-starts-it-too]]
async function starts($) {
  if (started) return;
  started = true;
  let ran;
  try {
    ran = await $.process.run(["node", "-e", START, root, method || root], {
      timeoutMs: STARTING,
    });
  } catch (error) {
    // Node itself refuses to start, so this box carries none. [[spec/design_output/level0#the-bridgehead-starts-it-too]]
    await wrote($, {
      level: "warn",
      said: reasonOf(NO_NODE)[1],
      event: "session.start",
      detail: String(error?.message ?? error),
    });
    return;
  }
  const code = Number(ran?.exitCode ?? 1);
  const [level, said] = reasonOf(code);
  if (!level) return;
  await wrote($, {
    level,
    said,
    event: "session.start",
    detail: String(ran?.stderr ?? "").trim() || `exit ${code}`,
  });
}

// One row into the session log, written by the bridgehead itself, because the log door stands behind the server the row is about. [[spec/design_output/level0#the-bridgehead-starts-it-too]]
async function wrote($, said) {
  const row = { at: new Date().toISOString(), kind: "bridge", ...said };
  try {
    let held = "";
    try {
      held = String(await $.fs.read(SESSION));
    } catch {}
    if (held && !held.endsWith("\n")) held += "\n";
    await $.fs.write(SESSION, `${held}${JSON.stringify(row)}\n`);
    return true;
  } catch {
    return false;
  }
}
