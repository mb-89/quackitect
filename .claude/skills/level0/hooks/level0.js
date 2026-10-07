// THE BRIDGEHEAD. The one hook a project carries: it posts every event to the
// server at the port and does what the answer says, and a second hook reads
// the step's stream. It imports its own folder alone, and a dead server blocks
// nothing.
// [[spec/design_output/level0#the-bridgehead-and-the-server]]

import { configOf } from "../lib/config.js";
import { REPLY_PROBE } from "../lib/guidance.js";
import { SERVE, SESSION } from "../lib/log.js";
import { POINTER, PORT_BASE as PORT } from "../lib/vehicle.js";
import {
  CAGE_KEY,
  doors,
  guarded,
  HOOKS_FILE,
  NEW,
  postOf,
  refusedText,
  stepOf,
} from "./cage.js";
import { CLEAR_FALLBACK_MS, holdsClear, takesClear } from "./clear.js";
import { APPEND, merged, slim } from "./shape.js";
import {
  cageText,
  INSTALL_SKIP,
  INSTALLED,
  NO_NODE,
  reasonOf,
  STARTING,
  spawnTagOf,
  START,
} from "./start.js";
import { beforeIn, textOf, textsOf } from "./transcript.js";

export { cageText, INSTALL_SKIP, reasonOf, STARTING, spawnTagOf, START };

// The hand's session file of [[spec/design_output/pull#the-hand-and-the-hold]], under the runtime folder folders.js owns.
const HAND_FILE = ".se/.runtime/session.json";
const COMPACT = "session.compact";
const LIMIT = 4_000_000;
let port = PORT;
// Whether the start road launched a server this session. [[spec/design_output/level0#rules-ride-the-first-answer]]
let launched = false;
// Whether a server answered any event of this session, so a launch no answer has met reads as starting, and one met reads as a fall. [[spec/design_output/level0#rules-ride-the-first-answer]]
let answered = false;
// The stops held while the launched server answers nothing, so a server that stays down frees the turn after the last. [[spec/design_output/level0#rules-ride-the-first-answer]]
let held = 0;
const HOLDS = 3;
let root = "";
let method = "";
let saidDown = false;
// The chat line stands apart from the row, so a session start writing the row still leaves the line to say. [[spec/design_output/level0#the-bridge-says-it-falls]]
let toldDown = false;
// The one run of the start road a fall takes, which every event finding the door down awaits. A door that answers clears it, so an index dying mid-session starts once more before the cage refuses. [[spec/tickets/level0-runs-on-the-door]] [[spec/tickets/the-cage-survives-its-index]]
let road = null;
// Whether that run settled, so an answer arriving while the road runs leaves it to finish. [[spec/tickets/the-cage-survives-its-index]]
let roadRan = false;
// The span a post runs before a fall with no status reads as the host's cut. The host cuts at its own timeout, well past this, and a fault falls at once. [[spec/design_output/level0#the-bridge-says-it-falls]]
const CUT = 1000;
let cut = CUT;
// The wait tool's name, which the waits module in src/modules/waits registers, spelled again here because this hook imports its own folder alone. [[spec/design_output/level0#the-wait-returns-on-signals]]
const WAIT_CALL = "mcp__level0__wait";
// The client drops the registered tools when it loads this module again, so a module fresh from a load asks for them on each post until an answer hands them back. [[spec/design_output/level0#the-first-call-pays]]
let armed = false;
let stepText = "";
// What the start road answered where it stood down, so the first prompt says the cage is missing. [[spec/design_output/level0#a-session-says-its-cage]]
let cage = null;
export const CAGE_BLOCK = "level0-cage";

const url = () => `http://127.0.0.1:${port}/event`;

const SERVED = "mcp__level0__";

