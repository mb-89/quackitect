// i6's write-path demands, written before the build so each one is watched
// failing. Every case here drives the LANE rather than a function, because the
// guard's whole claim is about what a write verb does before anything lands.
//
// THE FIRST TWO CASES ARE THE ITERATION'S OWN FAILURES, replayed. The colon
// inside an unquoted scalar cost four calls on 2026-08-16; the value outside
// its vocabulary cost eleven.
import { strict as assert } from "node:assert";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { sweepCorpus } from "../engine/sweep.ts";
import { bootedServer, call, freshRoot, gitInit } from "./helpers.ts";

const NODE = "spec/trace/raid/raid-probe-written-by-the-guard-test.md";

function frontmatter(body: string): string {
  return `---\nminted_in: i6\nid: raid-probe-written-by-the-guard-test\ntype: "[[raid]]"\nkind: issue\n${body}\nowner: the driving agent\ntrigger: never — this node exists only inside a test fixture\nimpact: none\nbreaks_how_badly: crippling\nhow_likely: plausible\n---\n\nA fixture node.\n`;
}

test("an unquoted colon is refused before landing and names the repair", async () => {
  const root = freshRoot();
  gitInit(root);
  const server = await bootedServer(root);

  // `worse: it` is a nested mapping in YAML. This exact shape stopped the walk
  // on 2026-08-16 and the write that made it returned created: true.
  const r = await call(server, "se_file_write", {
    path: NODE,
    base_hash: null,
    content: frontmatter("statement: The second is worse: it taxes an unrelated edit."),
  });

  const said = JSON.stringify(r.body);
  assert.equal(r.body.kind, "rejected", `the write is refused, not accepted: ${said}`);
  assert.ok(!existsSync(join(root, NODE)), "nothing landed on disk");
  assert.match(said, /raid-probe-written-by-the-guard-test/, "the refusal names the file");
  assert.match(said, /\bline\b/i, "the refusal names the line");
  assert.match(said, /worse: it/, "the refusal quotes the offending value back");
  assert.ok((r.body as { remedy?: unknown }).remedy !== undefined, `the refusal carries an executable remedy: ${said}`);
});

test("a value outside its key's vocabulary is refused, with the whole list named", async () => {
  const root = freshRoot();
  gitInit(root);
  const server = await bootedServer(root);

  // `part-closed` parses perfectly and is not one of the eight allowed words.
  const r = await call(server, "se_file_write", {
    path: NODE,
    base_hash: null,
    content: frontmatter("statement: A fixture.\nstatus: part-closed"),
  });

  const said = JSON.stringify(r.body);
  assert.equal(r.body.kind, "rejected", `the write is refused: ${said}`);
  assert.match(said, /part-closed/, "the refusal quotes the value it got");
  for (const word of ["open", "probed", "mitigated", "accepted", "deferred", "closed", "decided", "superseded"]) {
    assert.match(said, new RegExp(`\\b${word}\\b`), `the refusal names the whole list, missing ${word}`);
  }
});

test("a break the corpus already carried lands and is reported, never refused", async () => {
  const root = freshRoot();
  gitInit(root);
  const server = await bootedServer(root);

  // A node with a dangling reference is a CORPUS condition: it predates this
  // write and this author did not cause it.
  const first = await call(server, "se_file_write", {
    path: "spec/trace/raid/raid-probe-with-a-dangling-ref.md",
    base_hash: null,
    content: frontmatter("statement: A fixture.\nstatus: open\nsource_refs:\n  - req-this-id-resolves-to-nothing"),
  });
  assert.notEqual(first.body.kind, "rejected", `a standing break does not refuse: ${JSON.stringify(first.body)}`);

  const said = JSON.stringify(first.body);
  assert.match(said, /req-this-id-resolves-to-nothing/, "the report names the difference, not the category");
});

test("a check with no declared way forward does not arm", async () => {
  const root = freshRoot();
  gitInit(root);
  const server = await bootedServer(root);

  // A rule declared on a node with no `on_break` is unfinished: it can refuse
  // the write that repairs it and leave the walk with no legal move.
  const r = await call(server, "se_file_write", {
    path: "spec/trace/element/el-probe-with-a-trapping-rule.md",
    base_hash: null,
    content: `---\nminted_in: i6\nid: el-probe-with-a-trapping-rule\ntype: "[[element]]"\nstatement: A fixture element carrying a rule with no way forward.\nkind: new\nrealization: make\ngroup: the-walk\nimplements:\n  - fn-run-a-governed-walk\nrules:\n  - key: status\n    demands: nonempty\n---\n\nA fixture.\n`,
  });

  assert.equal(r.body.kind, "rejected", `an unfinished rule does not arm: ${JSON.stringify(r.body)}`);
  assert.match(JSON.stringify(r.body), /report|signed|carr/i, "the refusal names the ways forward it accepts");
});

test("the guard leaves a write inside its one-second budget", async () => {
  const root = freshRoot();
  gitInit(root);
  const server = await bootedServer(root);

  const started = Date.now();
  const r = await call(server, "se_file_write", {
    path: NODE,
    base_hash: null,
    content: frontmatter("statement: A fixture.\nstatus: open"),
  });
  const took = Date.now() - started;

  assert.notEqual(r.body.kind, "rejected", `a sound write lands: ${JSON.stringify(r.body)}`);
  // The measured baseline on 2026-08-16 was 4 to 12 ms unguarded, against the
  // standing 1000 ms rule. A guard that spends the rest of the budget belongs
  // in the sweep instead.
  assert.ok(took < 1000, `the guarded write answered in ${String(took)} ms, and the rule is 1000`);
});

