// i6's binding demands, written before the build so each one is watched
// failing.
//
// THE FALSIFIABLE CLAIM IS THE SECOND CHECK, NOT THE FIRST. Anybody can build
// one check by writing engine code for it. These cases ask whether the NEXT one
// costs any.
import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import { sweepCorpus } from "../engine/sweep.ts";
import { bootedServer, call, freshRoot, gitInit } from "./helpers.ts";

const ELEMENT = "spec/trace/element/el-probe-carrying-a-bound-rule.md";

/** ONE `realization` KEY, AND THE CALLER SAYS WHICH VALUE. The rule argument
 *  used to carry its own `realization: borrow` line on top of the template's
 *  `realization: make`, so the frontmatter held the key twice — which YAML
 *  rejects outright.
 *
 *  IT PASSED UNTIL THE WRITE GUARD EXISTED. i6's guard parses frontmatter at
 *  the write and refuses what will not read back, so the fixture's own defect
 *  started answering these cases before their subject ever ran. The guard is
 *  right; the fixture was wrong.
 *
 *  AND `on_break: refuse` WENT WITH IT. The three ways forward are report,
 *  signed and carry; a rule declaring `refuse` never arms, so a write meant to
 *  prove an ARMED rule refusing was refused for having no rule at all. */
function elementWithRule(rule: string, realization = "make"): string {
  return `---\nminted_in: i6\nid: el-probe-carrying-a-bound-rule\ntype: "[[element]]"\nstatement: A fixture element whose own node declares the rule that governs it.\nkind: new\nrealization: ${realization}\ngroup: the-walk\nimplements:\n  - fn-run-a-governed-walk\n${rule}\n---\n\nA fixture.\n`;
}

// THE THREE WAYS FORWARD, and a rule declaring none of them does not arm.
// `refuse` is deliberately NOT one: refusing is what `signed` and `carry` DO
// until their escape is taken, and naming it separately would let a rule
// declare a block with no way out.
//
// req-a-check-names-its-way-forward
test("a rule declaring no way forward does not arm, and the refusal names the three that do", async () => {
  const root = freshRoot();
  gitInit(root);
  const server = await bootedServer(root);

  const r = await call(server, "se_file_write", {
    path: ELEMENT,
    base_hash: null,
    content: elementWithRule("rules:\n  - key: realization\n    allows: [make]"),
  });

  const said = JSON.stringify(r.body);
  assert.equal(r.body.kind, "rejected", `an unfinished rule does not arm: ${said}`);
  for (const way of ["report", "signed", "carry"]) {
    assert.match(said, new RegExp(`\\b${way}\\b`), `the refusal names ${way} as a way forward`);
  }
});

test("a rule whose way forward is report never blocks the write", async () => {
  const root = freshRoot();
  gitInit(root);
  const server = await bootedServer(root);

  const r = await call(server, "se_file_write", {
    path: ELEMENT,
    base_hash: null,
    content: elementWithRule("rules:\n  - key: realization\n    allows: [make]\n    on_break: report", "reuse"),
  });

  assert.notEqual(r.body.kind, "rejected", `report lands: ${JSON.stringify(r.body)}`);
  assert.match(JSON.stringify(r.body), /standing_breaks/, "and the break rides the result rather than blocking");
  assert.match(JSON.stringify(r.body), /per the rule on el-probe-carrying-a-bound-rule/, "named as the NODE's rule, not the engine's");
});

test("a rule written into a node fires on the next write, with no engine file touched", async () => {
  const root = freshRoot();
  gitInit(root);
  const server = await bootedServer(root);

  const before = spawnSync("git", ["status", "--porcelain", "--", "deliverable/engine"], {
    cwd: root,
    encoding: "utf8",
  }).stdout;

  const armed = await call(server, "se_file_write", {
    path: ELEMENT,
    base_hash: null,
    content: elementWithRule("rules:\n  - key: realization\n    allows: [make, buy, reuse]\n    on_break: carry"),
  });
  assert.notEqual(armed.body.kind, "rejected", `the rule lands: ${JSON.stringify(armed.body)}`);

  // The rule now governs its own node's `realization` key. Break it.
  const broken = await call(server, "se_file_write", {
    path: ELEMENT,
    base_hash: (armed.body as { hash?: string }).hash,
    content: elementWithRule("rules:\n  - key: realization\n    allows: [make]\n    on_break: carry", "reuse"),
  });
  assert.equal(broken.body.kind, "rejected", `the armed rule refuses: ${JSON.stringify(broken.body)}`);

  const after = spawnSync("git", ["status", "--porcelain", "--", "deliverable/engine"], {
    cwd: root,
    encoding: "utf8",
  }).stdout;
  assert.equal(after, before, "no engine file changed to make the rule exist");
});

test("the refusal names the node the rule came from", async () => {
  const root = freshRoot();
  gitInit(root);
  const server = await bootedServer(root);

  const armed = await call(server, "se_file_write", {
    path: ELEMENT,
    base_hash: null,
    content: elementWithRule("rules:\n  - key: realization\n    allows: [make, buy, reuse]\n    on_break: carry"),
  });
  const broken = await call(server, "se_file_write", {
    path: ELEMENT,
    base_hash: (armed.body as { hash?: string }).hash,
    content: elementWithRule("rules:\n  - key: realization\n    allows: [make]\n    on_break: carry", "reuse"),
  });

  assert.match(JSON.stringify(broken.body), /el-probe-carrying-a-bound-rule/, "the refusal says which node's rule fired");
});

test("a rule naming a node the corpus does not hold is reported as unbound", async () => {
  const root = freshRoot();
  gitInit(root);
  const server = await bootedServer(root);

  await call(server, "se_file_write", {
    path: ELEMENT,
    base_hash: null,
    content: elementWithRule(
      "rules:\n  - key: realization\n    binds: el-this-element-does-not-exist\n    allows: [make]\n    on_break: report",
    ),
  });

  // THE CONFORMANCE SWEEP, NOT THE VOICE LINT. This drove se_lint with a
  // directory, and se_lint reads PROSE — it refuses anything that is not one
  // markdown file, and its own sweep takes a glob. Two different questions
  // about the same files, and the case was asking the wrong one.
  const swept = sweepCorpus(root, "spec/trace");
  const said = JSON.stringify(swept.findings);
  assert.match(said, /unbound/i, `the sweep reports it as unbound: ${said}`);
  assert.match(said, /el-this-element-does-not-exist/, "the report names what it bound to");
});

test("an unbound rule is told apart from a rule nothing violated", async () => {
  const root = freshRoot();
  gitInit(root);
  const server = await bootedServer(root);

  // Two rules. One binds to nothing; one binds correctly and finds no
  // violation. A green that cannot tell them apart is the defect.
  await call(server, "se_file_write", {
    path: ELEMENT,
    base_hash: null,
    content: elementWithRule(
      "rules:\n  - key: realization\n    allows: [make]\n    on_break: report\n  - key: realization\n    binds: el-this-element-does-not-exist\n    allows: [make]\n    on_break: report",
    ),
  });

  const findings = sweepCorpus(root, "spec/trace").findings;
  const unbound = findings.filter((f) => String(f.kind ?? "").includes("unbound"));
  assert.equal(unbound.length, 1, `exactly one rule reads as unbound: ${JSON.stringify(findings)}`);
});