// The engine takes one session start a module and counts them in the source, so this registers none: the module wrapping this one holds the start and calls startsSession from it. [[spec/design_output/level0#the-bridgehead-starts-it-too]]
export function register(on, options) {
  method = String(options?.method ?? "");
  cut = Number(options?.cut ?? CUT);
  road = null;
  roadRan = false;
  reading = 0;
  launched = false;
  answered = false;
  held = 0;
  armed = false;
  probing = false;
  saidDown = false;
  toldDown = false;
  port = PORT;
  cage = null;
  takesClear();
  // It wraps the door road, so a clear the turn's own hooks leave waiting runs once they answer. [[spec/tickets/the-clear-runs-live-remote]]
  on("turn.complete", clearsAtTurnEnd);
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
  await probes($, event, e);
  if (event === "session.start") await opens($, e);
  // Under new the door decides what it names and nothing reaches the bridge, which left the tree. A host event the hook raises while it reads the cage passes untouched, and no door event is one. [[spec/tickets/level0-runs-on-the-door]]
  if (reading > 0 && !doors(event)) return next(e);
  if (await caged($)) return doors(event) ? door($, event, e, next) : next(e);
  const answer = await ask($, event, await before($, event, e), next, {
    ...(await fillOf($, event, e)),
    ...(armed ? {} : { fresh: true }),
  });
  if (!answer) {
    // The session start and the conversation's first read each start the server where none answers, and the road runs once. Neither waits, and the rules ride the next event a server answers. [[spec/design_output/level0#rules-ride-the-first-answer]]
    if (event === "session.start" || event === "prompt.context") await starts($);
    // A tool the server registered answers nowhere past this hook, so a dead bridge says so. [[spec/design_output/level0#the-bridge-says-it-falls]]
    if (event === "tool.call" && String(e?.tool ?? "").startsWith(SERVED)) {
      return { result: missingLine(e) };
    }
    // A cloud turn ending before the launched server answers holds, so the next event carries the rules. [[spec/design_output/level0#rules-ride-the-first-answer]]
    if (event === "classic.Stop" && holdsStop(e)) return { block: STARTING_STOP };
    // The server answers nothing, so the bridgehead says the cage stands down where a reader stands. [[spec/design_output/level0#a-session-says-its-cage]]
    if (event === "prompt.context" && cage) {
      return merged(await next(e), {
        blocks: [{ name: CAGE_BLOCK, text: cageText(cage.code, cage.detail) }],
      });
    }
    return next(e);
  }
  if (Array.isArray(answer.register)) {
    await registers($, answer.register);
    armed = true;
  }
  if (answer.clear) return clears($, answer, e, next);
  if (answer.needs === "reply") return spoke($, e, next);
  if (answer.spawn !== undefined && (answer.result !== undefined || answer.pass)) {
    return besides($, answer, e, next);
  }
  if (answer.spawn !== undefined) return spawns($, answer, next);
  if (answer.result !== undefined) return answer.result;
  // A door rewriting the event names what it puts back, and the note rides the answer the call gives. [[spec/design_output/schema#the-verbs-own-their-fields]]
  if (answer.event !== undefined && answer.after !== undefined)
    return merged(await next(answer.event), answer.after);
  if (answer.event !== undefined) return next(answer.event);
  if (answer.after !== undefined) return merged(await next(e), answer.after);
  return next(e);
}

// The key reads through the layers the bridge reads, so a local override moves the hook as it moves the bridge. [[spec/tickets/a-down-index-refuses-calls]]
async function caged($) {
  reading += 1;
  try {
    return (
      String(await configOf({ read: (at) => $.fs.read(at) }).ask(CAGE_KEY)) === NEW
    );
  } catch {
    return false;
  } finally {
    reading -= 1;
  }
}

// How many reads of the cage key stand open now, so the host events those reads raise pass by. [[spec/tickets/level0-runs-on-the-door]]
let reading = 0;

