// THE ATAM WALK IS ARITHMETIC UNTIL THE VERDICT: the deck's order, the paths
// and the numbers all compute from the trace; only the ruling is typed.
import { strict as assert } from "node:assert";
import { test } from "node:test";
import { mintScenarioLines, scenarioDeckView, structureMetrics } from "../engine/atamwalk.ts";
import { elementMatrixView } from "../engine/elematrix.ts";

const REQS = [
  { id: "req-mild", grade: "abrasive", characteristic: "reliability", scenario: "source, stimulus, response, measure" },
  { id: "req-hard", grade: "fatal", characteristic: "performance-efficiency", scenario: "source, stimulus, response, measure" },
  { id: "req-bare", grade: "crippling", characteristic: "", scenario: "" },
];
const FNS = [
  { id: "fn-serve", satisfies: ["req-hard"] },
  { id: "fn-log", satisfies: [] },
];
const IMPL = [
  { id: "el-engine", implements: ["fn-serve"], satisfies: [] },
  { id: "el-store", implements: [], satisfies: ["req-mild"] },
  { id: "if-wire", implements: ["fn-serve"], satisfies: [] },
];

const GRADES = ["fatal", "crippling", "corrosive", "abrasive", "cosmetic"];

test("the deck deals worst grade first, and the path follows satisfies then implements", () => {
  const v = scenarioDeckView(REQS, FNS, IMPL, ["raid-choice"], ["el-engine", "el-store"], GRADES);
  assert.deepEqual(
    v.cards.map((c) => c.requirement),
    ["req-hard", "req-bare", "req-mild"],
  );
  const hard = v.cards[0];
  assert.deepEqual(hard.functions, ["fn-serve"]);
  assert.deepEqual(hard.implementers, ["el-engine", "if-wire"]);
  // Direct satisfies reaches the card without a function in between.
  assert.deepEqual(v.cards[2].implementers, ["el-store"]);
  assert.deepEqual(v.decisions, ["raid-choice"]);
});

test("a quality row without its Scenario section is a named problem", () => {
  const v = scenarioDeckView(REQS, [], [], [], [], GRADES);
  assert.ok(v.problems.some((p) => p.includes("req-bare")));
});

test("an at-risk line mints once and keeps its ref on the re-pass", () => {
  const content = "- at risk: [[req-hard]] hinges on [[el-engine]] — latency against safety";
  let minted = 0;
  const once = mintScenarioLines(content, (l) => {
    minted++;
    assert.equal(l.kind, "at-risk");
    assert.equal(l.hinge, "el-engine");
    return "raid-ar-hard";
  });
  assert.equal(once, "- [[raid-ar-hard]] — at risk: [[req-hard]] hinges on [[el-engine]] — latency against safety");
  const again = mintScenarioLines(once, () => {
    minted++;
    return "raid-x";
  });
  assert.equal(again, once);
  assert.equal(minted, 1);
});

test("an unaddressed line mints; an addressed line never does", () => {
  const content = ["- unaddressed: [[req-mild]]", "- [[req-hard]] — addressed by [[raid-choice]]"].join("\n");
  const out = mintScenarioLines(content, (l) => {
    assert.equal(l.kind, "unaddressed");
    return "raid-un-mild";
  });
  assert.equal(out.split("\n")[0], "- [[raid-un-mild]] — unaddressed: [[req-mild]]");
  assert.equal(out.split("\n")[1], "- [[req-hard]] — addressed by [[raid-choice]]");
});

test("the structure numbers count debt, spread, both-way pairs and the idle ends", () => {
  const elements = [
    { id: "el-a", group: "", implements: ["fn-p", "fn-q"] },
    { id: "el-b", group: "", implements: ["fn-c", "fn-p"] },
    { id: "el-idle", group: "", implements: [] },
  ];
  const fns = [
    { id: "fn-p", inputs: [], outputs: ["flow-x"] },
    { id: "fn-c", inputs: ["flow-x"], outputs: ["flow-y"] },
    { id: "fn-q", inputs: ["flow-y"], outputs: [] },
    { id: "fn-orphan", inputs: [], outputs: [] },
  ];
  const view = elementMatrixView(elements, fns, []);
  const rows = Object.fromEntries(structureMetrics(view, elements).map((r) => [r.name, r.value]));
  assert.equal(rows["interface debt"], 2);
  assert.equal(rows["allocation spread"], 1);
  assert.equal(rows["two-way pairs"], 1);
  assert.equal(rows["idle elements"], 1);
  assert.equal(rows["unimplemented functions"], 1);
  assert.equal(rows["undemanded interfaces"], 0);
});
