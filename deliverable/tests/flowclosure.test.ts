// THE FLOW-CLOSURE CHECK, proved against the holes it exists to find.
//
// It runs as the exit script of derive-functions. Until it landed, that
// state's flows field promised a both-ways check in prose and no code
// anywhere ran it.
import { strict as assert } from "node:assert";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, test } from "node:test";
import { fileURLToPath } from "node:url";

const SCRIPT = fileURLToPath(new URL("../engine/bin/flow-closure.ts", import.meta.url));
const roots: string[] = [];

after(() => {
  for (const r of roots) rmSync(r, { recursive: true, force: true });
});

const fn = (id: string, ins: string[], outs: string[]) =>
  [
    "---",
    `id: ${id}`,
    'type: "[[function]]"',
    "inputs:",
    ...ins.map((i) => `  - ${i}`),
    "outputs:",
    ...outs.map((o) => `  - ${o}`),
    "---",
    "",
  ].join("\n");

/** A flow node. `crosses` rides the id as a suffix so the cases stay short:
 *  "flow-intent|in" is a boundary flow coming from the world. */
const flow = (spec: string) => {
  const [id, crosses] = spec.split("|");
  return ["---", `id: ${id}`, 'type: "[[flow]]"', "kind: signal", ...(crosses ? [`crosses: ${crosses}`] : []), "---", ""].join("\n");
};

function rootWith(functions: Record<string, string>, flows: string[]): string {
  const root = mkdtempSync(join(tmpdir(), "se-flow-"));
  roots.push(root);
  const fnDir = join(root, "spec", "trace", "function");
  const flowDir = join(root, "spec", "trace", "flow");
  mkdirSync(fnDir, { recursive: true });
  mkdirSync(flowDir, { recursive: true });
  for (const [name, body] of Object.entries(functions)) writeFileSync(join(fnDir, `${name}.md`), body, "utf8");
  for (const spec of flows) writeFileSync(join(flowDir, `${spec.split("|")[0]}.md`), flow(spec), "utf8");
  return root;
}

function run(root: string): { code: number; out: string } {
  try {
    return { code: 0, out: execFileSync("node", [SCRIPT, "--root", root], { encoding: "utf8" }) };
  } catch (e) {
    const err = e as { status?: number; stdout?: string };
    return { code: err.status ?? -1, out: err.stdout ?? "" };
  }
}

// The shape every case below varies: one function taking a boundary flow in
// and putting a boundary flow out.
const closed = () =>
  rootWith({ "fn-top.work": fn("fn-top.work", ["flow-intent"], ["flow-answer"]) }, ["flow-intent|in", "flow-answer|out"]);

test("a closed structure is green", () => {
  const r = run(closed());
  assert.equal(r.code, 0, r.out);
  assert.match(r.out, /green: 2 flows/);
});

test("a flow nothing produces is red", () => {
  const root = rootWith({ "fn-top.work": fn("fn-top.work", ["flow-orphan"], ["flow-answer"]) }, ["flow-answer|out", "flow-orphan"]);
  const r = run(root);
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, /flow-orphan: nothing produces it/);
});

test("a flow nothing consumes is red", () => {
  const root = rootWith({ "fn-top.work": fn("fn-top.work", ["flow-intent"], ["flow-unwanted"]) }, ["flow-intent|in", "flow-unwanted"]);
  const r = run(root);
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, /flow-unwanted: nothing consumes it/);
});

// THE BOUNDARY. A marked flow owes only the half that faces inward. This is
// the case that would make the check unusable if it were wrong.
test("a marked boundary flow is excused its outward half", () => {
  const r = run(closed());
  assert.equal(r.code, 0, r.out);
  assert.doesNotMatch(r.out, /flow-intent: nothing produces/);
  assert.doesNotMatch(r.out, /flow-answer: nothing consumes/);
});

// A MARKER THAT IS NOT in OR out IS ITSELF THE FINDING. Silently treating a
// typo as internal would turn a boundary flow into a false hole.
test("an unknown crosses value is red", () => {
  const root = rootWith({ "fn-top.work": fn("fn-top.work", ["flow-intent"], ["flow-answer"]) }, ["flow-intent|inward", "flow-answer|out"]);
  const r = run(root);
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, /crosses is "inward"/);
});

// THE ORIGINAL DEFECT. Two functions meaning one thing, spelled two ways,
// with no edge between them and nothing to notice.
test("a function naming prose instead of a flow node is red", () => {
  const root = rootWith({ "fn-top.work": fn("fn-top.work", ["the person's intent"], ["flow-answer"]) }, ["flow-answer|out"]);
  const r = run(root);
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, /"the person's intent" is named by a function but is no flow node/);
});

test("wiki brackets read the same as a bare id", () => {
  const root = rootWith({ "fn-top.work": fn("fn-top.work", ["[[flow-intent]]"], ["[[flow-answer]]"]) }, [
    "flow-intent|in",
    "flow-answer|out",
  ]);
  const r = run(root);
  assert.equal(r.code, 0, r.out);
});
