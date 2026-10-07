// THE BRIDGEHEAD. The one hook a project carries: it posts every doored event to
// the hooks door and does what the step says, and a second hook reads the
// step's stream. It imports its own folder alone, and a door standing down
// refuses a guarded call and passes the rest.
// [[spec/design_output/level0#the-bridgehead-and-the-server]]

import type {
  Args,
  EngineInterface,
  Frozen,
  Next,
  On,
  PluginOptions,
  ProcessRunResult,
  StarNext,
  StreamNext,
} from "claude-code";
import { SESSION } from "../lib/log.js";
import {
  type Answer,
  cageDeny,
  cageInput,
  HOOKS_FILE,
  hookOf,
  postOf,
  type Said,
  verbOf,
} from "./cage.ts";
import { CLEAR_FALLBACK_MS, holdsClear, takesClear } from "./clear.ts";
import { type Fields, failureOf, type Given, type Spawned } from "./shape.ts";
import { rawRows, textOf } from "./transcript.ts";

// The span the start road takes. An index standing up runs past a spawn, and the road runs only where no server answers. [[spec/design_output/level0#the-bridgehead-starts-it-too]]
export const STARTING = 180_000;

let root = "";
let method = "";
let saidDown = false;
// The chat line stands apart from the row, so a session start writing the row still leaves the line to say. [[spec/design_output/level0#the-bridge-says-it-falls]]
let toldDown = false;
// The one run of the start road a fall takes, which every event finding the door down awaits. A door that answers clears it, so an index dying mid-session starts once more before the cage refuses. [[spec/tickets/level0-runs-on-the-door]] [[spec/tickets/the-cage-survives-its-index]]
let road: Promise<void> | null = null;
// Whether that run settled, so an answer arriving while the road runs leaves it to finish. [[spec/tickets/the-cage-survives-its-index]]
let roadRan = false;
let stepText = "";

// The engine takes one session start a module and counts them in the source, so this registers none: the module wrapping this one holds the start and calls startsSession from it. [[spec/design_output/level0#the-bridgehead-starts-it-too]]
export function register(on: On, options: PluginOptions): void {
  method = String(options?.method ?? "");
  road = null;
  roadRan = false;
  saidDown = false;
  toldDown = false;
  takesClear();
  // It wraps the door road, so a clear the turn's own hooks leave waiting runs once they answer. [[spec/tickets/the-clear-runs-live-remote]]
  on("turn.complete", clearsAtTurnEnd);
  // Every event the engine raises is an object or nothing, read loosely as the door reads it. [[spec/design_output/level0#the-bridgehead-and-the-server]]
  on("*", ($, e, next) => seen($, e as Given, next));
  on("turn.step", streams);
}

// The door decides every event its standing file names, and every other event passes untouched. A standing file naming no list stands from an older door, which takes every event. With no standing file, the door road runs: the start road runs once, the fall says itself, and a call meets the cage verb. [[spec/tickets/level0-runs-on-the-door]] [[spec/tickets/level0-hooks-hold-no-rule]]
async function seen($: EngineInterface, e: Given, next: StarNext): Promise<unknown> {
  const event = String(next?.event ?? "event");
  if (event === "engine.create") return next(e);
  // The session start names the root the door posts and the log writes under. [[spec/tickets/level0-runs-on-the-door]]
  if (event === "session.start" && e?.cwd) root = String(e.cwd);
  const events = await doored($);
  return Array.isArray(events) && !events.includes(event)
    ? next(e)
    : door($, event, e, next);
}

// The events the standing file names, true where it names no list, or null where no door stands. [[spec/tickets/level0-hooks-hold-no-rule]]
async function doored($: EngineInterface): Promise<readonly string[] | true | null> {
  try {
    const events = JSON.parse(String(await $.fs.read(HOOKS_FILE)))?.events;
    return Array.isArray(events) ? events.map(String) : true;
  } catch {
    return null;
  }
}

