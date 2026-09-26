// The server behind the bridgehead. Plain node at the method root, one box a
// work root, and every event meets its door in decide.
// [[spec/design_output/level0#the-bridgehead-and-the-server]]

import { join } from "node:path";
import { BINDING, GOD } from "../../.claude/skills/level0/lib/config.js";
import { FOLDER as LOG_FOLDER, SERVE } from "../../.claude/skills/level0/lib/log.js";
import { runsHere } from "../../.claude/skills/level0/lib/paths.js";
import { PORT_BASE } from "../../.claude/skills/level0/lib/vehicle.js";
import { awake } from "../doors/awake.js";
import { biome } from "../doors/biome.js";
import { clock } from "../doors/clock.js";
import { disk } from "../doors/disk.js";
import { index } from "../doors/index.js";
import { log } from "../doors/log.js";
import { proc } from "../doors/proc.js";
import { vale } from "../doors/vale.js";
import { wire } from "../doors/wire.js";
import { projectionsHere, sourcesOf } from "../engine/projection.js";
import { onAgent } from "./agent.js";
import {
  holdsForAnswer,
  onAgentSpoke,
  onMessageDisplay,
  onPromptSubmit,
  onTurnEnd,
  SPOKE,
} from "./answer.js";
import { answerRides, gatesAnswer } from "./answer-read.js";
import { SPECS as applySpecs, TOOLS as applyTools } from "./apply.js";
import { asksForUpdate } from "./ask.js";
import { onBash, onDescribe, onPowerShell } from "./bash.js";
import { bindingLine } from "./binding.js";
import { dropsAll, dropsMoved } from "./caches.js";
import { asks, asksText } from "./config.js";
import { holdsGrace } from "./grace.js";
import {
  onAgentSpawn,
  onPromptContext,
  onSessionCompact,
  onSessionEnd,
  onSessionStart,
  onTurnComplete,
  onTurnSaid,
  owesCanary,
  surveyHere,
} from "./guidance.js";
import {
  clearsAfter,
  holdsForHandover,
  measures,
  onSessionMeasure,
} from "./handover.js";
import { SPECS as logSpecs, TOOLS as logTools } from "./logline.js";
import {
  asksForPlan,
  PLAN,
  PLAN_CALL,
  planField,
  planned,
  SPECS as planSpecs,
  TOOLS as planTools,
} from "./plan.js";
import { freshens } from "./projection.js";
import { SPECS as proseSpecs, TOOLS as proseTools } from "./prose.js";
import { movedCode, provesCode, SELF_TEST } from "./reload.js";
import { SPECS as reportSpecs, TOOLS as reportTools } from "./report.js";
import {
  ANSWERED,
  onAgentAnswered,
  SPECS as reviewSpecs,
  TOOLS as reviewTools,
} from "./review.js";
import { answersFromIndex, FIND, findSpec, runsFind, warmIndex } from "./search.js";
import {
  dropsHold,
  ENDS_TURN,
  helperEnds,
  helperSpawns,
  holdsCall,
  onStop,
  sawCall,
  sawPrompt,
  SPECS as stopSpecs,
  TOOLS as stopTools,
} from "./stop.js";
import { TOOLS as handTools, SPECS as toolSpecs } from "./tools.js";
import { registeredPort } from "./vehicle.js";
import { helperReports, SPECS as waitSpecs, TOOLS as waitTools } from "./wait.js";
import { marksKept, onRead, onToolWrite, schemasHere } from "./write.js";

const OK = 200;
const NOT_FOUND = 404;
const SOON = 20;
const TAKEOVER_PROBE = 2000;
const TAKEOVER_PAUSE = 100;
const TAKEOVER_TRIES = 50;
// The window the old server watches the new one for, past the takeover and the listen. [[spec/design_output/level0#a-restart-watches-its-child]]
const RESPAWN_WAIT = 3000;
const PASS = { pass: true };
const LOG_LEVEL = "log.level";
// The characters one event carries at most, twice what the bridgehead sends before it slims one. [[spec/design_output/level0#a-door-that-throws-passes]]
const BODY_CAP = 8_000_000;

