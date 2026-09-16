// THE BRIDGEHEAD. The one hook a project carries: it posts every event to the
// server at the port and does what the answer says, and a second hook reads
// the step's stream. It imports nothing, and a dead server blocks nothing.
// [[spec/design_output/level0#the-bridgehead-and-the-server]]

const PORT = 6510;
const POINTER = ".se/vehicle.json";
const SESSION = ".se/log/session.jsonl";
const COMPACT = "session.compact";
const LIMIT = 4_000_000;
const SHORT = 4000;
const TEXTS = 4;
let port = PORT;
let root = "";
let saidDown = false;
let stepText = "";

const url = () => `http://127.0.0.1:${port}/event`;

export function register(on, _options) {
  on("*", ($, e, next) => seen($, e, next));
  on("turn.step", streams);
}

async function seen($, e, next) {
  const event = String(next?.event ?? "event");
  if (event === "engine.create") return next(e);
  if (event === "session.start") await opens($, e);
  const answer = await ask($, event, e, next);
  if (!answer) return next(e);
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
  const row = {
    at: new Date().toISOString(),
    level: "warn",
    kind: "bridge",
    said: `the server answers nothing at ${url()}`,
    event,
    detail: String(error?.message ?? error),
  };
  try {
    let held = "";
    try {
      held = String(await $.fs.read(SESSION));
    } catch {}
    if (held && !held.endsWith("\n")) held += "\n";
    await $.fs.write(SESSION, `${held}${JSON.stringify(row)}\n`);
    saidDown = true;
  } catch {}
}
