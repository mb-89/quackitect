// The cold probe. It clones the commit this tree stands on into a fresh
// folder, runs the install a cloud setup runs, runs the client headless once,
// and reads the log and the stream that run leaves for the start road whole.
// [[spec/design_output/level0#the-cold-probe]]

import { canaryIn, HEARD } from "../../.claude/skills/level0/lib/guidance.js";
import { SESSION } from "../../.claude/skills/level0/lib/log.js";
import {
  PLUGIN_FOLDER,
  POINTER,
  PORT_BASE,
} from "../../.claude/skills/level0/lib/vehicle.js";
import { INSTALL_SKIP, READ_TOOLS } from "../../.claude/skills/level0/hooks/level0.js";
import { logRows } from "./probe.js";

const SERVED = "mcp__level0__";
const READS = new Set(READ_TOOLS.map((one) => `${SERVED}${one.name}`));
// The span each outside run gets, the bound the compaction probe takes. [[spec/design_output/level0#what-the-probe-does]]
const WAIT = 900000;
// The cold server's port stands past the base, so a server a desk runs keeps its own. [[spec/design_output/level0#the-cold-probe]]
const SPREAD = 200;
const PAST = 200;
const TAIL = 6;

// [[spec/design_output/level0#the-cold-probe]]
export const COLD = {
  checks: ["hook", "server", "rules", "tools", "canary"],
  prompt: [
    "This session probes a fresh box. Make two tool calls, one after the other.",
    "First read README.md with the Read tool.",
    "Then run `git log -1 --oneline` through Bash, with a short description.",
    "Then answer in five lines at most.",
    "End the answer with one line starting `TOOLS:` that names every tool you hold",
    "whose name starts with mcp__level0__, or `TOOLS: none`.",
  ].join(" "),
};

// The cold path: the bridgehead, the start road, the guidance delivery, and the probe itself. A commit touching one runs the probe. [[spec/design_output/level0#the-cold-probe]]
export const COLD_PATH = [
  ".claude/skills/level0/hooks/",
  ".claude/skills/level0/lib/guidance.js",
  "src/bridge/guidance.js",
  "src/bridge/selftest.js",
  "src/bridge/server.js",
  "src/scripts/install.sh",
  "src/scripts/probe-cold.js",
];

// A folder entry ends on a slash and takes every path under it, and a file entry takes itself alone. [[spec/design_output/level0#the-cold-probe]]
export function coldIn(paths) {
  return (paths ?? []).filter((path) =>
    COLD_PATH.some((cold) =>
      cold.endsWith("/") ? path.startsWith(cold) : path === cold,
    ),
  );
}

export function coldPort(pid) {
  return PORT_BASE + PAST + (Number(pid) % SPREAD);
}

// The stream the client writes under stream-json: the tools at init, the texts and calls of the session's own, and the result. [[spec/design_output/level0#the-cold-probe]]
export function stepsOf(stream) {
  const steps = { tools: [], texts: [], called: [], result: "" };
  for (const text of String(stream ?? "").split("\n")) {
    const one = parsed(text);
    if (!one) continue;
    if (one.type === "system" && one.subtype === "init") {
      steps.tools.push(...(one.tools ?? []).map(String));
    }
    if (one.type === "result") steps.result = String(one.result ?? "");
    if (one.type !== "assistant" || one.parent_tool_use_id) continue;
    for (const part of one.message?.content ?? []) {
      if (part?.type === "text") steps.texts.push(String(part.text ?? ""));
      if (part?.type === "tool_use") steps.called.push(String(part.name ?? ""));
    }
  }
  return steps;
}