const DOORS = {
  "session.start": opensSession,
  "prompt.context": onPromptContext,
  "prompt.submit": submitsPrompt,
  "classic.MessageDisplay": onMessageDisplay,
  [SPOKE]: onAgentSpoke,
  "session.compact": onSessionCompact,
  "session.end": onSessionEnd,
  "session.measure": onSessionMeasure,
  "turn.said": onTurnSaid,
  "turn.complete": endsTurn,
  // A helper's stop reports, a session due holds for the handover, and the answer gate holds ahead of the tooth. [[spec/design_output/stop#the-context-hands-over]] [[spec/design_output/level0#the-gate-reads-the-answer]]
  "classic.Stop": async (e, box) => {
    // A helper's stop takes its mark off. [[spec/tickets/helper-mark-drops-at-stop]]
    helperEnds(e, box);
    return (
      helperReports(e, box) ??
      holdsForHandover(e, box) ??
      (await gatesAnswer(e, box)) ??
      onStop(e, box)
    );
  },
  // A helper spawned in the background marks the box, so the stop call reads it running. [[spec/tickets/the-stop-reads-the-state]]
  "agent.spawn": (e, box) => {
    helperSpawns(e, box);
    return onAgentSpawn(e, box);
  },
  "tool.describe": onDescribe,
  "tool.call": onToolCall,
  [ANSWERED]: onAgentAnswered,
};

const TOOLS = {
  Grep: answersFromIndex,
  Glob: answersFromIndex,
  Read: onRead,
  // [[spec/design_output/level0#a-write-names-its-ticket]]
  Write: onToolWrite,
  Edit: onToolWrite,
  MultiEdit: onToolWrite,
  NotebookEdit: onToolWrite,
  Bash: onBash,
  PowerShell: onPowerShell,
  Agent: onAgent,
  [`mcp__level0__${FIND}`]: runsFind,
  ...applyTools,
  ...handTools,
  ...reviewTools,
  ...stopTools,
  ...reportTools,
  ...planTools,
  ...proseTools,
  ...logTools,
  ...waitTools,
};

export async function decide(said, box) {
  fillsBox(box);
  if (box.logLevel !== undefined) box.logLevel = asksText(box, LOG_LEVEL) ?? "";
  freshens(box, String(said?.event ?? ""));
  dropsMoved(box, String(said?.event ?? ""));
  // The bridgehead reads the fill at every call of the agent's own, so a long turn reaches the key before it ends. [[spec/design_output/stop#the-context-hands-over]]
  if (said?.fill !== undefined) measures(box, said.fill);
  const door = DOORS[String(said?.event ?? "")] ?? pass;
  const answer = letsThrough((await door(said?.e ?? {}, box)) ?? PASS, said, box);
  // The call's marks reach the file once, after the door answers. [[spec/design_output/level0#the-marks-survive-a-restart]]
  marksKept(box);
  // A module the client loads again marks its post fresh, since the load drops the tools the client held. [[spec/design_output/level0#the-first-call-pays]]
  if ((box.registered && !said?.fresh) || String(said?.event ?? "") === "engine.create")
    return answer;
  box.registered = true;
  return { ...answer, register: answer.register ?? box.specs };
}

// The fields a session start fills, filled again where a restart hands the box over bare. The door and the registration both read them, so this runs ahead of both. A session start passes `again`, because the tree moves under a box that stands. The survey stays with `onSessionStart`, which owns it. [[spec/design_output/level0#a-restart-fills-the-box]]
function fillsBox(box, again = false) {
  if (again || !box.schemas) box.schemas = schemasHere(box.disk, box.method);
  if (!box.tools) box.tools = surveyHere(box);
  if (again || !box.specs) box.specs = specsOf(box);
  return box;
}

function specsOf(box) {
  return [
    findSpec(),
    ...applySpecs(),
    ...toolSpecs(box),
    ...reviewSpecs(),
    ...stopSpecs(box),
    ...reportSpecs(),
    ...planSpecs(),
    ...proseSpecs(),
    ...logSpecs(),
    ...waitSpecs(),
  ].map(withPlanField);
}

// Every level zero call takes the plan's answer as a field, so it rides a call the agent makes anyway. [[spec/design_output/stop#the-plan]]
function withPlanField(spec) {
  if (spec.name === PLAN) return spec;
  const properties = { ...(spec.inputSchema?.properties ?? {}), plan: planField() };
  return {
    ...spec,
    inputSchema: { ...(spec.inputSchema ?? { type: "object" }), properties },
  };
}