// The door answers, or the start road runs once and the door takes the post again. Still down, a guarded call meets the refusal, and every other event passes. [[spec/tickets/a-down-index-refuses-calls]]
async function door($, event, e, next) {
  const extra = await fillOf($, event, e);
  const sent = await promptOf($, event, e, next);
  // A door the start road has yet to stand answers nothing, and only a post still falling once the road ran says so. [[spec/tickets/level0-runs-on-the-door]]
  let answer = await doorAsk($, event, sent, extra, { quiet: true });
  if (!answer) {
    await starts($);
    answer = await doorAsk($, event, sent, extra);
  }
  if (!answer) return guarded(event, e) ? { deny: refusedText(e) } : next(e);
  let step = stepOf(answer, event, { asks: true });
  // A held call asks back for the newest rows on agent.spoke, with the effect's call id. [[spec/tickets/spoke-answer-reaches-the-door]]
  if (step.rows !== undefined) {
    const { texts, rows } = await lastTexts($);
    const text = stepText || texts.at(-1) || "";
    const spoken = {
      tool: e?.tool,
      agentId: e?.agentId,
      text,
      texts,
      rows,
      call: step.rows,
    };
    const back = await doorAsk($, "agent.spoke", spoken, {});
    step = back ? stepOf(back, event, { asks: false }) : {};
  }
  if (step.answer?.spawn) return doorSpawns($, step.answer, event);
  // [[spec/tickets/clear-answers-off-the-door]]
  if (step.answer?.clear) return clears($, step.answer, e, next);
  // A rewritten event goes on to the harness in place of the one it read, as the bridge's answer did. [[spec/tickets/level0-runs-on-the-door]]
  if (step.answer?.event !== undefined) return next(step.answer.event);
  if (step.answer !== undefined) return step.answer;
  // The prompt context takes the door's named blocks, the rules and the canary among them, beside the session's own. [[spec/tickets/level0-runs-on-the-door]]
  const adds = {
    ...(step.blocks ? { blocks: step.blocks } : {}),
    ...(step.after ? { context: step.after } : {}),
  };
  return Object.keys(adds).length ? merged(await next(e), adds) : next(e);
}

// A prompt reaches the door with who sent it and the newest row before it, which the door reads an owner's turn off, as the bridge's body carried them. [[spec/tickets/level0-runs-on-the-door]]
async function promptOf($, event, e, next) {
  if (event !== "prompt.submit" || !e || typeof e !== "object") return e;
  const said = await before($, event, e);
  return next?.origin ? { ...said, origin: next.origin } : said;
}

async function doorAsk($, event, e, extra, { quiet = false } = {}) {
  let where = HOOKS_FILE;
  try {
    const post = postOf(
      JSON.parse(String(await $.fs.read(HOOKS_FILE))),
      event,
      e,
      root,
      extra,
    );
    where = post.where;
    const said = await $.http.fetch(post.where, post.init);
    if (!said.ok)
      throw Object.assign(new Error(`status ${said.status}`), { status: said.status });
    const answer = JSON.parse(said.text || "{}");
    saidDown = false;
    toldDown = false;
    if (roadRan) road = null;
    return answer;
  } catch (error) {
    if (!quiet) await down($, event, error, where);
    return null;
  }
}

// [[spec/tickets/a-reply-follows-its-prompt]]
async function lastTexts($) {
  try {
    return textsOf(await $.session.messages());
  } catch {
    return textsOf([]);
  }
}

// [[spec/tickets/a-reply-follows-its-prompt]]
async function before($, event, e) {
  if (event !== "prompt.submit" || !e || typeof e !== "object") return e;
  try {
    return beforeIn(e, await $.session.messages());
  } catch {
    return e;
  }
}

// A door answering a vote and a hand in one: the hand runs, and the vote stands as the answer. [[spec/tickets/the-spawn-reaches-its-guidance]]
export async function besides($, answer, e, next) {
  await spawns($, answer, next);
  if (answer.result !== undefined) return answer.result;
  return next(e);
}

async function spawns($, answer, next) {
  const back = await helped($, answer);
  const done = await ask($, String(answer.back?.event ?? "agent.answered"), back, next);
  return done?.result ?? { result: "the helper answered, and the server said nothing" };
}

// A door's answer carrying a spawn: the helper runs, its answer goes back to the door, and the door's step answers the call. [[spec/tickets/review-spawns-off-the-door]]
async function doorSpawns($, answer, event) {
  const back = await helped($, answer);
  const said = await doorAsk(
    $,
    String(answer.back?.event ?? "agent.answered"),
    back,
    {},
  );
  const step = said ? stepOf(said, event, { asks: false }) : {};
  return step.answer ?? { result: "the helper answered, and the door said nothing" };
}

