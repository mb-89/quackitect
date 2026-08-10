// THE ELEMENT MATRIX IS ARITHMETIC, proved on a small synthetic structure:
// crossings from flows and allocation, debts against declared interfaces,
// and the holes named on both sides.
import { strict as assert } from "node:assert";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { elementMatrixView } from "../engine/elematrix.ts";
import { elementMatrixArgs } from "../engine/stateform.ts";

const ELEMENTS = [
  { id: "el-engine", group: "core", implements: ["fn-walk", "fn-log"] },
  { id: "el-mirror", group: "surface", implements: ["fn-render"] },
  { id: "el-idle", group: "core", implements: [] },
];
const FUNCTIONS = [
  { id: "fn-walk", inputs: [], outputs: ["flow-position"] },
  { id: "fn-render", inputs: ["flow-position"], outputs: [] },
  { id: "fn-log", inputs: [], outputs: [] },
  { id: "fn-orphan", inputs: [], outputs: [] },
];

test("a flow crossing two elements owes their pair a cell, and holes are named", () => {
  const v = elementMatrixView(ELEMENTS, FUNCTIONS, []);
  assert.equal(v.cells.length, 1);
  assert.deepEqual(v.cells[0], {
    source: "el-engine",
    destination: "el-mirror",
    owed: ["flow-position"],
    interfaces: [],
    missing: ["flow-position"],
  });
  assert.deepEqual(v.unimplemented, ["fn-orphan"]);
  assert.deepEqual(v.idle, ["el-idle"]);
});

test("a declared interface clears the cell's debt exactly where it carries the flow", () => {
  const iface = { id: "if-engine-to-mirror", source: "el-engine", destination: "el-mirror", carries: ["flow-position"] };
  const v = elementMatrixView(ELEMENTS, FUNCTIONS, [iface]);
  assert.deepEqual(v.cells[0].interfaces, ["if-engine-to-mirror"]);
  assert.deepEqual(v.cells[0].missing, []);
  assert.deepEqual(v.undemanded, []);
});

test("an interface on a pair no crossing demands is flagged the other way", () => {
  const iface = { id: "if-mirror-to-engine", source: "el-mirror", destination: "el-engine", carries: [] };
  const v = elementMatrixView(ELEMENTS, FUNCTIONS, [iface]);
  assert.deepEqual(v.undemanded, [{ id: "if-mirror-to-engine", source: "el-mirror", destination: "el-engine" }]);
});

test("a spread function crosses from every implementer, and same-element flows owe nothing", () => {
  const spread = [
    { id: "el-a", group: "", implements: ["fn-walk"] },
    { id: "el-b", group: "", implements: ["fn-walk", "fn-render"] },
  ];
  const v = elementMatrixView(spread, FUNCTIONS, []);
  // el-b implements both producer and consumer — that path owes nothing;
  // el-a's copy of the producer still crosses to el-b's consumer.
  assert.equal(v.cells.length, 1);
  assert.equal(v.cells[0].source, "el-a");
  assert.equal(v.cells[0].destination, "el-b");
});

test("an interface naming an unknown element is a problem, not a cell", () => {
  const iface = { id: "if-ghost", source: "el-engine", destination: "el-ghost", carries: [] };
  const v = elementMatrixView(ELEMENTS, FUNCTIONS, [iface]);
  assert.equal(v.cells.length, 1);
  assert.ok(v.problems.some((p) => p.includes("el-ghost")));
});

// THE ARG ASSEMBLY TAKES A RECORD ROOT, never the trace folder itself — the
// same contract every live source honours via traceDir. A direct join under
// the root read nothing and rendered an empty matrix shaped like success.
test("elementMatrixArgs reads the trace under project/spec/trace of a record root", () => {
  const root = mkdtempSync(join(tmpdir(), "ematrix-"));
  try {
    const trace = join(root, "project", "spec", "trace");
    mkdirSync(join(trace, "element"), { recursive: true });
    mkdirSync(join(trace, "function"), { recursive: true });
    writeFileSync(join(trace, "element", "el-a.md"), "---\nid: el-a\nimplements:\n  - fn-walk\n---\n");
    writeFileSync(join(trace, "function", "fn-walk.md"), "---\nid: fn-walk\n---\n");
    writeFileSync(join(trace, "function", "fn-orphan.md"), "---\nid: fn-orphan\n---\n");
    const v = elementMatrixArgs(root);
    assert.equal(v.elements.length, 1);
    assert.deepEqual(v.unimplemented, ["fn-orphan"]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
