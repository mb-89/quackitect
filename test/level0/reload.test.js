// The server's own code, read once and compared after a tool run. Every case
// stands on a fake disk, and the restart itself belongs to the wire door.
// [[spec/design_output/level0#a-fix-reaches-the-session]]

import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";
import { TESTING } from "../../.claude/skills/level0/lib/vehicle.js";
import {
  codeOf,
  faultIn,
  loadsCode,
  movedCode,
  movedIn,
  provesCode,
  SELF_TEST,
} from "../../src/bridge/reload.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import { fakeLog } from "../../src/doors/fake/log.js";
import { fakeProc } from "../../src/doors/fake/proc.js";

const BROKEN = [
  "file:///c:/tree/src/bridge/server.js:131",
  "  dropsMoved(box, event);",
  "ReferenceError: dropsMoved is not defined",
  "    at decide (file:///c:/tree/src/bridge/server.js:131:3)",
].join("\n");

// A box whose self-test child answers what the case teaches it, one answer a run. [[spec/design_output/level0#new-code-proves-it-loads]]
function testing(answers) {
  const disk = tree();
  const said = [...answers];
  const proc = fakeProc({ "/usr/bin/node": () => said.shift() });
  return { disk, method: ROOT, node: "/usr/bin/node", proc, log: fakeLog() };
}

// [[spec/design_output/level0#new-code-proves-it-loads]]
test("new code failing its self-test keeps the server running, and one fault writes one line", async () => {
  const box = testing([
    { exitCode: 1, stderr: BROKEN },
    { exitCode: 1, stderr: BROKEN },
    { exitCode: 0 },
  ]);
  movedCode(box, "session.start");
  box.disk.write(at("src/bridge/stop.js"), "export const a = 2;\n");
  const moved = movedCode(box, "classic.PostToolUse");
  assert.equal(moved, "src/bridge/stop.js");
  assert.equal(await provesCode(box, moved), false, "the server runs on");
  assert.deepEqual(box.proc.ran[0].argv.slice(1), [join(ROOT, "src/bridge/server.js"), SELF_TEST, ROOT]);
  assert.equal(movedCode(box, "classic.PostToolUse"), "", "code unmoved since the fault asks no second test");

  box.disk.write(at(".claude/skills/level0/lib/ticket.js"), "export const b = 3;\n");
  const again = movedCode(box, "classic.PostToolUse");
  assert.equal(await provesCode(box, again), false);
  const faults = box.log.lines().filter((one) => one.level === "error");
  assert.equal(faults.length, 1, "the same fault writes no second line");
  assert.match(faults[0].detail, /^src\/bridge\/server\.js:131: ReferenceError: dropsMoved is not defined/);

  box.disk.write(at("src/bridge/stop.js"), "export const a = 4;\n");
  assert.equal(await provesCode(box, movedCode(box, "classic.PostToolUse")), true, "code that loads steps the server down");
});

// [[spec/design_output/level0#new-code-proves-it-loads]]
test("a child that cannot start reads as a fault, and the fault names the place ahead of the words", async () => {
  const box = testing([]);
  box.proc = { run: () => { throw new Error("spawn ENOENT"); } };
  assert.equal(await provesCode(box, "src/bridge/stop.js"), false);
  assert.match(box.log.lines()[0].detail, /spawn ENOENT/);
  assert.equal(faultIn("SyntaxError: Unexpected token\n"), "SyntaxError: Unexpected token");
});

const ROOT = "/tree";
const at = (path) => join(ROOT, ...path.split("/"));

function tree() {
  return fakeDisk({
    [at("src/bridge/stop.js")]: "export const a = 1;\n",
    [at("src/bridge/notes.md")]: "# not code\n",
    [at(".claude/skills/level0/lib/ticket.js")]: "export const b = 2;\n",
  });
}

test("the code of the server is every script under its roots, and a note is none", () => {
  const code = codeOf(tree(), ROOT);
  assert.deepEqual([...code.keys()].sort(), [
    ".claude/skills/level0/lib/ticket.js",
    "src/bridge/stop.js",
  ]);
  assert.equal(code.get("src/bridge/stop.js"), "0:20", "a script answers its time and its size");
});

// [[spec/design_output/level0#a-fix-reaches-the-session]]
test("a module the server imports outside the roots is watched, and a change to it reads as moved", () => {
  const disk = fakeDisk({
    [at("src/bridge/server.js")]: 'import { a } from "./stop.js";\nimport { s } from "../scripts/styles.js";\n',
    [at("src/bridge/stop.js")]: 'export { g } from "../extension/lib/grid.js";\n',
    [at("src/scripts/styles.js")]: "export const s = 1;\n",
    [at("src/extension/lib/grid.js")]: "export const g = 1;\n",
    [at("src/scripts/other.js")]: "export const o = 1;\n",
  });
  const box = { disk, method: ROOT };
  movedCode(box, "session.start");
  assert.ok(box.watched.has("src/scripts/styles.js"));
  assert.ok(box.watched.has("src/extension/lib/grid.js"), "the closure reaches past one step");
  assert.equal(box.watched.has("src/scripts/other.js"), false, "a module nobody imports stays out");

  disk.write(at("src/scripts/other.js"), "export const o = 2;\n");
  assert.equal(movedCode(box, "classic.PostToolUse"), "");
  disk.write(at("src/extension/lib/grid.js"), "export const g = 2;\n");
  assert.equal(movedCode(box, "classic.PostToolUse"), "src/extension/lib/grid.js");
});

test("a changed, an added and a removed file each read as moved, and the same code as none", () => {
  const was = codeOf(tree(), ROOT);
  assert.equal(movedIn(was, codeOf(tree(), ROOT)), "");
  const changed = new Map(was);
  changed.set("src/bridge/stop.js", "export const a = 2;\n");
  assert.equal(movedIn(was, changed), "src/bridge/stop.js");
  const added = new Map(was);
  added.set("src/bridge/new.js", "");
  assert.equal(movedIn(was, added), "src/bridge/new.js");
  const removed = new Map(was);
  removed.delete(".claude/skills/level0/lib/ticket.js");
  assert.equal(movedIn(was, removed), ".claude/skills/level0/lib/ticket.js");
});

test("the box reads its code once, and a change shows after a tool run alone", () => {
  const disk = tree();
  const box = { disk, method: ROOT };
  assert.equal(movedCode(box, "session.start"), "", "the first read holds the code");
  disk.write(at("src/bridge/stop.js"), "export const a = 3;\n");
  assert.equal(movedCode(box, "tool.call"), "", "a call before the run moves nothing");
  assert.equal(movedCode(box, "classic.PostToolUse"), "src/bridge/stop.js");
});

// The child runs with the flag and the span the start road reads too, off lib/vehicle.js. [[spec/design_output/level0#new-code-proves-it-loads]]
test("the self-test child takes the flag and the span lib/vehicle.js names", () => {
  const ran = [];
  const box = {
    method: ROOT,
    node: "/usr/bin/node",
    proc: {
      run: (argv, init) => {
        ran.push({ argv, init });
        return { exitCode: 0, stdout: "", stderr: "" };
      },
    },
  };

  assert.deepEqual(loadsCode(box), { ok: true, why: "" });
  assert.ok(ran[0].argv.includes(SELF_TEST), "the flag rides the child");
  assert.equal(ran[0].init.timeoutMs, TESTING, "the span bounds the child");
});