// The field on a level zero call answers the ask the way the plan call does. [[spec/design_output/stop#the-plan]]
function planRides(e, box) {
  const tool = String(e?.tool ?? "");
  if (
    !e?.plan ||
    typeof e.plan !== "object" ||
    !tool.startsWith("mcp__level0__") ||
    tool === PLAN_CALL
  )
    return;
  // The field changes the plan alone, and the answer rides no reply, so this road reads the queue no second time. [[spec/design_output/stop#the-plan]]
  planned(e.plan, box);
}

const pass = () => PASS;

// [[spec/design_output/level0#god-mode]]
function letsThrough(answer, said, box) {
  if (asks(box, BINDING) !== GOD) return answer;
  const { needs, result, ...rest } = answer ?? {};
  const held = needs
    ? "the hold"
    : result?.deny !== undefined
      ? "the refusal"
      : result?.block !== undefined
        ? "the block"
        : "";
  if (!held) return answer;
  box.log.say(
    "info",
    "god",
    `god mode lets ${held} of ${said?.e?.tool ?? said?.event ?? ""} through`,
    {
      tool: String(said?.e?.tool ?? ""),
      detail: String(result?.deny ?? result?.block ?? needs).replace(/\s+/g, " "),
    },
  );
  return { ...rest, pass: true };
}

function opensSession(e, box) {
  // A session start rotates the log, so a reader of it starts again from the top. [[spec/design_output/log#a-reader-reads-new-rows]]
  box.tallies = {};
  // [[spec/design_output/level0#a-cache-follows-its-file]]
  dropsAll(box);
  onSessionStart(e, box);
  box.projections = projectionsHere(box.disk, box.method);
  box.sources = sourcesOf(box.projections, box.disk, box.method, box.work);
  box.restale = "the session start";
  warmIndex(box);
  box.registered = true;
  return { register: fillsBox(box, true).specs, pass: true };
}

function submitsPrompt(e, box) {
  sawPrompt(e, box);
  // A change of the binding writes its line at the next prompt, naming the file that sets it. [[spec/tickets/the-retro-holds-the-clear]]
  bindingLine(box);
  return onPromptSubmit(e, box);
}

async function onToolCall(e, box) {
  sawCall(e, box);
  asksForUpdate(e, box);
  // The engine's three questions come round every so many of the agent's own calls. [[spec/design_output/stop#the-plan]]
  if (!e?.agentId) {
    planRides(e, box);
    box.calls = (box.calls ?? 0) + 1;
    asksForPlan(box, box.calls);
  }
  // The engine's own ask meets the call after the owner's hold and before the answer door. [[spec/design_output/stop#the-grace]]
  const held = letsThrough(
    holdsCall(e, box) ?? holdsGrace(e, box, ENDS_TURN) ?? holdsForAnswer(e, box),
    { e },
    box,
  );
  if (held?.result || held?.needs) return held;
  const said = await (TOOLS[String(e?.tool ?? "")] ?? pass)(e, box);
  if (!passes(said)) return said;
  // [[spec/design_output/level0#the-findings-ride-the-call]]
  return held ?? answerRides(e, box, owesCanary(e, box)) ?? PASS;
}

function passes(said) {
  return said === PASS || (said?.pass === true && Object.keys(said).length === 1);
}

function endsTurn(e, box) {
  onTurnEnd(e, box);
  dropsHold(e, box);
  return clearsAfter(e, box, onTurnComplete(e, box));
}

export function boxOf(method, work = method, doors = {}) {
  const files = doors.disk ?? disk();
  const time = doors.clock ?? clock();
  const outside = doors.proc ?? proc();
  const box = {
    method,
    work,
    root: work,
    // The root builds the box, so the modules past it read the environment here. [[spec/design_output/doors#a-door-reads-the-outside]]
    env: doors.env ?? process.env,
    node: doors.node ?? process.execPath,
    pid: doors.pid ?? process.pid,
    disk: files,
    clock: time,
    proc: outside,
    index: doors.index ?? index(files, outside, time, method, work),
    vale: doors.vale ?? vale(files, outside, method, work),
    biome: doors.biome ?? biome(files, outside, method),
    awake: doors.awake ?? awake(),
    log: doors.log,
  };
  if (box.log) return box;
  // The box writes at the level its config names, read again at each event, so a change reaches the next line. [[spec/design_output/log#what-a-box-writes]]
  box.logLevel = asksText(box, LOG_LEVEL) ?? "";
  box.log = log(files, time, {
    folder: join(work, LOG_FOLDER),
    level: () => box.logLevel,
  });
  return box;
}