// A call meets the cage verb while no door answers, and the verb's deny answers it. A verb answering nothing passes the call, and the fall line says the cage stands down. [[spec/tickets/level0-hooks-hold-no-rule]] [[spec/tickets/a-down-index-refuses-calls]]
async function caged(
  $: EngineInterface,
  event: string,
  e: Given,
  next: StarNext,
): Promise<unknown> {
  if (event !== "tool.call") return next(e);
  try {
    const ran = await $.process.run(verb("cage"), {
      ...(root ? { cwd: root } : {}),
      stdin: cageInput(event, e),
    });
    return cageDeny(ran?.stdout) ?? next(e);
  } catch {
    return next(e);
  }
}

// The door answers, or the start road runs once and the door takes the post again. Still down, a guarded call meets the refusal, and every other event passes. [[spec/tickets/a-down-index-refuses-calls]]
async function door(
  $: EngineInterface,
  event: string,
  e: Given,
  next: StarNext,
): Promise<unknown> {
  const extra = {
    ...(await fillOf($)),
    ...(event === "prompt.submit" ? { messages: rawRows(await messages($)) } : {}),
  };
  const sent = promptOf(event, e, next);
  // A door the start road has yet to stand answers nothing, and only a post still falling once the road ran says so. [[spec/tickets/level0-runs-on-the-door]]
  let answer = await doorAsk($, event, sent, extra, { quiet: true });
  if (!answer) {
    await starts($);
    answer = await doorAsk($, event, sent, extra);
  }
  if (!answer) return caged($, event, e, next);
  let step = answer.step ?? {};
  // A held call asks back for the newest rows on agent.spoke, with the effect's call id, and the back post asks no more. [[spec/tickets/spoke-answer-reaches-the-door]]
  if (step.rows !== undefined) {
    const said = { tool: e?.tool, agentId: e?.agentId, call: step.rows, text: stepText };
    const back = await doorAsk($, "agent.spoke", said, {
      messages: rawRows(await messages($)),
      back: true,
    });
    step = back?.step ?? {};
  }
  if (step.answer?.spawn) return doorSpawns($, step.answer, event);
  // [[spec/tickets/clear-answers-off-the-door]]
  if (step.answer?.clear) return clears($, step.answer, e, next);
  // A rewritten event goes on to the harness in place of the one it read. [[spec/tickets/level0-runs-on-the-door]]
  if (step.answer?.event !== undefined) return next(step.answer.event);
  if (step.answer !== undefined) return step.answer;
  // The prompt context takes the door's named blocks, the rules and the canary among them, beside the session's own. [[spec/tickets/level0-runs-on-the-door]]
  const adds = {
    ...(step.blocks ? { blocks: step.blocks } : {}),
    ...(step.after ? { context: step.after } : {}),
  };
  return Object.keys(adds).length ? mergedBy($, await next(e), adds) : next(e);
}

// The door merges the adds into what the harness answered, which Merged in src/modules/hooks/step.go owns. A merge that falls leaves the answer as the harness gave it. [[spec/tickets/level0-hooks-hold-no-rule]]
async function mergedBy(
  $: EngineInterface,
  said: unknown,
  adds: Readonly<Fields>,
): Promise<unknown> {
  try {
    const post = postOf(JSON.parse(String(await $.fs.read(HOOKS_FILE))), "merge", {
      said: said ?? null,
      adds,
    });
    const answered = await $.http.fetch(post.where, post.init);
    return answered.ok ? JSON.parse(answered.text || "null") : said;
  } catch {
    return said;
  }
}

// A prompt reaches the door with who sent it, which the door reads an owner's turn off. [[spec/tickets/level0-runs-on-the-door]]
function promptOf(event: string, e: Given, next: StarNext): Given {
  if (event !== "prompt.submit" || !e || typeof e !== "object") return e;
  return next?.origin ? { ...e, origin: next.origin } : e;
}

