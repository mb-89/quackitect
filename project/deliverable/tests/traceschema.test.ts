// THE LEGAL EDGES, checked (owner ruling 2026-08-07).
//
// The trace spine runs value-prop, story, use-case, requirement, function.
// A function satisfies a REQUIREMENT. It never points at a use case, and a
// diagonal edge is not a shortcut: every coverage check is a claim about
// exactly one hop, so a function reaching past the requirement makes that
// requirement look covered by something two levels away.
import { strict as assert } from "node:assert";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { looksLikeId, refsIn, type TraceNode } from "../engine/trace.ts";
import { edgeKeys, edgeProblems, traceSchema } from "../engine/traceschema.ts";
import { freshRoot } from "./helpers.ts";

/** A root carrying the shipped schema, plus one node file per case. */
function withSchema(): { root: string; node: (id: string, type: string, key: string, target: string) => TraceNode } {
  const root = freshRoot();
  const dir = join(root, "project", "deliverable", "machines");
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, "trace-schema.md"),
    [
      "---",
      "kind: trace-schema",
      "edges:",
      "  - from: requirement",
      "    key: refines",
      "    to: use-case",
      "  - from: function",
      "    key: satisfies",
      "    to: requirement",
      "---",
      "",
      "the spine",
      "",
    ].join("\n"),
    "utf8",
  );
  const nodes = join(root, "nodes");
  mkdirSync(nodes, { recursive: true });
  const node = (id: string, type: string, key: string, target: string): TraceNode => {
    const file = join(nodes, `${id}.md`);
    writeFileSync(file, `---\nid: ${id}\ntype: "[[${type}]]"\n${key}:\n  - ${target}\n---\n\nbody\n`, "utf8");
    return { id, type, statement: "", refines: [target], file };
  };
  return { root, node };
}

test("the schema is read from the file, and an absent one checks nothing", () => {
  const { root } = withSchema();
  assert.equal(traceSchema(root).length, 2);
  assert.deepEqual(edgeKeys(traceSchema(root), "function"), ["satisfies"]);

  // A PRODUCT MID-VENDORING MUST STILL BE ABLE TO SUBMIT. No schema means
  // nothing is checked, never that everything is refused. A fresh root
  // already carries the shipped schema, so the absent case needs a root
  // that genuinely has none.
  assert.deepEqual(traceSchema(join(root, "nowhere")), []);
});

test("a function satisfying a requirement is legal", () => {
  const { root, node } = withSchema();
  const req = { id: "req-a", type: "requirement", statement: "", refines: [] } as TraceNode;
  const fn = node("fn-a", "function", "satisfies", "req-a");
  assert.deepEqual(edgeProblems(fn, new Map([["req-a", req]]), root), []);
});

test("a function pointing at a use case is refused, and the message names the hop", () => {
  const { root, node } = withSchema();
  const uc = { id: "uc-a", type: "use-case", statement: "", refines: [] } as TraceNode;
  const fn = node("fn-a", "function", "satisfies", "uc-a");
  const out = edgeProblems(fn, new Map([["uc-a", uc]]), root);
  assert.equal(out.length, 1);
  assert.match(out[0], /a function points at requirement/);
  assert.match(out[0], /uc-a is a use-case/);
});

test("a function carrying its edge under refines is refused", () => {
  const { root, node } = withSchema();
  const req = { id: "req-a", type: "requirement", statement: "", refines: [] } as TraceNode;
  // The TARGET is right and the WORD is wrong. `refines` claims the function
  // breaks the requirement into finer grain. It does not.
  const fn = node("fn-a", "function", "refines", "req-a");
  const out = edgeProblems(fn, new Map([["req-a", req]]), root);
  assert.equal(out.length, 1);
  assert.match(out[0], /carries its edge under satisfies, not refines/);
});

test("a type the schema does not mention is not checked", () => {
  const { root, node } = withSchema();
  // A RAID entry stands beside the trace, not in it. Refusing it would turn
  // the schema into a list of everything.
  const req = { id: "req-a", type: "requirement", statement: "", refines: [] } as TraceNode;
  const raid = node("raid-a", "raid", "source_refs", "req-a");
  assert.deepEqual(edgeProblems(raid, new Map([["req-a", req]]), root), []);
});

test("an edge to a node outside the corpus is left to the dangling check", () => {
  const { root, node } = withSchema();
  // Two different defects want two different messages. "no artifact for x"
  // already exists and says the right thing; repeating it here as a type
  // error would send the reader looking for a type that is not the problem.
  const fn = node("fn-a", "function", "satisfies", "req-missing");
  assert.deepEqual(edgeProblems(fn, new Map(), root), []);
});

// A DOTTED ID IS AN ID (owner ruling 2026-08-07). The function tree carries
// its shape in the id: fn-a.b sits under fn-a.
//
// looksLikeId had no dot in its class, so refsIn DROPPED every dotted ref
// before anything looked at it. Not refused, not reported. The coverage check
// then reported that no function covered any requirement, which pointed at
// the tree instead of the extractor, and the tree was correct.
test("a dotted id survives the shape test and the ref extractor", () => {
  assert.equal(looksLikeId("fn-run-a-governed-walk"), true, "the root, with no dot");
  assert.equal(looksLikeId("fn-run-a-governed-walk.serve-a-step"), true, "one level down");
  assert.equal(looksLikeId("fn-a.b.c"), true, "two levels down");
  assert.equal(looksLikeId("req-plain"), true, "an ordinary id is unaffected");

  // The parent is the id with the last segment removed, so nothing stores it.
  assert.equal("fn-a.b.c".split(".").slice(0, -1).join("."), "fn-a.b");

  // AND THE EXTRACTOR KEEPS THEM. This is the half that failed live: the
  // shape test is only useful because refsIn consults it.
  assert.deepEqual(refsIn("- fn-a\n- fn-a.b\n- fn-a.b.c\n"), ["fn-a", "fn-a.b", "fn-a.b.c"]);

  // A sentence is still not a reference.
  assert.deepEqual(refsIn("- this is prose, not an id\n"), []);
});
