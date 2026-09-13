// THE SERVER behind the bridgehead. Plain node on this box: it takes every
// event the bridgehead posts, decides it through one door per event, and
// answers what the bridgehead does with it. The doors, the log and the state
// live here, so the debugger attaches here, and a restart loses the session
// nothing. A dead index blocks nothing either: the disk answers as before.
// [[spec/design_output/level0#the-bridgehead-and-the-server]]

import { spawnSync } from "node:child_process";
import { appendFileSync, existsSync, mkdirSync } from "node:fs";
import { createServer } from "node:http";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { asked, BIN, readsAnswer, said as saidOf } from "../../.claude/skills/level0/lib/index.js";
import { rowOf, SESSION } from "../../.claude/skills/level0/lib/log.js";

export const PORT = 6510;
export const FIND = "find";
const PASS = { pass: true };
const REWARM = 60000;

// One door an event. An event with no door passes.
const DOORS = {
  "session.start": onSessionStart,
  "tool.call": onToolCall,
};

// One handler a tool. A tool with no handler passes.
const TOOLS = {
  Grep: answersFromIndex,
  Glob: answersFromIndex,
  [`mcp__level0__${FIND}`]: runsFind,
};

// The one place an event is decided. Put a break on the return.
export function decide(said, box) {
  const door = DOORS[String(said?.event ?? "")] ?? pass;
  return door(said?.e ?? {}, box) ?? PASS;
}

function pass() {
  return PASS;
}

// [[spec/design_output/index#the-door-answers-the-tools]]
function onSessionStart(_e, box) {
  warmIndex(box);
  return { register: [findSpec()], pass: true };
}

function onToolCall(e, box) {
  return (TOOLS[String(e?.tool ?? "")] ?? pass)(e, box);
}

// A Grep or a Glob the index answers comes from the rows. Any other reads the disk.
function answersFromIndex(e, box) {
  const ask = asked(e);
  if (!ask || /^([A-Za-z]:)?[\\/]/.test(String(e.path ?? ""))) return PASS;
  const answer = askIndex(box, ask);
  if (!answer) return PASS;
  box.log(
    rowOf(box.at(), "info", "index", `${ask.method} reads the rows`, {
      tool: String(e.tool),
      detail: String(e.pattern ?? "").slice(0, 120),
    }),
  );
  return { result: e.tool === "Glob" ? globShape(answer) : grepShape(e, answer) };
}

// The client wants a hook's answer in the tool's own shape, and the text the
// index library writes fills the content of it.
function globShape(answer) {
  const filenames = answer?.paths ?? [];
  return { durationMs: 0, numFiles: filenames.length, filenames, truncated: Boolean(answer?.cut) };
}

function grepShape(e, answer) {
  const files = answer?.files ?? [];
  const mode = String(e?.output_mode ?? "files_with_matches");
  const filenames = files.map((one) => one.path);
  const shape = { mode, numFiles: filenames.length, filenames };
  if (mode === "content") {
    shape.content = saidOf(e, answer);
    shape.numLines = files.reduce((sum, one) => sum + (one.lines?.length ?? 0), 0);
  }
  if (mode === "count") {
    shape.content = saidOf(e, answer);
    shape.numMatches = files.reduce((sum, one) => sum + Number(one.count ?? 0), 0);
  }
  return shape;
}

// [[spec/design_output/index#the-rank-is-bm25]]
function runsFind(e, box) {
  const words = String(e?.words ?? "").trim();
  if (!words) return { result: { result: `${FIND} takes the words to look for.` } };
  const at = indexAt(box);
  if (!at) return { result: { result: deadIndexLine(box.dead) } };
  const ran = spawnSync(at, [FIND, words], { cwd: box.root, encoding: "utf8", timeout: 20000 });
  if (ran.status !== 0) {
    box.dead = `${BIN} find answers ${ran.status}`;
    return { result: { result: deadIndexLine(box.dead) } };
  }
  return { result: { result: findSaid(ran.stdout) } };
}

// The index answers rows as JSON, and the agent reads them as path, line and text.
function findSaid(stdout) {
  const rows = readsAnswer(stdout);
  if (!Array.isArray(rows) || !rows.length) return "Nothing carries those words.";
  return rows.map((one) => `${one.path}:${one.line}: ${String(one.text ?? "").trim()}`).join("\n");
}

function findSpec() {
  return {
    name: FIND,
    description:
      "Finds the lines in this tree carrying the words, ranked by the index. Ask it before a Grep over the tree, because it reads the rows and not the disk.",
    inputSchema: {
      type: "object",
      properties: { words: { type: "string", description: "The words to look for." } },
      required: ["words"],
    },
  };
}