export function boxesOf(method, doors = {}) {
  const held = new Map();
  return (root) => {
    const work = String(root || method);
    if (!held.has(work)) held.set(work, boxOf(method, work, doors));
    return held.get(work);
  };
}

export function serve(method, port = PORT_BASE, say = console.log) {
  const boxes = boxesOf(method);
  const own = boxes(method);
  const where = `http://127.0.0.1:${port}`;
  // The box stays up while the server runs, and the stop lets it go. [[spec/design_output/level0#the-server-holds-off-sleep]]
  const held = own.awake.hold();
  const stop = async () => {
    held.release();
    await own.log.say("info", "bridge", `the server stops at ${where}`);
    server.close();
    process.exit(0);
  };

  const restart = () => {
    held.release();
    own.log.say("info", "bridge", `the server restarts at ${where}`);
    server.close(() => respawned(own, [process.execPath, ...process.argv.slice(1)]));
  };

  const onRequest = (request, response) => {
    if (request.method === "POST" && request.url === "/stop") {
      answer(response, OK, { ok: true });
      setTimeout(stop, SOON);
      return;
    }
    // An asked restart meets the self-test too, so the server steps down for code that loads alone. [[spec/design_output/level0#new-code-proves-it-loads]]
    if (request.method === "POST" && request.url === "/restart") {
      answer(response, OK, { ok: true });
      setTimeout(async () => {
        if (await provesCode(own, "")) restart();
      }, SOON);
      return;
    }
    if (request.method !== "POST" || request.url !== "/event") {
      const ok = request.url === "/health";
      answer(response, ok ? OK : NOT_FOUND, {
        ok,
        port,
        method,
        dead: own.index.dead(),
      });
      return;
    }
    readBody(request, async (body, over) => {
      answer(response, OK, await answersEvent(body, over, boxes, own));
      try {
        // The new code proves it loads before the server steps down for it. [[spec/design_output/level0#new-code-proves-it-loads]]
        const moved = movedCode(own, String(parsed(body)?.event ?? ""));
        if (!moved || !(await provesCode(own, moved))) return;
        await own.log.say("info", "bridge", `${moved} moved, so the server restarts`, {
          file: moved,
        });
        setTimeout(restart, SOON);
      } catch (error) {
        await own.log.say(
          "error",
          "bridge",
          `the code read throws: ${error?.message ?? error}`,
        );
      }
    });
  };

  const server = wire().listen(port, onRequest, async () => {
    await own.log.say("info", "bridge", `the server stands at ${where}`, {
      root: method,
    });
    say(`the server stands at ${where}, from ${method}`);
  });
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
  // [[spec/design_output/level0#a-crash-writes-its-error]]
  const crash = (error) => crashed(own, where, error);
  process.on("uncaughtException", crash);
  process.on("unhandledRejection", crash);
  return server;
}

// The old server watches the new one for a window, so a respawn that falls writes why to the log, and no silent port stays behind. [[spec/design_output/level0#a-restart-watches-its-child]]
export async function respawned(own, argv, exit = process.exit, wait = RESPAWN_WAIT) {
  const out = join(own.work, ...SERVE.split("/"));
  own.disk.makeDir(join(own.work, ...LOG_FOLDER.split("/")));
  const was = own.disk.exists(out) ? String(own.disk.read(out)) : "";
  const born = await own.proc.respawn(argv, { out, waitMs: wait });
  if (!born.fell) return exit(0);
  const now = own.disk.exists(out) ? String(own.disk.read(out)) : "";
  const wrote = (now.startsWith(was) ? now.slice(was.length) : now).trim();
  try {
    await own.log.say(
      "fatal",
      "bridge",
      `the respawn falls with exit ${born.exitCode}: ${reasonIn(wrote)}`,
      { said: wrote },
    );
  } catch {}
  exit(1);
}

