// THE SERVER behind the bridgehead. Plain node at the method root: it takes
// every event a bridgehead posts, decides it through one door per event, and
// answers what the bridgehead does with it. A bridgehead names the root it
// works in, and the server keeps one box a work root: the rules, the schemas
// and the tools come from the method root it runs from, the log, the notes
// and the files from the work root. Quackitect itself is the case where both
// are one folder. The debugger attaches here, and a restart loses the
// session nothing.
// [[spec/design_output/level0#the-bridgehead-and-the-server]]

import { createServer } from "node:http";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { clock } from "../doors/clock.js";
import { disk } from "../doors/disk.js";
import { index } from "../doors/index.js";
import { log } from "../doors/log.js";
import { proc } from "../doors/proc.js";
import { vale } from "../doors/vale.js";
import { SPECS as applySpecs, TOOLS as applyTools } from "./apply.js";
import {
  onAgentSpawn,
  onPromptContext,
  onSessionCompact,
  onSessionStart,
  onTurnComplete,
  owesCanary,
} from "./guidance.js";
import { freshens, projectionsHere, sourcesOf } from "./projection.js";
import { answersFromIndex, FIND, findSpec, runsFind, warmIndex } from "./search.js";
import { registeredPort } from "./vehicle.js";
import { onWrite, schemasHere } from "./write.js";

export const PORT = 6510;
const PASS = { pass: true };

// One door an event. An event with no door passes.
const DOORS = {
  "session.start": opensSession,
  "prompt.context": onPromptContext,
  "session.compact": onSessionCompact,
  "turn.complete": onTurnComplete,
  "agent.spawn": onAgentSpawn,
  "tool.call": onToolCall,
};

// One handler a tool. A tool with no handler passes.
const TOOLS = {
  Grep: answersFromIndex,
  Glob: answersFromIndex,
  Write: onWrite,
  Edit: onWrite,
  MultiEdit: onWrite,
  [`mcp__level0__${FIND}`]: runsFind,
  ...applyTools,
};

// The one place an event is decided. Put a break on the return.
export async function decide(said, box) {
  freshens(box);
  const door = DOORS[String(said?.event ?? "")] ?? pass;
  return (await door(said?.e ?? {}, box)) ?? PASS;
}

function pass() {
  return PASS;
}

function opensSession(e, box) {
  onSessionStart(e, box);
  box.schemas = schemasHere(box.disk, box.method);
  box.projections = projectionsHere(box.disk, box.method);
  box.sources = sourcesOf(box.projections, box.disk, box.method);
  warmIndex(box);
  return { register: [findSpec(), ...applySpecs()], pass: true };
}

// A tool call meets its handler, and a call passing while the canary is owed carries the ask for it.
async function onToolCall(e, box) {
  const said = await (TOOLS[String(e?.tool ?? "")] ?? pass)(e, box);
  if (said !== PASS) return said;
  return owesCanary(e, box) ?? PASS;
}

// The box of one work root: the two roots, the doors, and the state the doors keep. A test hands in fakes.
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
    index: doors.index ?? index(files, outside, time, method, work),
    vale: doors.vale ?? vale(files, outside, method),
    log: doors.log ?? log(files, time, { folder: join(work, ".se", "log"), level: "debug" }),
  };
}

// One box a work root, made on the first event naming it.
export function boxesOf(method, doors = {}) {
  const held = new Map();
  return (root) => {
    const work = String(root || method);
    if (!held.has(work)) held.set(work, boxOf(method, work, doors));
    return held.get(work);
  };
}

export function serve(method, port = PORT, say = console.log) {
  const boxes = boxesOf(method);
  const own = boxes(method);
  const where = `http://127.0.0.1:${port}`;
  const stop = async () => {
    await own.log.say("info", "bridge", `the server stops at ${where}`);
    server.close();
    process.exit(0);
  };

  const server = createServer((request, response) => {
    if (request.method === "POST" && request.url === "/stop") {
      answer(response, 200, { ok: true });
      setTimeout(stop, 20);
      return;
    }
    if (request.method !== "POST" || request.url !== "/event") {
      const ok = request.url === "/health";
      answer(response, ok ? 200 : 404, { ok, port, method, dead: own.index.dead() });
      return;
    }
    readBody(request, async (body) => {
      const said = parsed(body);
      const box = boxes(said.root);
      const decided = await decide(said, box);
      await box.log.event(said, decided);
      answer(response, 200, decided);
    });
  });

  server.listen(port, "127.0.0.1", async () => {
    await own.log.say("info", "bridge", `the server stands at ${where}`, { root: method });
    say(`the server stands at ${where}, from ${method}`);
  });
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
  return server;
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

// The port: --port, the environment, or the one the register holds for this vehicle.
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const args = process.argv.slice(2);
  const at = args.indexOf("--port");
  const method = args.find((one) => !one.startsWith("--") && args[args.indexOf(one) - 1] !== "--port") ?? process.cwd();
  const port =
    Number(at >= 0 ? args[at + 1] : process.env.SE_BRIDGE_PORT) ||
    registeredPort(disk(), process.env, clock(), method);
  serve(method, port);
}