// [[spec/design_output/index#a-dead-index-speaks]]
function indexAt(box) {
  for (const at of [join(box.root, BIN), `${join(box.root, BIN)}.exe`]) {
    if (existsSync(at)) return at;
  }
  return "";
}

function askIndex(box, ask) {
  const at = indexAt(box);
  if (!at) return null;
  const ran = spawnSync(at, ["call", ask.method, JSON.stringify(ask.params)], {
    cwd: box.root,
    encoding: "utf8",
    timeout: 20000,
  });
  if (ran.status !== 0) {
    box.dead = `${BIN} call answers ${ran.status}`;
    warmIndex(box);
    return null;
  }
  return readsAnswer(ran.stdout);
}

// The index warms at session start, and again after a failed question, once a minute at most.
function warmIndex(box) {
  if (box.now() - (box.warmedAt ?? 0) < REWARM) return;
  box.warmedAt = box.now();
  const at = indexAt(box);
  if (!at) {
    box.dead = `no ${BIN} stands on this box`;
    box.log(rowOf(box.at(),"warn", "index", "the index is dead", { detail: box.dead }));
    return;
  }
  const ran = spawnSync(at, ["standing"], { cwd: box.root, encoding: "utf8", timeout: 60000 });
  if (ran.status === 0) {
    box.dead = "";
    box.log(rowOf(box.at(),"info", "index", "the index is warm"));
    return;
  }
  box.dead = `${BIN} standing answers ${ran.status}`;
  box.log(rowOf(box.at(),"warn", "index", "the index is dead", { detail: box.dead }));
}

function deadIndexLine(why) {
  return `The index is dead: ${why}. Run ./RUNME.sh, which builds it, and Grep reads the disk until then.`;
}

// The line every event leaves: the event, the fields worth a glance, the answer, and the whole event as text.
const GLANCE = ["tool", "agentId", "tool_use_id", "file_path", "command", "reason", "turnId", "index", "model", "name"];

export function lineOf(said, answer, at) {
  const event = String(said?.event ?? "event");
  const e = said?.e;
  const glance = {};
  for (const key of GLANCE) {
    if (e && e[key] !== undefined && e[key] !== null && typeof e[key] !== "object") glance[key] = String(e[key]);
  }
  const text = typeof e?.text === "string" ? e.text : typeof e?.answer === "string" ? e.answer : "";
  const aim = glance.file_path ?? glance.command ?? glance.reason ?? "";
  const head = [event, glance.tool, glance.agentId ? `agent=${glance.agentId}` : "", aim].filter(Boolean).join(" ");
  return rowOf(at, "debug", "hook", head, {
    event,
    ...glance,
    ...(said?.origin?.kind ? { origin: String(said.origin.kind) } : {}),
    ...(text ? { chars: String(text.length) } : {}),
    answer: JSON.stringify(answer),
    text: JSON.stringify({ e: e ?? null, origin: said?.origin ?? null }, null, 1),
  });
}

export function serve(root, port = PORT, say = console.log) {
  const path = join(root, SESSION);
  mkdirSync(dirname(path), { recursive: true });
  const stamp = () => new Date().toISOString();
  const box = {
    root,
    dead: "",
    warmedAt: 0,
    now: () => Date.now(),
    at: stamp,
    log: (row) => appendFileSync(path, `${JSON.stringify(row)}\n`),
  };

  const where = `http://127.0.0.1:${port}`;
  const stop = () => {
    box.log(rowOf(stamp(), "info", "bridge", `the server stops at ${where}`));
    server.close();
    process.exit(0);
  };

  const server = createServer((request, response) => {
    if (request.method === "POST" && request.url === "/stop") {
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify({ ok: true }));
      setTimeout(stop, 20);
      return;
    }
    if (request.method !== "POST" || request.url !== "/event") {
      const ok = request.url === "/health";
      response.writeHead(ok ? 200 : 404, { "content-type": "application/json" });
      response.end(JSON.stringify({ ok, port, dead: box.dead }));
      return;
    }
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
    });
    request.on("end", () => {
      let said = { event: "event", e: null };
      try {
        said = JSON.parse(body || "{}");
      } catch {}
      const answer = decide(said, box);
      box.log(lineOf(said, answer, stamp()));
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify(answer));
    });
  });

  server.listen(port, "127.0.0.1", () => {
    box.log(rowOf(stamp(), "info", "bridge", `the server stands at ${where}`, { root }));
    say(`the server stands at ${where}, and writes ${SESSION} under ${root}`);
  });
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
  return server;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  serve(process.argv[2] ?? process.cwd(), Number(process.env.SE_BRIDGE_PORT ?? PORT));
}
