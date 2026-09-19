// The server behind the bridgehead. Plain node at the method root, one box a
// work root, and every event meets its door in decide.
// [[spec/design_output/level0#the-bridgehead-and-the-server]]

import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { FOLDER as LOG_FOLDER } from "../../.claude/skills/level0/lib/log.js";
import { relativeTo } from "../../.claude/skills/level0/lib/paths.js";
import { PORT_BASE } from "../../.claude/skills/level0/lib/vehicle.js";
import { biome } from "../doors/biome.js";
import { clock } from "../doors/clock.js";
import { disk } from "../doors/disk.js";
import { index } from "../doors/index.js";
import { log } from "../doors/log.js";
import { proc } from "../doors/proc.js";
import { vale } from "../doors/vale.js";
import { wire } from "../doors/wire.js";
import {
  holdsForAnswer,
  onAgentSpoke,
  onMessageDisplay,
  onPromptSubmit,
  onTurnEnd,
  SPOKE,
} from "./answer.js";
import { SPECS as applySpecs, TOOLS as applyTools } from "./apply.js";
import { asksForUpdate } from "./ask.js";
import { onBash, onDescribe } from "./bash.js";
import { asks } from "./config.js";
import { FINDINGS, findingsFor } from "./findings.js";
import {
  onAgentSpawn,
  onPromptContext,
  onSessionCompact,
  onSessionStart,
  onTurnComplete,
  onTurnSaid,
  owesCanary,
} from "./guidance.js";
import { freshens, projectionsHere, sourcesOf } from "./projection.js";
import { movedCode } from "./reload.js";
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
  holdsCall,
  onRefactorAnswered,
  onStop,
  REFACTOR_ANSWERED,
  sawCall,
  sawPrompt,
  SPECS as stopSpecs,
  TOOLS as stopTools,
} from "./stop.js";
import { TOOLS as handTools, SPECS as toolSpecs } from "./tools.js";
import { registeredPort } from "./vehicle.js";
import { marksSeen, onWrite, schemasHere } from "./write.js";

const OK = 200;
const NOT_FOUND = 404;
const SOON = 20;
const TAKEOVER_PROBE = 2000;
const TAKEOVER_PAUSE = 100;
const TAKEOVER_TRIES = 50;
const PASS = { pass: true };
const GOD = "god";
const BINDING = "engine.binding";

const DOORS = {
  "session.start": opensSession,
  "prompt.context": onPromptContext,
  "prompt.submit": submitsPrompt,
  "classic.MessageDisplay": onMessageDisplay,
  [SPOKE]: onAgentSpoke,
  "session.compact": onSessionCompact,
  "turn.said": onTurnSaid,
  "turn.complete": endsTurn,
  "classic.Stop": onStop,
  "agent.spawn": onAgentSpawn,
  "tool.describe": onDescribe,
  "tool.call": onToolCall,
  [ANSWERED]: onAgentAnswered,
  [REFACTOR_ANSWERED]: onRefactorAnswered,
};

const TOOLS = {
  Grep: answersFromIndex,
  Glob: answersFromIndex,
  Read: onRead,
  Write: onWrite,
  Edit: onWrite,
  MultiEdit: onWrite,
  Bash: onBash,
  [`mcp__level0__${FIND}`]: runsFind,
  ...applyTools,
  ...handTools,
  ...reviewTools,
  ...stopTools,
  ...reportTools,
};

export async function decide(said, box) {
  freshens(box, String(said?.event ?? ""));
  const door = DOORS[String(said?.event ?? "")] ?? pass;
  const answer = letsThrough((await door(said?.e ?? {}, box)) ?? PASS, said, box);
  if (box.registered || String(said?.event ?? "") === "engine.create") return answer;
  box.registered = true;
  return { ...answer, register: answer.register ?? specsOf(box) };
}

function specsOf(box) {
  return [
    findSpec(),
    ...applySpecs(),
    ...toolSpecs(box),
    ...reviewSpecs(),
    ...stopSpecs(box),
    ...reportSpecs(),
  ];
}

function pass() {
  return PASS;
}

// A read hands the agent the text, so the mark comes off it. [[spec/design_output/level0#a-write-meets-its-mark]]
function onRead(e, box) {
  const path = String(e?.file_path ?? "");
  if (!path) return PASS;
  try {
    marksSeen(box, relativeTo(box.root, path), String(box.disk.read(path)));
  } catch {
    // [[spec/design_output/level0#a-write-meets-its-mark]]
  }
  return PASS;
}

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
  onSessionStart(e, box);
  box.schemas = schemasHere(box.disk, box.method);
  box.projections = projectionsHere(box.disk, box.method);
  box.sources = sourcesOf(box.projections, box.disk, box.method, box.work);
  box.restale = "the session start";
  warmIndex(box);
  box.registered = true;
  box.specs = specsOf(box);
  return { register: box.specs, pass: true };
}

