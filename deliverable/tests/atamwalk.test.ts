// THE ATAM WALK IS ARITHMETIC UNTIL THE VERDICT: the deck's order, the paths
// and the numbers all compute from the trace; only the ruling is typed.
import { strict as assert } from "node:assert";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { exposureView, mintScenarioLines, scenarioDeckView, structureMetrics } from "../engine/atamwalk.ts";
import { elementMatrixView } from "../engine/elematrix.ts";
import { assumptionLawProblems, authorTestsLawProblems, deckLawProblems, structureLawProblems } from "../engine/stateform-problems.ts";
import { conformance, type TraceNode } from "../engine/trace.ts";

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

// A LAW TEST WRITES REAL NODES: the laws read frontmatter through the door,
// so the fixture is files, and the corpus is hand-built handles to them.
function lawNode(dir: string, id: string, type: string, fmLines: string[]): { id: string; type: string; file: string } {
  const file = join(dir, `${id}.md`);
  writeFileSync(file, ["---", `id: ${id}`, ...fmLines, "---", ""].join("\n"));
  return { id, type, file };
}

test("the structural laws refuse an incomplete decomposition and pass a closed one", () => {
  const root = mkdtempSync(join(tmpdir(), "lawtest-"));
  try {
    const dir = join(root, "n");
    mkdirSync(dir, { recursive: true });
    const broken = [
      lawNode(dir, "el-a", "element", ["implements:", "  - fn-p"]),
      lawNode(dir, "fn-p", "function", ["satisfies:", "  - req-near", "outputs:", "  - flow-x"]),
      lawNode(dir, "fn-lost", "function", ["satisfies:", "  - req-far"]),
      lawNode(dir, "req-near", "requirement", []),
      lawNode(dir, "req-far", "requirement", []),
    ];
    const found = structureLawProblems("allocation", broken);
    assert.ok(found.some((p) => p.includes("fn-lost")));
    assert.ok(found.some((p) => p.includes("req-far")));
    const fixed = structureLawProblems("allocation", [...broken, lawNode(dir, "el-b", "element", ["implements:", "  - fn-lost"])]);
    assert.deepEqual(fixed, []);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("an unruled quality scenario blocks the deck; verdict lines clear it", () => {
  const root = mkdtempSync(join(tmpdir(), "decklaw-"));
  try {
    const dir = join(root, "n");
    mkdirSync(dir, { recursive: true });
    const corpus = [
      lawNode(dir, "req-q1", "requirement", ["kind: quality"]),
      lawNode(dir, "req-q2", "requirement", ["kind: quality"]),
      lawNode(dir, "req-f", "requirement", ["kind: functional"]),
    ];
    const blocked = deckLawProblems("walk", "", corpus);
    assert.equal(blocked.length, 1);
    assert.ok(blocked[0].includes("req-q1") && blocked[0].includes("req-q2") && !blocked[0].includes("req-f"));
    const ruled = "- [[req-q1]] — addressed\n- [[raid-x]] — unaddressed: [[req-q2]]";
    assert.deepEqual(deckLawProblems("walk", ruled, corpus), []);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("the assumption law refuses the hot and unprobed, and honours accept and defer", () => {
  const root = mkdtempSync(join(tmpdir(), "asmlaw-"));
  try {
    const dir = join(root, "n");
    mkdirSync(dir, { recursive: true });
    const damage = ["fatal", "crippling", "corrosive", "abrasive", "cosmetic"];
    const corpus = [
      lawNode(dir, "raid-hot", "raid", ["kind: assumption", "status: open", "breaks_how_badly: crippling"]),
      lawNode(dir, "raid-parked", "raid", ["kind: assumption", "status: deferred", "breaks_how_badly: fatal"]),
      lawNode(dir, "raid-parked-right", "raid", [
        "kind: assumption",
        "status: deferred",
        "breaks_how_badly: fatal",
        "defer_until: the next POSIX session",
      ]),
      lawNode(dir, "raid-lived-with", "raid", ["kind: assumption", "status: accepted", "breaks_how_badly: fatal"]),
      lawNode(dir, "raid-proved", "raid", ["kind: assumption", "status: open", "breaks_how_badly: fatal", "probe: holds — measured"]),
      lawNode(dir, "raid-mild", "raid", ["kind: assumption", "status: open", "breaks_how_badly: corrosive"]),
    ];
    const found = assumptionLawProblems(corpus, damage);
    assert.equal(found.length, 2);
    assert.ok(found.some((p) => p.includes("raid-hot")));
    assert.ok(found.some((p) => p.includes("raid-parked") && p.includes("until")));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

// EVERY method is covered by a spec now — the
// verified_by shape this case guarded is retired. The full law lives in
// tests/requirement-checks.test.ts; this holds the dispatch-level claim.
test("a requirement of any method refuses uncovered, and a matching spec covers it", () => {
  const root = mkdtempSync(join(tmpdir(), "vblaw-"));
  try {
    const dir = join(root, "n");
    mkdirSync(dir, { recursive: true });
    const corpus = [
      lawNode(dir, "req-bare", "requirement", ["verify_method: test"]),
      lawNode(dir, "req-demo", "requirement", ["verify_method: demonstration"]),
      lawNode(dir, "tsp-demo", "test-spec", ["method: demonstration", "verifies:", "  - req-demo"]),
    ];
    const found = authorTestsLawProblems(corpus);
    assert.equal(found.length, 1, found.join(" | "));
    assert.ok(found[0].includes("req-bare"));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("a decision without a traceable source ref is a conformance finding", () => {
  const root = mkdtempSync(join(tmpdir(), "decref-"));
  try {
    const decision = (refs: string[]): string =>
      [
        "---",
        "id: raid-store-beside-trace",
        'type: "[[raid]]"',
        "kind: decision",
        "statement: Scores live beside the trace, one file per candidate.",
        "owner: the adjudicator",
        "trigger: any second store appearing",
        "status: decided",
        "impact: Two stores would drift apart.",
        "breaks_how_badly: crippling",
        "how_likely: plausible",
        "source_refs:",
        ...refs.map((r) => `  - ${r}`),
        "---",
        "",
        "## Rejected options",
        "",
        "- one big table",
        "",
        "## Consequences",
        "",
        "- every reader parses per-candidate files",
      ].join("\n");
    const file = join(root, "raid-store-beside-trace.md");
    writeFileSync(file, decision(["the owner asked for it"]));
    // The repo root off THIS FILE, never process.cwd() — a parallel suite
    // may move the process's directory mid-run.
    const repo = fileURLToPath(new URL("../../", import.meta.url));
    const node = { id: "raid-store-beside-trace", type: "raid", file } as unknown as TraceNode;
    assert.ok(conformance(repo, node).some((p) => p.includes("traceable ref")));
    writeFileSync(file, decision(["req-crash-lands-safe"]));
    assert.ok(!conformance(repo, node).some((p) => p.includes("traceable ref")));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("the exposure chart places entries by their grades and names the ungraded", () => {
  const damage = ["fatal", "crippling", "corrosive"];
  const likelihood = ["expected", "plausible", "conceivable"];
  const v = exposureView(
    [
      { id: "raid-a", statement: "s", kind: "risk", status: "open", damage: "fatal", likelihood: "plausible" },
      { id: "raid-b", statement: "s", kind: "decision", status: "decided", damage: "corrosive", likelihood: "expected" },
      { id: "raid-c", statement: "s", kind: "risk", status: "closed", damage: "fatal", likelihood: "expected" },
      { id: "raid-e", statement: "s", kind: "assumption", status: "deferred", damage: "fatal", likelihood: "expected" },
      { id: "raid-d", statement: "s", kind: "risk", status: "open", damage: "", likelihood: "expected" },
    ],
    damage,
    likelihood,
  );
  assert.deepEqual(
    v.items.map((i) => i.id),
    ["raid-a", "raid-b", "raid-d"],
  );
  assert.deepEqual([v.items[0].damage, v.items[0].likelihood], [0, 1]);
  assert.deepEqual([v.items[1].damage, v.items[1].likelihood], [2, 0]);
  assert.ok(v.problems.some((p) => p.includes("raid-d")));
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