// [[spec/tickets/a-reply-follows-its-prompt]]
async function messages($: EngineInterface): Promise<unknown> {
  try {
    return await $.session.messages();
  } catch {
    return [];
  }
}

async function doorAsk(
  $: EngineInterface,
  event: string,
  e: unknown,
  extra: Readonly<Fields>,
  { quiet = false }: { quiet?: boolean } = {},
): Promise<Said | null> {
  let where = HOOKS_FILE;
  try {
    const post = hookOf(
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

// A door's answer carrying a spawn: the helper runs, its answer goes back to the door, and the door's step answers the call. [[spec/tickets/review-spawns-off-the-door]]
async function doorSpawns($: EngineInterface, answer: Answer, event: string): Promise<unknown> {
  const back = await helped($, answer);
  const said = await doorAsk(
    $,
    String(answer.back?.event ?? "agent.answered"),
    back,
    { back: true },
  );
  return said?.step?.answer ?? { result: "the helper answered, and the door said nothing" };
}

// The helper the answer spawns, and what it says as the back post carries it. [[spec/tickets/the-spawn-reaches-its-guidance]]
async function helped($: EngineInterface, answer: Answer): Promise<Fields> {
  let said: Spawned;
  try {
    // Only an answer carrying a spawn reaches here; one without lets the engine refuse, and the refusal answers. [[spec/tickets/the-spawn-reaches-its-guidance]]
    said = await $.agent.spawn(answer.spawn!);
  } catch (error) {
    said = { deny: String(failureOf(error)?.message ?? error) };
  }
  return {
    ...(answer.back ?? {}),
    text: said?.text ?? "",
    isError: Boolean(said?.isError),
    deny: said?.deny ?? "",
  };
}

// The fill of the context rides every post, and the door reads it where filledOf in src/modules/hooks/stops.go says. The plain call costs nothing. [[spec/design_output/stop#the-context-hands-over]] [[spec/tickets/level0-hooks-hold-no-rule]]
async function fillOf($: EngineInterface): Promise<Fields> {
  try {
    const tokens = (await $.session.usage())?.context?.tokens;
    return Number.isFinite(tokens) ? { fill: tokens } : {};
  } catch {
    return {};
  }
}

// The turn the handover ends: the event goes on, and the conversation clears at the turn's completion, or on a timer where it came first. [[spec/tickets/the-clear-runs-live-remote]]
async function clears(
  $: EngineInterface,
  answer: Answer,
  e: Given,
  next: StarNext,
): Promise<unknown> {
  const out = await next(e);
  holdsClear(String(answer.clear?.prompt ?? ""));
  if (next.event === "turn.complete" && !e?.agentId) await cleared($, "turn.complete");
  else $.clock.after(CLEAR_FALLBACK_MS, () => cleared($, "clock.after"));
  return out;
}

// The main agent's turn completes, the hooks inside it answer, and a clear left waiting runs. [[spec/tickets/the-clear-runs-live-remote]]
async function clearsAtTurnEnd(
  $: EngineInterface,
  e: Frozen<Args<"turn.complete">> & { readonly agentId?: unknown },
  next: Next<"turn.complete">,
) {
  const out = await next(e);
  if (!e?.agentId) await cleared($, "turn.complete");
  return out;
}

async function cleared($: EngineInterface, from: string): Promise<void> {
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
      detail: String(failureOf(error)?.message ?? error),
    });
  }
}

// The step's text reaches the door, which hears the canary off it. [[spec/tickets/level0-runs-on-the-door]]
async function* streams(
  $: EngineInterface,
  e: Frozen<Args<"turn.step">>,
  next: StreamNext<"turn.step">,
) {
  const kinds: Record<string, number> = {};
  stepText = "";
  for await (const chunk of next(e)) {
    const kind = String(chunk?.kind ?? typeof chunk);
    kinds[kind] = (kinds[kind] ?? 0) + 1;
    stepText += textOf(chunk);
    yield chunk;
  }
  const said = { turnId: e?.turnId, index: e?.index, kinds, text: stepText };
  await doorAsk($, "turn.said", said, {});
}

