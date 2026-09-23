// The self-test a server runs over new code before it steps down for it: a
// child loads every module the server imports, and drives one of each event
// through decide on a box standing in memory.
// [[spec/design_output/level0#new-code-proves-it-loads]]

import { join } from "node:path";
import { disk as realDisk } from "../doors/disk.js";
import { fakeClock } from "../doors/fake/clock.js";
import { fakeDisk } from "../doors/fake/disk.js";
import { fakeLog } from "../doors/fake/log.js";

// The files the scratch box copies off the method root, so the doors read the rules this tree holds. [[spec/design_output/level0#new-code-proves-it-loads]]
const SEEDS = ["spec/config/level0.json", "spec/config/stop", "spec/schemas"];
const ROOT = "/selftest";

// One of each event the harness sends, so a name a door lacks throws here and nowhere else. [[spec/design_output/level0#new-code-proves-it-loads]]
const EVENTS = [
  { event: "session.start", e: { cwd: ROOT } },
  { event: "prompt.context", e: {} },
  { event: "prompt.submit", e: { text: "Carry on.", origin: { kind: "composer" } } },
  { event: "tool.call", e: { tool: "Read", file_path: `${ROOT}/note.md` } },
  {
    event: "tool.call",
    e: { tool: "Write", file_path: `${ROOT}/note.md`, content: "# Note\n" },
  },
  { event: "tool.call", e: { tool: "Bash", command: "ls" } },
  { event: "tool.call", e: { tool: "Grep", pattern: "one" } },
  { event: "classic.PostToolUse", e: { tool: "Write" } },
  { event: "turn.said", e: { text: "Done." } },
  { event: "turn.complete", e: { reason: "answer", answer: "Done." } },
  { event: "classic.Stop", e: { last_assistant_message: "Done." } },
];

// The number the child exits with: 0 where every event passes decide, and 1 with the fault on stderr. The server hands its own box maker and decide in, because this module importing the server closes a loop the loader leaves waiting forever. [[spec/design_output/level0#new-code-proves-it-loads]]
export async function selfTests(
  method,
  server,
  say = (line) => process.stderr.write(`${line}\n`),
) {
  const box = server.boxOf(ROOT, ROOT, doorsOver(method));
  for (const one of EVENTS) {
    try {
      await server.decide(one, box);
    } catch (error) {
      say(`${one.event} ${one.e?.tool ?? ""}: ${error?.stack ?? error}`.trim());
      return 1;
    }
  }
  return 0;
}

// Doors standing in memory: a disk seeded off the method root, and a process door that runs nothing. [[spec/design_output/level0#new-code-proves-it-loads]]
function doorsOver(method) {
  const disk = fakeDisk(seedsOf(method));
  const idle = { exitCode: 1, stdout: "", stderr: "the self-test runs nothing" };
  return {
    disk,
    clock: fakeClock(),
    log: fakeLog(),
    env: {},
    pid: 0,
    proc: {
      run: () => idle,
      start: async () => idle,
      respawn: async () => ({ fell: true, exitCode: 1 }),
    },
    index: {
      stands: () => false,
      dead: () => "",
      fault: () => "",
      ask: () => null,
      find: () => null,
      warm: () => ({ warmed: false, dead: "" }),
    },
    vale: { stands: () => false, lint: async () => ({ ran: false, found: [] }) },
    biome: { stands: () => false },
    awake: { hold: () => ({ release() {} }) },
  };
}

function seedsOf(method) {
  const out = {};
  const files = realDisk();
  const copy = (rel) => {
    const at = join(method, ...rel.split("/"));
    try {
      for (const one of files.list(at))
        if (one.kind === "file") copy(`${rel}/${one.name}`);
    } catch {
      try {
        out[`${ROOT}/${rel}`] = String(files.read(at));
      } catch {}
    }
  };
  for (const rel of SEEDS) copy(rel);
  return out;
}