test("a check too slow for the write reports through the sweep instead", () => {
  const root = freshRoot();
  gitInit(root);

  // A corpus-wide condition may never refuse a write. It reports, and the
  // sweep is where it runs.
  //
  // THIS CASE USED TO DRIVE se_lint AND WAS AIMED AT THE WRONG VERB. se_lint
  // is the VOICE lint and it already sweeps by glob; the gap was the
  // CONFORMANCE sweep, which is a different question about the same files.
  // raid-iss-se-lint-has-no-whole-repo-sweep was stale on that point and the
  // case inherited the staleness.
  const r = sweepCorpus(root, "spec/trace");

  assert.ok(Array.isArray(r.findings), `the sweep answers with findings: ${JSON.stringify(r)}`);
  assert.ok(r.scanned >= 0, "the sweep says how many nodes it read, so an empty answer is not silence");
});

test("the sweep reports a standing break rather than refusing it", () => {
  const root = freshRoot();
  gitInit(root);

  // A node already on disk with a word outside its key's list. The guard would
  // have refused it at the write; the sweep names it without blocking anybody.
  const dir = join(root, "spec", "trace", "raid");
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "raid-probe-swept.md"), frontmatter("statement: A fixture.\nstatus: part-closed"), "utf8");

  const r = sweepCorpus(root, "spec/trace");
  const named = r.findings.filter((f) => f.path.includes("raid-probe-swept"));

  assert.equal(named.length, 1, `the sweep names it once: ${JSON.stringify(r.findings)}`);
  assert.equal(named[0].kind, "outside-vocabulary", "and says which check found it");
  assert.match(named[0].says, /part-closed/, "the report names the difference, not the category");
});

test("no flag can wave the guard through", async () => {
  const root = freshRoot();
  gitInit(root);
  const server = await bootedServer(root);

  const r = await call(server, "se_file_write", {
    path: NODE,
    base_hash: null,
    content: frontmatter("statement: The second is worse: it taxes an unrelated edit."),
    force: true,
  });

  assert.equal(r.body.kind, "rejected", `force does not clear the guard: ${JSON.stringify(r.body)}`);
  assert.ok(!existsSync(join(root, NODE)), "nothing landed even with force");
});

test("a sound write still lands and still returns its hash", async () => {
  const root = freshRoot();
  gitInit(root);
  const server = await bootedServer(root);

  const r = await call(server, "se_file_write", {
    path: NODE,
    base_hash: null,
    content: frontmatter("statement: A fixture.\nstatus: open"),
  });

  assert.equal((r.body as { created?: boolean }).created, true, `the write lands: ${JSON.stringify(r.body)}`);
  assert.ok(existsSync(join(root, NODE)), "the file is on disk");
  assert.match(readFileSync(join(root, NODE), "utf8"), /status: open/, "the content is what was sent");
});

test("the patch verb refuses an unquoted colon too, and leaves the file as it was", async () => {
  const root = freshRoot();
  gitInit(root);
  const server = await bootedServer(root);

  const sound = frontmatter("statement: A fixture.\nstatus: open");
  const first = await call(server, "se_file_write", { path: NODE, base_hash: null, content: sound });
  assert.notEqual(first.body.kind, "rejected", `the fixture lands: ${JSON.stringify(first.body)}`);

  // THE SAME BREAK, THROUGH THE VERB THE CONTRACT SENDS EVERY AGENT TO. The
  // whole-file writer refused this shape from the day the guard was built. The
  // patch verb accepted it, and the walk then died on a bare parser message
  // carrying no clause and no remedy.
  const r = await call(server, "se_file_patch", {
    ops: [{ path: NODE, old_string: "status: open", new_string: "trigger: it fired already and collected nothing: the mark is dropped" }],
  });

  const said = JSON.stringify(r.body);
  assert.equal(r.body.kind, "rejected", `the patch is refused, not accepted: ${said}`);
  assert.match(said, /raid-probe-written-by-the-guard-test/, "the refusal names the file");
  assert.match(said, /nothing: the mark/, "the refusal quotes the offending value back");
  assert.ok((r.body as { remedy?: unknown }).remedy !== undefined, `the refusal carries an executable remedy: ${said}`);
  assert.equal(readFileSync(join(root, NODE), "utf8"), sound, "the file on disk is exactly what it was");
});

test("the patch verb still lands an edit that keeps the frontmatter readable", async () => {
  const root = freshRoot();
  gitInit(root);
  const server = await bootedServer(root);

  const first = await call(server, "se_file_write", {
    path: NODE,
    base_hash: null,
    content: frontmatter("statement: A fixture.\nstatus: open"),
  });
  assert.notEqual(first.body.kind, "rejected", `the fixture lands: ${JSON.stringify(first.body)}`);

  const r = await call(server, "se_file_patch", {
    ops: [{ path: NODE, old_string: "status: open", new_string: "status: closed" }],
  });

  assert.notEqual(r.body.kind, "rejected", `a sound patch is not refused: ${JSON.stringify(r.body)}`);
  assert.match(readFileSync(join(root, NODE), "utf8"), /status: closed/, "the edit is on disk");
});
