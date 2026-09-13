// THE BRIDGEHEAD. One door for every event, "*", and one function behind it.
// It posts the event to the server on this box and does what the answer says:
// pass the event on, return a result, or pass a changed event on. The server
// holds the doors, the log and the state, and a server killed and started
// again takes the next event as if nothing happened. A dead server blocks
// nothing: the event goes on, and one line says so.
// [[spec/design_output/level0#the-bridgehead-and-the-server]]

import { rowOf, SESSION } from "../lib/log.js";

const PORT = 6510;
const URL = `http://127.0.0.1:${PORT}/event`;
let saidDown = false;

export function register(on, _options) {
  on("*", ($, e, next) => seen($, e, next));
}

async function seen($, e, next) {
  const event = String(next?.event ?? "event");
  const answer = await ask($, event, e);
  if (!answer) return next(e);
  if (answer.result !== undefined) return answer.result;
  if (answer.event !== undefined) return next(answer.event);
  return next(e);
}

// One request an event. The answer is JSON, or nothing where the server is down.
async function ask($, event, e) {
  let body = "";
  try {
    body = JSON.stringify({ event, e: e ?? null });
  } catch {
    body = JSON.stringify({ event, e: String(e) });
  }
  try {
    const said = await $.http.fetch(URL, {
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

// The server is down: one line in the log, once, and the event goes on.
async function down($, event, error) {
  if (saidDown) return;
  saidDown = true;
  const row = rowOf(new Date().toISOString(), "warn", "bridge", `the server answers nothing at ${URL}`, {
    event,
    detail: String(error?.message ?? error),
  });
  try {
    let held = "";
    try {
      held = String(await $.fs.read(SESSION));
    } catch {}
    if (held && !held.endsWith("\n")) held += "\n";
    await $.fs.write(SESSION, `${held}${JSON.stringify(row)}\n`);
  } catch {}
}
