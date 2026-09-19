// A copy, the project it drives, and the register between them.
// [[spec/guidance/code/testing]]

import assert from "node:assert/strict";
import test from "node:test";
import {
  attaches,
  copyOf,
  drivenOf,
  entryOf,
  onlyCopy,
  pairOf,
  portOf,
  registers,
  resolves,
  same,
  travels,
} from "../../.claude/skills/level0/lib/vehicle.js";
import { attachTo } from "../../src/bridge/vehicle.js";
import { fakeClock } from "../../src/doors/fake/clock.js";
import { fakeDisk } from "../../src/doors/fake/disk.js";
import {
  attach,
  copyHere,
  detach,
  methodRootFrom,
  produce,
  readRegister,
  registerCopy,
  rootsHere,
} from "../../src/scripts/vehicle.js";

const MARKER = ".claude/skills/level0/.claude-plugin/plugin.json";

function tree(extra = {}) {
  return fakeDisk({
    [`/tools/${MARKER}`]: "{}",
    "/tools/RUNME.sh": "run me",
    "/tools/spec/guidance/voice.md": "# Actionables\n\n1. Say it plain.",
    "/tools/.git/HEAD": "ref: main",
    "/tools/.se/.runtime/copy.json": '{"id":"abc123","made":"2026-01-01T00:00:00.000Z"}',
    ...extra,
  });
}

// [[spec/design_output/vehicle#the-register-holds-the-port]]
test("a Windows root in either case is one copy, so the register keeps one entry and one port", () => {
  assert.equal(same("C:\\work\\tree", "c:/work/tree/"), true);
  assert.equal(same("/home/user/Tree", "/home/user/tree"), false, "a POSIX path keeps its case");

  const upper = JSON.stringify([{ id: "one", method_root: "C:\\work\\tree", port: 6510 }]);
  const kept = registers(upper, { id: "two", method_root: "c:\\work\\tree" });
  assert.deepEqual(
    kept.map((one) => one.id),
    ["two"],
    "the lower-case spelling replaces the upper-case one",
  );
  assert.equal(portOf(JSON.parse(upper), "c:\\work\\tree"), 6510);
});

test("a copy keeps the identity it holds, and makes one where it holds none", () => {
  const held = copyOf('{"id":"abc123"}', "fresh", "now");
  assert.equal(held.record.id, "abc123");
  assert.equal(held.made, false);

  const fresh = copyOf("", "fresh", "now");
  assert.equal(fresh.record.id, "fresh");
  assert.equal(fresh.made, true);
});

test("the identity lives in the method tree", () => {
  const files = tree();
  assert.equal(copyHere(files, fakeClock(), "/tools"), "abc123");

  const bare = tree({ "/tools/.se/.runtime/copy.json": undefined });
  bare.remove("/tools/.se/.runtime/copy.json");
  const made = copyHere(bare, fakeClock(), "/tools");
  assert.ok(made);
  assert.equal(copyHere(bare, fakeClock(), "/tools"), made);
});

test("a root is found by the marker it carries", () => {
  const files = tree();
  assert.equal(methodRootFrom(files, "/tools/src/scripts"), "/tools");
  assert.equal(methodRootFrom(files, "/tools"), "/tools");
  assert.equal(methodRootFrom(files, "/elsewhere/project"), "");
});

test("a project names its driver, and forgets it", () => {
  const files = tree();
  attach(files, fakeClock(), "/work", "abc123");
  assert.equal(drivenOf(files.read("/work/.se/.runtime/project.json")).driver, "abc123");

  detach(files, "/work");
  assert.equal(files.exists("/work/.se/.runtime/project.json"), false);
  assert.equal(attaches("x", "t").driver, "x");
});

test("the register turns an identity into a place", () => {
  const one = entryOf("abc123", "0.1.0", "/tools", "now");
  const list = registers("[]", one);
  assert.equal(resolves(list, "abc123"), "/tools");
  assert.equal(resolves(list, "nobody"), "");

  const again = registers(
    JSON.stringify(list),
    entryOf("abc123", "0.2.0", "/tools", "later"),
  );
  assert.equal(again.length, 1);
  assert.equal(again[0].version, "0.2.0");
});

test("an entry naming a place nobody holds is skipped", () => {
  const files = tree({
    "/home/user/.se/.runtime/registry.json": JSON.stringify([
      entryOf("abc123", "0.1.0", "/tools", "now"),
      entryOf("gone999", "0.1.0", "/vanished", "now"),
    ]),
  });
  const list = readRegister(files, { HOME: "/home/user" });
  assert.deepEqual(
    list.map((one) => one.id),
    ["abc123"],
  );
});

test("one copy is no question", () => {
  assert.equal(onlyCopy([entryOf("a", "1", "/tools", "now")]), "/tools");
  assert.equal(
    onlyCopy([entryOf("a", "1", "/one", "now"), entryOf("b", "1", "/two", "now")]),
    "",
  );
  assert.equal(onlyCopy([]), "");
});