// A fall reaches the person at the moment it falls, beside the row the log takes. The session start says nothing to them, because the start road runs under it. [[spec/design_output/level0#the-bridge-says-it-falls]]
async function down(
  $: EngineInterface,
  event: string,
  error: unknown,
  where: string,
): Promise<void> {
  const why = String(failureOf(error)?.message ?? error);
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

// The one line a person reads where the door falls. [[spec/design_output/level0#the-bridge-says-it-falls]]
export function fellText(why: unknown, where: string): string {
  return [
    `LEVEL ZERO ANSWERS NOTHING. The server answers nothing at ${where}, so no`,
    "rule, no write door and no stop hook reaches this session. It says:",
    `${String(why ?? "").trim()}.`,
    "Say so in your next answer, and run ./RUNME.sh serve to start it again.",
    "Run ./RUNME.sh doctor where that fails, which names what this box holds.",
  ].join(" ");
}

// The line reaches the person through the harness, and a harness carrying no such door leaves the row alone. [[spec/design_output/level0#the-bridge-says-it-falls]]
function says($: EngineInterface, line: string): void {
  try {
    $.ui.log(line);
  } catch {}
}

// An event finding the door down while another starts it waits on that start, so the rules reach it once the door stands. [[spec/design_output/level0#the-bridgehead-starts-it-too]] [[spec/tickets/level0-runs-on-the-door]]
function starts($: EngineInterface): Promise<void> {
  if (!road) {
    roadRan = false;
    road = startsOnce($).finally(() => {
      roadRan = true;
    });
  }
  return road;
}

// A verb of the index binary the method root carries, run in the work root. [[spec/tickets/level0-hooks-hold-no-rule]]
function verb(...words: string[]): string[] {
  return verbOf(method || root || ".", ...words);
}

// Go owns the road: the cloud guard, the standing and the row it prints. A desk prints nothing, and a binary standing nowhere or an answer carrying no row writes the one fall row. [[spec/tickets/level0-hooks-hold-no-rule]]
async function startsOnce($: EngineInterface): Promise<void> {
  let ran: ProcessRunResult | undefined;
  let why = "";
  try {
    ran = await $.process.run(verb("serve", "--bridge"), {
      ...(root ? { cwd: root } : {}),
      timeoutMs: STARTING,
    });
  } catch (error) {
    why = String(failureOf(error)?.message ?? error);
  }
  const out = String(ran?.stdout ?? "").trim();
  if (ran && !out && Number(ran.exitCode) === 0) return;
  try {
    const row: unknown = JSON.parse(out);
    if (row && typeof row === "object") {
      await wrote($, row as Fields);
      return;
    }
  } catch {}
  await wrote($, {
    level: "warn",
    said: "the start road answers no row, so no index starts",
    event: "session.start",
    detail: why || String(ran?.stderr ?? "").trim() || out || `exit ${ran?.exitCode}`,
  });
}

// One row into the session log, written by the bridgehead itself, because the log door stands behind the server the row is about. [[spec/design_output/level0#the-bridgehead-starts-it-too]]
async function wrote($: EngineInterface, said: Readonly<Fields>): Promise<boolean> {
  const row = { at: new Date().toISOString(), kind: "bridge", ...said };
  // The log verb appends the row. A box whose binary stands nowhere throws here, and the row falls back to the read and the write back. [[spec/design_output/log#every-writer-appends]]
  try {
    const { level, said: words, ...extra } = said;
    const ran = await $.process.run(
      verb("log", "--say", JSON.stringify({ level, kind: "bridge", said: words, extra })),
      root ? { cwd: root } : {},
    );
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
          String(failureOf(err)?.code ?? failureOf(err)?.message ?? err),
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
