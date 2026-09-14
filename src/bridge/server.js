// THE SERVER behind the bridgehead. Plain node on this box: it takes every
// event the bridgehead posts, decides it through one door per event, and
// answers what the bridgehead does with it. The doors live in the files
// beside this one, the outside things behind the doors under src/doors, and
// the state in one box. The debugger attaches here, and a restart loses the
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
import { onPromptContext, onSessionCompact, onSessionStart, onTurnComplete } from "./guidance.js";
import { answersFromIndex, FIND, findSpec, runsFind, warmIndex } from "./search.js";
import { onWrite, schemasHere } from "./write.js";

export const PORT = 6510;
const PASS = { pass: true };

// One door an event. An event with no door passes.
const DOORS = {
  "session.start": opensSession,
  "prompt.context": onPromptContext,
  "session.compact": onSessionCompact,
  "turn.complete": onTurnComplete,
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
};

// The one place an event is decided. Put a break on the return.
export async function decide(said, box) {
  const door = DOORS[String(said?.event ?? "")] ?? pass;
  return (await door(said?.e ?? {}, box)) ?? PASS;
}

function pass() {
  return PASS;
}

function opensSession(e, box) {
  onSessionStart(e, box);
  box.schemas = schemasHere(box.disk, box.root);
  warmIndex(box);
  return { register: [findSpec()], pass: true };
}

function onToolCall(e, box) {
  return (TOOLS[String(e?.tool ?? "")] ?? pass)(e, box);
}

// The box: the root, the doors, and the state the doors keep. A test hands in fakes.
export function boxOf(root, doors = {}) {
  const files = doors.disk ?? disk();
  const time = doors.clock ?? clock();
  return {
    root,
    disk: files,
    clock: time,
    index: doors.index ?? index(files, doors.proc ?? proc(), time, root),
    vale: doors.vale ?? vale(files, doors.proc ?? proc(), root),
    log: doors.log ?? log(files, time, { folder: join(root, ".se", "log"), level: "debug" }),
  };
}

export function serve(root, port = PORT, say = console.log) {
  const box = boxOf(root);
  const where = `http://127.0.0.1:${port}`;
  const stop = async () => {
    await box.log.say("info", "bridge", `the server stops at ${where}`);
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
      answer(response, ok ? 200 : 404, { ok, port, dead: box.index.dead() });
      return;
    }
    readBody(request, async (body) => {
      const said = parsed(body);
      const decided = await decide(said, box);
      await box.log.event(said, decided);
      answer(response, 200, decided);
    });
  });

  server.listen(port, "127.0.0.1", async () => {
    await box.log.say("info", "bridge", `the server stands at ${where}`, { root });
    say(`the server stands at ${where}, and writes its log under ${root}`);
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

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  serve(process.argv[2] ?? process.cwd(), Number(process.env.SE_BRIDGE_PORT ?? PORT));
}
