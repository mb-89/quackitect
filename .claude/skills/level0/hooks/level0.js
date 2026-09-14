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
let port = PORT;
let root = "";
let saidDown = false;

const url = () => `http://127.0.0.1:${port}/event`;

export function register(on, _options) {
  on("*", ($, e, next) => seen($, e, next));
}

async function seen($, e, next) {
  // The first event of a session hands an empty table as $, and goes on untouched.
  const event = String(next?.event ?? "event");
  if (event === "engine.create") return next(e);
  if (event === "session.start") await opens($, e);
  const answer = await ask($, event, e, next);
  if (!answer) return next(e);
  if (Array.isArray(answer.register)) await registers($, answer.register);
  if (answer.result !== undefined) return answer.result;
  if (answer.event !== undefined) return next(answer.event);
  if (answer.after !== undefined) return merged(await next(e), answer.after);
  return next(e);
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

// The server names tools for the client to list, and the bridgehead registers each.
async function registers($, specs) {
  for (const spec of specs) {
    try {
      await $.tool.register(spec);
    } catch {}
  }
}

// The server adds to what the chain beneath answers: a list grows, and any other field is set.
function merged(said, after) {
  const out = said && typeof said === "object" ? { ...said } : {};
  for (const [key, value] of Object.entries(after ?? {})) {
    out[key] = Array.isArray(value) && Array.isArray(out[key]) ? [...out[key], ...value] : value;
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