// The helper the answer spawns, and what it says as the back post carries it. [[spec/tickets/the-spawn-reaches-its-guidance]]
async function helped($, answer) {
  let said;
  try {
    said = await $.agent.spawn(answer.spawn);
  } catch (error) {
    said = { deny: String(error?.message ?? error) };
  }
  return {
    ...(answer.back ?? {}),
    text: said?.text ?? "",
    isError: Boolean(said?.isError),
    deny: said?.deny ?? "",
  };
}

async function opens($, e) {
  if (e?.cwd) root = String(e.cwd);
  answered = false;
  held = 0;
  try {
    const said = JSON.parse(String(await $.fs.read(POINTER)));
    port = Number(said?.port) || PORT;
  } catch {
    port = PORT;
  }
}

async function ask($, event, given, next, extra = {}) {
  const e = stamped(event, given);
  let body = "";
  try {
    body = JSON.stringify({
      event,
      e: e ?? null,
      origin: next?.origin ?? null,
      root,
      ...extra,
    });
  } catch {
    body = JSON.stringify({ event, e: String(e), root });
  }
  if (event === COMPACT || body.length > LIMIT)
    body = JSON.stringify({
      event,
      e: slim(e),
      origin: next?.origin ?? null,
      root,
      ...extra,
    });
  for (;;) {
    const from = Date.now();
    try {
      return await posted($, body);
    } catch (error) {
      // The host cuts a wait at its own timeout, and a server answering its health still runs the wait, so the same post goes again. [[spec/design_output/level0#the-bridge-says-it-falls]]
      if (waited(event, e) && cutAfter(error, from) && (await alive($))) continue;
      return fell($, event, body, error);
    }
  }
}

async function fell($, event, body, error) {
  // A server restarting on another port writes the pointer again, so a post nobody took reads it before the server reads as down. [[spec/design_output/level0#the-bridge-says-it-falls]]
  if (!error?.status && (await repoints($))) {
    try {
      return await posted($, body);
    } catch (again) {
      await down($, event, again);
      return null;
    }
  }
  await down($, event, error);
  return null;
}

// A wait carries the stamp of its first post, so a post again carries on the watch and its cap. [[spec/design_output/level0#the-wait-returns-on-signals]]
function stamped(event, e) {
  if (!waited(event, e) || e?.since) return e;
  return { ...e, since: Date.now() };
}

function waited(event, e) {
  return event === "tool.call" && String(e?.tool ?? "") === WAIT_CALL;
}

// A fall with no status, after the post ran the span, reads as the host's cut. A fault falls at once. [[spec/design_output/level0#the-bridge-says-it-falls]]
function cutAfter(error, from) {
  return !error?.status && Date.now() - from >= cut;
}

// One ask of the health, so a cut on a live server reads apart from a fall. [[spec/design_output/level0#the-bridge-says-it-falls]]
async function alive($) {
  try {
    const said = await $.http.fetch(`http://127.0.0.1:${port}/health`, {
      method: "GET",
    });
    return Boolean(said?.ok);
  } catch {
    return false;
  }
}

// The events the fill rides: every call of the agent's own, and the turn's end, which the harness measures only after the vote. [[spec/design_output/stop#the-context-hands-over]]
const FILLED = new Set(["tool.call", "classic.Stop"]);

// The fill of the context rides every call of the agent's own and the turn's end, because the harness measures it once a turn and a turn runs long. The plain call costs nothing. [[spec/design_output/stop#the-context-hands-over]]
async function fillOf($, event, e) {
  if (!FILLED.has(event) || e?.agentId) return {};
  try {
    const tokens = (await $.session.usage())?.context?.tokens;
    return Number.isFinite(tokens) ? { fill: tokens } : {};
  } catch {
    return {};
  }
}


// The turn the handover ends: the event goes on, and the conversation clears at the turn's completion, or on a timer where it came first. [[spec/tickets/the-clear-runs-live-remote]]
async function clears($, answer, e, next) {
  const out = await next(e);
  holdsClear(String(answer.clear?.prompt ?? ""));
  if (next.event === "turn.complete" && !e?.agentId) await cleared($, "turn.complete");
  else $.clock.after(CLEAR_FALLBACK_MS, () => cleared($, "clock.after"));
  return out;
}

