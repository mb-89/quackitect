// THE OUTWARD-SEARCH CHECK, proved against the three cases it exists for.
//
// It runs as the exit script of find_prior_art, find_shipped and
// find_analogy. Those three are the reason the design space does not collapse
// to our own ideas, and until this landed nothing proved anybody looked.
import { strict as assert } from "node:assert";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, test } from "node:test";
import { fileURLToPath } from "node:url";

const SCRIPT = fileURLToPath(new URL("../engine/bin/outward-search.ts", import.meta.url));
const roots: string[] = [];

after(() => {
  for (const r of roots) rmSync(r, { recursive: true, force: true });
});

/** A root carrying the named option nodes, and a call log with `queries`
 *  outward calls in it. */
function rootWith(options: Record<string, string>, queries: number): string {
  const root = mkdtempSync(join(tmpdir(), "se-outward-"));
  roots.push(root);
  const dir = join(root, "project", "spec", "trace", "option");
  mkdirSync(dir, { recursive: true });
  for (const [name, body] of Object.entries(options)) writeFileSync(join(dir, `${name}.md`), body, "utf8");
  mkdirSync(join(root, ".se"), { recursive: true });
  const lines: string[] = [];
  for (let i = 0; i < queries; i++) lines.push(JSON.stringify({ ref: `call-${i}`, tool: "se_web_search" }));
  lines.push(JSON.stringify({ ref: "call-x", tool: "se_file_read" }));
  writeFileSync(join(root, ".se", "calls.jsonl"), `${lines.join("\n")}\n`, "utf8");
  return root;
}

/** Run the check. Returns its exit code and its output together. */
function run(root: string): { code: number; out: string } {
  try {
    const out = execFileSync("node", [SCRIPT, "--root", root], { encoding: "utf8" });
    return { code: 0, out };
  } catch (e) {
    const err = e as { status?: number; stdout?: string };
    return { code: err.status ?? -1, out: err.stdout ?? "" };
  }
}

const priorArt = (source: string) => `---\nid: opt-a\nfound_by: prior-art\nsource: ${source}\n---\n`;

test("no outward option means nothing to check", () => {
  const root = rootWith({ "opt-inward": "---\nid: opt-inward\nfound_by: without\nsource: trimming\n---\n" }, 0);
  const r = run(root);
  assert.equal(r.code, 0);
  assert.match(r.out, /nothing to check yet/);
});

test("an outward option with a real source and a recorded query is green", () => {
  const root = rootWith({ "opt-a": priorArt("https://example.org/a-paper") }, 2);
  const r = run(root);
  assert.equal(r.code, 0, r.out);
  assert.match(r.out, /green/);
});

// THE FAILURE THIS EXISTS TO NAME. The options look researched, and nobody
// ran a search.
test("outward options with no recorded query are red", () => {
  const root = rootWith({ "opt-a": priorArt("https://example.org/a-paper") }, 0);
  const r = run(root);
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, /no log segment records se_web_search, se_web_fetch or the native WebSearch/);
});

// THE BUG OF 2026-08-10. The contract allows the native WebSearch when the
// lane's provider is unconfigured, and a hook logs it under the host tool's
// own name. The check refused exactly that sanctioned path, and a rotated
// log segment would have hidden even a lane search.
test("a native WebSearch record in a rotated segment satisfies the check", () => {
  const root = rootWith({ "opt-a": priorArt("https://example.org/a-paper") }, 0);
  writeFileSync(
    join(root, ".se", "calls.1.jsonl"),
    `${JSON.stringify({ ref: "call-n", tool: "WebSearch" })}\n`,
    "utf8",
  );
  const r = run(root);
  assert.equal(r.code, 0, r.out);
  assert.match(r.out, /green/);
});

test("an outward option citing our own repository is red", () => {
  const root = rootWith({ "opt-a": priorArt("project/deliverable/machines/methods/meth-prior-art.md") }, 3);
  const r = run(root);
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, /is a path in this repository/);
});

test("an outward option with no source at all is red", () => {
  const root = rootWith({ "opt-a": "---\nid: opt-a\nfound_by: analogy\n---\n" }, 3);
  const r = run(root);
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, /no source/);
});

// The inward two owe nothing. A TRIZ principle number is a perfectly good
// source and no query stands behind it.
test("contradiction and without are never asked for a query", () => {
  const root = rootWith(
    {
      "opt-c": "---\nid: opt-c\nfound_by: contradiction\nsource: principle 35\n---\n",
      "opt-w": "---\nid: opt-w\nfound_by: without\nsource: the cluster is absorbed by its neighbour\n---\n",
    },
    0,
  );
  const r = run(root);
  assert.equal(r.code, 0, r.out);
});