test("a project reaches its driver through the register", () => {
  const files = tree();
  registerCopy(files, { HOME: "/home" }, entryOf("abc123", "0.1.0", "/tools", "now"));
  attach(files, fakeClock(), "/work", "abc123");

  const pair = rootsHere(files, { HOME: "/home" }, "/work");
  assert.equal(pair.method, "/tools");
  assert.equal(pair.work, "/work");
  assert.equal(pair.itself, false);
});

test("a tree carrying the marker drives itself", () => {
  const files = tree();
  const pair = rootsHere(files, { HOME: "/home" }, "/tools");
  assert.equal(pair.method, "/tools");
  assert.equal(pair.work, "/tools");
  assert.equal(pair.itself, true);
  assert.equal(pairOf("", "/only").itself, true);
});

// [[spec/design_output/vehicle#two-roads-to-the-vehicle]]
test("the shim's work root beats the tree the command line runs in", () => {
  const files = tree();
  const pair = rootsHere(files, { HOME: "/home", SE_WORK_ROOT: "/stub" }, "/tools");
  assert.equal(pair.method, "/tools", "the marker names the method");
  assert.equal(pair.work, "/stub", "the shim names the work");
  assert.equal(pair.itself, false);
  const blank = rootsHere(files, { HOME: "/home", SE_WORK_ROOT: "  " }, "/tools");
  assert.equal(blank.work, "/tools", "a blank value names nothing");
});

test("the copy carries the method and nothing private", () => {
  const files = tree();
  const put = produce(files, "/tools", "/copy");
  assert.equal(put.ok, true);

  assert.equal(files.exists(`/copy/${MARKER}`), true);
  assert.equal(files.exists("/copy/spec/guidance/voice.md"), true);
  assert.equal(files.exists("/copy/.git/HEAD"), false);
  assert.equal(files.exists("/copy/.se/.runtime/copy.json"), false);

  assert.equal(travels(".git"), false);
  assert.equal(travels(".se/.runtime/bin/vale"), false);
  assert.equal(travels("src/parts/one.js"), true);
});

test("a copy lands in a new place, and never over its own method", () => {
  const files = tree();
  files.makeDir("/taken");
  assert.equal(produce(files, "/tools", "/taken").ok, false);
  assert.equal(produce(files, "/tools", "/taken", true).ok, true);
  assert.equal(produce(files, "/tools", "/tools").ok, false);
});

// [[spec/design_output/vehicle#the-bridgehead-installs-the-upstream]]
test("the work root comes from SE_WORK_ROOT where the shim sets it, and off the register otherwise", () => {
  const files = tree();
  const under = rootsHere(files, { HOME: "/home", SE_WORK_ROOT: "/stub" }, "/tools");
  assert.deepEqual(under, { method: "/tools", work: "/stub", itself: false });
  const plain = rootsHere(files, { HOME: "/home", SE_WORK_ROOT: "" }, "/tools");
  assert.deepEqual(plain, rootsHere(files, { HOME: "/home" }, "/tools"));
});

test("attach writes the driver, the register entry with its port, the pointer and the hook", () => {
  const files = tree({
    "/tools/.claude/skills/level0/hooks/level0.js": "the hook",
    "/tools/.claude/skills/level0/hooks/hooks.json": '{"modules":["./level0.js"]}',
    "/tools/package.json": '{"version":"0.1.0"}',
  });
  const said = attachTo(files, { HOME: "/home/agent" }, fakeClock(), "/stub", "/tools");
  assert.equal(said.method, "/tools");
  assert.equal(said.port, 6510);
  assert.equal(
    drivenOf(files.read("/stub/.se/.runtime/project.json")).driver,
    "abc123",
    "the driver",
  );
  assert.deepEqual(
    JSON.parse(files.read("/stub/.se/.runtime/vehicle.json")),
    { method: "/tools", port: 6510 },
    "the pointer",
  );
  assert.equal(
    files.read("/stub/.claude/skills/level0/hooks/level0.js"),
    "the hook",
    "the hook",
  );
  assert.equal(
    files.read("/stub/.claude/skills/level0/hooks/hooks.json"),
    '{"modules":["./level0.js"]}',
  );
  assert.equal(files.read(`/stub/${MARKER}`), "{}", "the manifest");
  const entry = JSON.parse(files.read("/home/agent/.se/.runtime/registry.json")).find(
    (one) => one.id === "abc123",
  );
  assert.equal(entry.method_root, "/tools", "the register entry");
  assert.equal(entry.port, 6510);

  const again = attachTo(
    files,
    { HOME: "/home/agent" },
    fakeClock(),
    "/stub",
    "/tools",
  );
  assert.equal(again.port, 6510, "a second attach keeps the port");
});