// The main agent's turn completes, the hooks inside it answer, and a clear left waiting runs. [[spec/tickets/the-clear-runs-live-remote]]
async function clearsAtTurnEnd($, e, next) {
  const out = await next(e);
  if (!e?.agentId) await cleared($, "turn.complete");
  return out;
}

async function cleared($, from) {
  const prompt = takesClear();
  if (prompt === null) return;
  try {
    await $.command.run({ command: "clear" });
    await $.prompt.submit({ text: prompt });
  } catch (error) {
    await wrote($, {
      level: "warn",
      said: "the clear the handover asks for fails",
      event: from,
      detail: String(error?.message ?? error),
    });
  }
}

async function posted($, body) {
  const said = await $.http.fetch(url(), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
  });
  if (!said.ok)
    throw Object.assign(new Error(`status ${said.status}`), { status: said.status });
  saidDown = false;
  toldDown = false;
  answered = true;
  // The server answers, so the cage stands and no block says it is missing. [[spec/design_output/level0#a-session-says-its-cage]]
  cage = null;
  return JSON.parse(said.text || "{}");
}

// Whether the pointer names a port other than the one the hook posts to, and the hook takes it. [[spec/design_output/level0#the-bridge-says-it-falls]]
async function repoints($) {
  try {
    const named = Number(JSON.parse(String(await $.fs.read(POINTER)))?.port);
    if (!named || named === port) return false;
    port = named;
    return true;
  } catch {
    return false;
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
  const said = { turnId: e?.turnId, index: e?.index, kinds, text: stepText };
  // The step's text reaches the door under new, which hears the canary off it. [[spec/tickets/level0-runs-on-the-door]]
  if (await caged($)) await doorAsk($, "turn.said", said, {});
  else await ask($, "turn.said", said, next);
}

async function spoke($, e, next) {
  const { texts, rows } = await lastTexts($);
  const text = stepText || texts.at(-1) || "";
  const answer = await ask(
    $,
    "agent.spoke",
    { tool: e?.tool, agentId: e?.agentId, text, texts, rows },
    next,
  );
  if (!answer) return next(e);
  if (answer.result !== undefined) return answer.result;
  if (answer.after !== undefined) return merged(await next(e), answer.after);
  return next(e);
}

async function registers($, specs) {
  for (const spec of specs) {
    try {
      await $.tool.register(spec);
    } catch {}
  }
}

// A launch no answer has met yet reads as starting, and anything else as a dead server. [[spec/design_output/level0#the-first-call-pays]]
function missingLine(e) {
  return starting() ? startingLine(e) : deadLine(e);
}

function starting() {
  return launched && !answered;
}

// The one line a level zero tool answers while the launched server stands up. [[spec/design_output/level0#the-first-call-pays]]
function startingLine(e) {
  return `Level zero is starting on this box, so ${String(e?.tool ?? "")} answers once the server stands. Call it again.`;
}

// The one line a cloud stop holds on while the launched server stands up. [[spec/design_output/level0#rules-ride-the-first-answer]]
export const STARTING_STOP =
  "Level zero is starting on this box, and the next event carries its rules. Make your next call, and read them.";

// A launch means a cloud box, since the road exits before it off one. A stood-down road launched nothing, so a caged box and a desk pass. [[spec/design_output/level0#rules-ride-the-first-answer]]
function holdsStop(e) {
  if (e?.agentId || !starting() || held >= HOLDS) return false;
  held += 1;
  return true;
}

// The one line a level zero tool answers where no server answers. [[spec/design_output/level0#the-bridge-says-it-falls]]
function deadLine(e) {
  return `no server answers at ${url()}, so ${String(e?.tool ?? "")} answers nothing. Run ./RUNME.sh serve, and read ${SERVE} for what it says.`;
}

// A fall reaches the person at the moment it falls, beside the row the log takes. The session start says nothing to them, because the start road runs under it. [[spec/design_output/level0#the-bridge-says-it-falls]]
async function down($, event, error, where = url()) {
  const why = String(error?.message ?? error);
  if (!saidDown) {
    saidDown = true;
    await wrote($, {
      level: "warn",
      said: `the server answers nothing at ${where}`,
      event,
      detail: why,
    });
  }
  if (toldDown || event === "session.start") return;
  toldDown = true;
  says($, fellText(why, where));
}

// The one line a person reads where the bridge falls. [[spec/design_output/level0#the-bridge-says-it-falls]]
export function fellText(why, where = url()) {
  return [
    `LEVEL ZERO ANSWERS NOTHING. The server answers nothing at ${where}, so no`,
    "rule, no write door and no stop hook reaches this session. It says:",
    `${String(why ?? "").trim()}.`,
    "Say so in your next answer, and run ./RUNME.sh serve to start it again.",
    "Run ./RUNME.sh doctor where that fails, which names what this box holds.",
  ].join(" ");
}

// The line reaches the person through the harness, and a harness carrying no such door leaves the row alone. [[spec/design_output/level0#the-bridge-says-it-falls]]
function says($, line) {
  try {
    $.ui.log(line);
  } catch {}
}

// An event finding the door down while another starts it waits on that start, so the rules reach it once the door stands. [[spec/design_output/level0#the-bridgehead-starts-it-too]] [[spec/tickets/level0-runs-on-the-door]]
function starts($) {
  if (!road) {
    roadRan = false;
    road = startsOnce($).finally(() => {
      roadRan = true;
    });
  }
  return road;
}

async function startsOnce($) {
  let ran;
  try {
    ran = await $.process.run(
      ["node", "-e", START, root, method || root, INSTALL_SKIP],
      { timeoutMs: STARTING },
    );
  } catch (error) {
    // Node itself refuses to start, so this box carries none. [[spec/design_output/level0#the-bridgehead-starts-it-too]]
    const detail = String(error?.message ?? error);
    cage = { code: NO_NODE, detail };
    await wrote($, {
      level: "warn",
      said: reasonOf(NO_NODE)[1],
      event: "session.start",
      detail,
    });
    return;
  }
  const code = Number(ran?.exitCode ?? 1);
  launched = code === 0 || code === INSTALLED;
  const [level, said] = reasonOf(code);
  if (!level) return;
  const detail = String(ran?.stderr ?? "").trim() || `exit ${code}`;
  // A warning says the road stood down, so the first prompt carries the cage block. An info says a server starts, and the session reads the rules off it. [[spec/design_output/level0#a-session-says-its-cage]]
  if (level === "warn") cage = { code, detail };
  await wrote($, { level, said, event: "session.start", detail });
}

// The reply probe's marker arms the next call of the session, which lands in the log as the event carries it. [[spec/tickets/the-reply-probe-runs]]
let probing = false;

async function probes($, event, e) {
  if (event === "prompt.submit") {
    probing = String(e?.text ?? "").includes(REPLY_PROBE.marker);
    return;
  }
  if (event !== "tool.call" || !probing || e?.agentId) return;
  probing = false;
  await wrote($, {
    level: "info",
    said: REPLY_PROBE.event,
    event,
    detail: JSON.stringify(slim(e)),
  });
}

// One row into the session log, written by the bridgehead itself, because the log door stands behind the server the row is about. [[spec/design_output/level0#the-bridgehead-starts-it-too]]
async function wrote($, said) {
  const row = { at: new Date().toISOString(), kind: "bridge", ...said };
  // The loader takes $ spelled as $.noun.event alone, so a host running no process throws here, and the row falls back to the read and the write back. [[spec/design_output/log#every-writer-appends]]
  try {
    const file = root ? `${root}/${SESSION}` : SESSION;
    const ran = await $.process.run([
      "node",
      "-e",
      APPEND,
      file,
      `${JSON.stringify(row)}\n`,
    ]);
    return Number(ran?.exitCode ?? 1) === 0;
  } catch {}
  try {
    let held = "";
    try {
      held = String(await $.fs.read(SESSION));
    } catch (err) {
      // A read that fails on a file standing keeps the file, so the session's rows stay whole. [[spec/design_output/log#every-writer-appends]]
      if (
        !/ENOENT|no such|not found|no file/i.test(
          String(err?.code ?? err?.message ?? err),
        )
      )
        return false;
    }
    if (held && !held.endsWith("\n")) held += "\n";
    await $.fs.write(SESSION, `${held}${JSON.stringify(row)}\n`);
    return true;
  } catch {
    return false;
  }
}