function submitsPrompt(e, box) {
  sawPrompt(e, box);
  return onPromptSubmit(e, box);
}

async function onToolCall(e, box) {
  sawCall(e, box);
  asksForUpdate(e, box);
  const held = letsThrough(holdsCall(e, box) ?? holdsForAnswer(e, box), { e }, box);
  if (held?.result || held?.needs) return held;
  const said = await (TOOLS[String(e?.tool ?? "")] ?? pass)(e, box);
  if (!passes(said)) return said;
  return held ?? owesCanary(e, box) ?? PASS;
}

function passes(said) {
  return said === PASS || (said?.pass === true && Object.keys(said).length === 1);
}

function endsTurn(e, box) {
  onTurnEnd(e, box);
  dropsHold(e, box);
  return onTurnComplete(e, box);
}

export function boxOf(method, work = method, doors = {}) {
  const files = doors.disk ?? disk();
  const time = doors.clock ?? clock();
  const outside = doors.proc ?? proc();
  return {
    method,
    work,
    root: work,
    disk: files,
    clock: time,
    proc: outside,
    index: doors.index ?? index(files, outside, time, method, work),
    vale: doors.vale ?? vale(files, outside, method),
    biome: doors.biome ?? biome(files, outside, method),
    log:
      doors.log ?? log(files, time, { folder: join(work, LOG_FOLDER), level: "debug" }),
  };
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
  const stop = async () => {
    await own.log.say("info", "bridge", `the server stops at ${where}`);
    server.close();
    process.exit(0);
  };

  const restart = () => {
    own.log.say("info", "bridge", `the server restarts at ${where}`);
    server.close(() => {
      wire().respawn(process.argv.slice(1));
      process.exit(0);
    });
  };

  const onRequest = (request, response) => {
    // The problems panel reads the battery's findings here, so a rule reaches the editor off one list. [[spec/design_output/lsp]]
    if (request.method === "GET" && String(request.url).startsWith(FINDINGS)) {
      findingsFor(own, request.url).then(
        (said) => answer(response, OK, said),
        (error) => answer(response, OK, { ok: false, found: [], fault: String(error?.message ?? error) }),
      );
      return;
    }
    if (request.method === "POST" && request.url === "/stop") {
      answer(response, OK, { ok: true });
      setTimeout(stop, SOON);
      return;
    }
    if (request.method === "POST" && request.url === "/restart") {
      answer(response, OK, { ok: true });
      setTimeout(restart, SOON);
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
    readBody(request, async (body) => {
      const said = parsed(body);
      const box = boxes(said.root);
      const decided = await decide(said, box);
      await box.log.event(said, decided);
      answer(response, OK, decided);
      // [[spec/design_output/level0#a-fix-reaches-the-session]]
      const moved = movedCode(own, String(said?.event ?? ""));
      if (moved) {
        await own.log.say("info", "bridge", `${moved} moved, so the server restarts`, {
          file: moved,
        });
        setTimeout(restart, SOON);
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

function readBody(request, then) {
  let body = "";
  request.on("data", (chunk) => {
    body += chunk;
  });
  request.on("end", () => then(body));
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

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const args = process.argv.slice(2);
  const at = args.indexOf("--port");
  const method =
    args.find(
      (one) => !one.startsWith("--") && args[args.indexOf(one) - 1] !== "--port",
    ) ?? process.cwd();
  const port =
    Number(at >= 0 ? args[at + 1] : process.env.SE_BRIDGE_PORT) ||
    registeredPort(disk(), process.env, clock(), method);
  await takesOver(port);
  serve(method, port);
}

// A bridge already standing on the port stops, and this one takes the port, so a press of the hook always lands. [[spec/design_output/level0#a-start-takes-the-port]]
export async function takesOver(port, ask = fetch, wait = pause) {
  const at = `http://127.0.0.1:${port}`;
  const stands = async () => {
    try {
      const said = await ask(`${at}/health`, { signal: AbortSignal.timeout(TAKEOVER_PROBE) });
      return Boolean((await said.json())?.ok);
    } catch {
      return false;
    }
  };
  if (!(await stands())) return false;
  try {
    await ask(`${at}/stop`, { method: "POST", signal: AbortSignal.timeout(TAKEOVER_PROBE) });
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
