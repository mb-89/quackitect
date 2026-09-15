// THE BRIDGEHEAD. The one hook a project carries. One door for every event,
// "*", and one function behind it: it posts the event to the server at the
// port, with the root this session works in, and does what the answer says.
// The server holds the doors, the log and the state, and runs wherever the
// method stands. A server killed and started again takes the next event as
// if nothing happened. A dead server blocks nothing: the event goes on, and
// one line says so. This file imports nothing, so a project carries it alone.
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
  // The first event of a session hands an empty table as $, and goes on untouched.
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

// The server asks for a helper: the bridgehead spawns it, posts what it said
// under the event the server names, and returns that answer as the result.
async function spawns($, answer, next) {
  let said;
  try {
    said = await $.agent.spawn(answer.spawn);
  } catch (error) {
    said = { deny: String(error?.message ?? error) };
  }
  const back = {
    ...(answer.then ?? {}),
    text: said?.text ?? "",
    isError: Boolean(said?.isError),
    deny: said?.deny ?? "",
  };
  const done = await ask($, String(answer.then?.event ?? "agent.answered"), back, next);
  return done?.result ?? { result: "the helper answered, and the server said nothing" };
}

// A session opens: the root is the folder it works in, and the port comes off
// the project's pointer, or stays at the base where none stands.
async function opens($, e) {
  if (e?.cwd) root = String(e.cwd);
  try {
    const said = JSON.parse(String(await $.fs.read(POINTER)));
    port = Number(said?.port) || PORT;
  } catch {
    port = PORT;
  }
}

// One request an event. The answer is JSON, or nothing where the server is down.
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

// A step streams: the bridgehead reads the text of the response as it comes,
// keeps it for the calls the response makes, and posts it whole at the end.
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

// The last few texts the agent wrote, oldest first, off the transcript.
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

// A chunk of kind text carries the visible words. Thinking and engine chunks carry none.
function textOf(chunk) {
  if (!chunk || typeof chunk !== "object" || chunk.kind !== "text") return "";
  return typeof chunk.text === "string" ? chunk.text : "";
}

// The server wants the reply the owner is owed: the text of the step in hand,
// or the last text the agent wrote off the transcript. The bridgehead posts
// it as an event of its own, and does what that answer says with the call.
async function spoke($, e, next) {
  const texts = await lastTexts($);
  const text = stepText || texts.at(-1) || "";
  const answer = await ask($, "agent.spoke", { tool: e?.tool, agentId: e?.agentId, text, texts }, next);
  if (!answer) return next(e);
  if (answer.result !== undefined) return answer.result;
  if (answer.after !== undefined) return merged(await next(e), answer.after);
  return next(e);
}

// The compaction hands the whole transcript as its event, and the server reads
// no line of it. It goes on with its flat fields alone, each text cut to a
// page, and so does any event over the wire's limit.
function slim(e) {
  if (!e || typeof e !== "object") return e ?? null;
  const out = {};
  for (const [key, value] of Object.entries(e)) {
    if (typeof value === "string") out[key] = value.slice(0, SHORT);
    else if (typeof value === "number" || typeof value === "boolean") out[key] = value;
  }
  return out;
}

// The server names tools for the client to list, and the bridgehead registers each.
async function registers($, specs) {
  for (const spec of specs) {
    try {
      await $.tool.register(spec);
    } catch {}
  }
}

// The server adds to what the chain beneath answers: a list grows, a text grows
// by a paragraph, and any other field is set.
function merged(said, after) {
  const out = said && typeof said === "object" ? { ...said } : {};
  for (const [key, value] of Object.entries(after ?? {})) {
    if (Array.isArray(value) && Array.isArray(out[key])) out[key] = [...out[key], ...value];
    else if (typeof value === "string" && typeof out[key] === "string" && out[key]) out[key] = `${out[key]}\n\n${value}`;
    else out[key] = value;
  }
  return out;
}

// The server is down: one line in the log, once, and the event goes on.
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