function parsed(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

// [[spec/design_output/level0#the-cold-probe]]
export function readsCold(rows, steps) {
  const said = rows ?? [];
  return [
    { check: "hook", ...hookRan(said) },
    { check: "server", ...serverAnswered(said) },
    { check: "rules", ...rulesReached(said) },
    { check: "tools", ...toolsRegistered(steps) },
    { check: "canary", ...canaryOnce(said, steps) },
  ];
}

const ours = (row) => row?.kind === "bridge" && row?.event !== undefined;
const shown = (row) => `${row.kind} row, ${row.said}`;

function hookRan(rows) {
  const row = rows.find(
    (one) => (ours(one) && one.event === "session.start") || one.kind === "context",
  );
  if (!row) return { pass: false, evidence: "no session.start row and no context row" };
  return { pass: true, evidence: shown(row) };
}

// The bridgehead's own rows carry the event they answer, so every other row is the server's. [[spec/design_output/level0#the-bridgehead-starts-it-too]]
function serverAnswered(rows) {
  const row = rows.find((one) => !ours(one));
  if (!row)
    return { pass: false, evidence: "the log holds rows the bridgehead alone writes" };
  return { pass: true, evidence: shown(row) };
}

function rulesReached(rows) {
  const reads = rows.filter((one) => one.kind === "context");
  if (!reads.length) return { pass: false, evidence: "no context row" };
  const whole = reads.find((one) => {
    const names = String(one.detail ?? "").split(/\s+/);
    return names.includes("level0-rules") && names.includes("level0-canary");
  });
  if (!whole) {
    return {
      pass: false,
      evidence: `no context row names level0-rules and level0-canary: ${reads[0].detail ?? ""}`,
    };
  }
  return { pass: true, evidence: `context row, ${whole.detail}` };
}

// The hook registers the read tools itself, so a name past them proves the server's answer reached the client. [[spec/design_output/level0#the-first-call-pays]]
function toolsRegistered(steps) {
  const named = new Set([...steps.tools, ...steps.called]);
  for (const text of steps.texts) {
    for (const one of text.match(/mcp__level0__\w+/g) ?? []) named.add(one);
  }
  const ours_ = [...named].filter((one) => one.startsWith(SERVED)).sort();
  if (!ours_.length)
    return {
      pass: false,
      evidence: "no level0 tool in the init, a call or the answer",
    };
  if (ours_.every((one) => READS.has(one))) {
    return { pass: false, evidence: `the read tools alone: ${ours_.join(", ")}` };
  }
  return { pass: true, evidence: ours_.join(", ") };
}

// [[spec/design_output/level0#the-line-lands-once]]
function canaryOnce(rows, steps) {
  const judged = rows.find((one) => one.kind === "level0");
  if (!judged) return { pass: false, evidence: "no level0 row names the sentence" };
  const sentence = String(judged.detail ?? "");
  const first = steps.texts[0] ?? "";
  const opens = canaryIn(first, sentence);
  if (opens.found !== "same") {
    return {
      pass: false,
      evidence: `the first text opens on ${opens.found}: ${firstLine(first)}`,
    };
  }
  const again = steps.texts.findIndex(
    (text, at) => countOf(text, sentence) > (at ? 0 : 1),
  );
  if (again >= 0) {
    return { pass: false, evidence: `text ${again + 1} repeats the canary` };
  }
  if (rows.some((one) => one.kind === "level0" && one.said === HEARD.again)) {
    return { pass: false, evidence: `a level0 row says ${HEARD.again}` };
  }
  const paid = rows.findIndex(
    (one) => one.kind === "level0" && one.said === HEARD.same,
  );
  const asks =
    paid < 0 ? -1 : rows.findIndex((one, at) => at > paid && asksCanary(one));
  if (asks >= 0) {
    return {
      pass: false,
      evidence: `the gate asks again after the payment: ${rows[asks].said}`,
    };
  }
  return { pass: true, evidence: `the first text opens on it, once: ${sentence}` };
}

const asksCanary = (row) =>
  row.kind === "gate" && /canary/.test(String(row.said ?? ""));
const countOf = (text, sentence) => text.split(sentence).length - 1;
const firstLine = (text) => String(text).trim().split("\n")[0] ?? "";

export function coldLines(checks) {
  return checks.map(
    (one) => `${one.pass ? "PASS" : "FAIL"} ${one.check}: ${one.evidence}`,
  );
}

// [[spec/design_output/level0#the-cold-probe]]
// A delta is the staged change as a patch, so the clone runs the commit about to land. [[spec/design_output/level0#the-cold-probe]]
export async function probeCold(root, it, client, say = console.log, delta = "") {
  const temp = it.disk.tempDir("se-cold-");
  const tree = it.join(temp, "tree");
  const port = coldPort(it.pid);
  try {
    return coldRun(root, it, client, say, { temp, tree, port, delta });
  } finally {
    stops(it, tree, port);
    it.disk.remove(temp);
  }
}

function coldRun(root, it, client, say, { temp, tree, port, delta }) {
  const cloned = it.proc.run(
    ["git", "clone", "--quiet", "--no-hardlinks", root, tree],
    {
      timeoutMs: WAIT,
    },
  );
  if (cloned.exitCode !== 0) {
    say(`FAIL clone: ${tail(cloned.stderr)}`);
    return 1;
  }
  if (!takesDelta(it, temp, tree, delta, say)) return 1;
  const installed = it.proc.run(["sh", it.join(tree, "src", "scripts", "install.sh")], {
    cwd: tree,
    env: { SE_INSTALL_SKIP: INSTALL_SKIP },
    timeoutMs: WAIT,
  });
  say(`The install answers ${installed.exitCode}.`);
  if (installed.exitCode !== 0) say(tail(installed.stderr || installed.stdout));
  // A desk runs a server at the base port, so the clone's hook reads its own port off the pointer. [[spec/design_output/level0#the-cold-probe]]
  it.disk.makeDir(it.join(tree, POINTER, ".."));
  it.disk.write(it.join(tree, POINTER), `${JSON.stringify({ method: tree, port })}\n`);
  const config = it.join(temp, "config");
  it.disk.makeDir(config);

  let ran = { exitCode: 1, stdout: "", stderr: "" };
  try {
    ran = it.proc.run(clientArgv(client, it.join(tree, PLUGIN_FOLDER)), {
      cwd: tree,
      env: {
        CLAUDE_CODE_REMOTE: "true",
        CLAUDE_CODE_ENABLE_FUNCTION_HOOKS: "1",
        CLAUDE_CONFIG_DIR: config,
        SE_BRIDGE_PORT: String(port),
      },
      timeoutMs: WAIT,
    });
  } catch (error) {
    if (error.code === "ENOENT") {
      say("claude stands nowhere, so this box probes no cold start.");
      return 1;
    }
    say(`The client stops: ${error.code ?? error.message}.`);
  }

  const checks = readsCold(
    logRows(it.disk, it.join(tree, SESSION)),
    stepsOf(ran.stdout),
  );
  for (const line of coldLines(checks)) say(line);
  if (ran.exitCode !== 0)
    say(`The client answers ${ran.exitCode}: ${tail(ran.stderr)}`);
  return checks.every((one) => one.pass) ? 0 : 1;
}

// [[spec/design_output/level0#the-cold-probe]]
function takesDelta(it, temp, tree, delta, say) {
  if (!delta) return true;
  const patch = it.join(temp, "staged.patch");
  it.disk.write(patch, delta.endsWith("\n") ? delta : `${delta}\n`);
  const applied = it.proc.run(["git", "apply", "--index", patch], {
    cwd: tree,
    timeoutMs: WAIT,
  });
  if (applied.exitCode === 0) return true;
  say(`FAIL delta: ${tail(applied.stderr || applied.stdout)}`);
  return false;
}

function clientArgv(client, plugin) {
  return [
    client,
    "-p",
    COLD.prompt,
    "--plugin-dir",
    plugin,
    "--output-format",
    "stream-json",
    "--verbose",
    "--permission-mode",
    "auto",
  ];
}

// The server the start road launched stands in the clone, so the probe stops it by its port and by its path. [[spec/design_output/level0#the-cold-probe]]
function stops(it, tree, port) {
  const post = `fetch('http://127.0.0.1:${port}/stop',{method:'POST'}).catch(()=>{})`;
  for (const argv of [
    [it.node ?? "node", "-e", post],
    ["pkill", "-f", it.join(tree, "src", "bridge", "server.js")],
  ]) {
    try {
      it.proc.run(argv, { timeoutMs: WAIT });
    } catch {}
  }
}

function tail(text) {
  return String(text ?? "")
    .trim()
    .split("\n")
    .slice(-TAIL)
    .join(" | ");
}