// The line naming the fault, out of what the child wrote: the first naming an error, else the last. [[spec/design_output/level0#a-restart-watches-its-child]]
function reasonIn(wrote) {
  const lines = wrote
    .split("\n")
    .map((one) => one.trim())
    .filter(Boolean);
  return (
    lines.find((one) => /error/i.test(one)) ??
    lines.at(-1) ??
    `it wrote nothing to ${SERVE}`
  );
}

// A crash writes its error last, so the log says why the server falls. [[spec/design_output/level0#a-crash-writes-its-error]]
export async function crashed(own, where, error, exit = process.exit) {
  try {
    await own.log.say(
      "fatal",
      "bridge",
      `the server falls at ${where}: ${error?.message ?? error}`,
      {
        stack: String(error?.stack ?? ""),
      },
    );
  } catch {}
  exit(1);
}

// A body past the cap stops growing, and the event passes unread. [[spec/design_output/level0#a-door-that-throws-passes]]
function readBody(request, then) {
  let body = "";
  let over = false;
  request.on("data", (chunk) => {
    if (over) return;
    body += chunk;
    if (body.length > BODY_CAP) {
      over = true;
      body = "";
    }
  });
  request.on("end", () => then(body, over));
}

// One event through its door. A throw inside a door answers pass and writes a fault line, so one broken door drops no box and ends no server. [[spec/design_output/level0#a-door-that-throws-passes]]
export async function answersEvent(body, over, boxes, own) {
  if (over) {
    await own.log.say(
      "warn",
      "bridge",
      `an event past ${BODY_CAP} characters passes unread`,
    );
    return PASS;
  }
  const said = parsed(body);
  let box = own;
  try {
    box = boxes(said.root);
    const decided = await decide(said, box);
    await box.log.event(said, decided);
    return decided;
  } catch (error) {
    try {
      await box.log.say(
        "error",
        "bridge",
        `${said?.event ?? "an event"} throws in a door, and passes: ${error?.message ?? error}`,
        { tool: String(said?.e?.tool ?? ""), stack: String(error?.stack ?? "") },
      );
    } catch {}
    return PASS;
  }
}

function parsed(body) {
  try {
    return JSON.parse(body || "{}");
  } catch {
    return { event: "event", e: null };
  }
}

function answer(response, status, said) {
  response.writeHead(status, { "content-type": "application/json" });
  response.end(JSON.stringify(said));
}

if (runsHere(import.meta.url, process.argv)) {
  const args = process.argv.slice(2);
  const at = args.indexOf("--port");
  const method =
    args.find(
      (one) => !one.startsWith("--") && args[args.indexOf(one) - 1] !== "--port",
    ) ?? process.cwd();
  // The self-test loads every module, drives one of each event, and exits before any port. [[spec/design_output/level0#new-code-proves-it-loads]]
  if (args.includes(SELF_TEST)) {
    const { selfTests } = await import("./selftest.js");
    process.exit(await selfTests(method, { boxOf, decide }));
  }
  const port =
    Number(at >= 0 ? args[at + 1] : process.env.SE_BRIDGE_PORT) ||
    registeredPort(
      disk(),
      process.env,
      clock(),
      method,
      process.pid,
      process.platform === "win32",
    );
  await takesOver(port);
  serve(method, port);
}

// A bridge already standing on the port stops, and this one takes the port, so a press of the hook always lands. [[spec/design_output/level0#a-start-takes-the-port]]
export async function takesOver(port, ask = fetch, wait = pause) {
  const at = `http://127.0.0.1:${port}`;
  const stands = async () => {
    try {
      const said = await ask(`${at}/health`, {
        signal: AbortSignal.timeout(TAKEOVER_PROBE),
      });
      return Boolean((await said.json())?.ok);
    } catch {
      return false;
    }
  };
  if (!(await stands())) return false;
  try {
    await ask(`${at}/stop`, {
      method: "POST",
      signal: AbortSignal.timeout(TAKEOVER_PROBE),
    });
  } catch {}
  for (let tries = 0; tries < TAKEOVER_TRIES; tries++) {
    await wait(TAKEOVER_PAUSE);
    if (!(await stands())) return true;
  }
  return true;
}

function pause(ms) {
  return new Promise((done) => setTimeout(done, ms));
}
