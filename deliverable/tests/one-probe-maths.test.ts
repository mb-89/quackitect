// ONE COPY OF THE PROBE MATHS, AND THIS IS WHAT KEEPS IT ONE.
//
// OWNER, 2026-08-18: "why don't you have three copies of the same math? Export
// it, put it in one place, call it from everywhere."
//
// There were three: engine/session.ts built the probes, tests/helpers.ts kept a
// mirror called proofFor, and tests/iterations.test.ts inlined two more. When
// the engine stopped counting markdown list markers as words, the helper moved
// with it and the inlined pair did not. Two cases went red on a correct change.
//
// A COMMENT CANNOT MAKE TWO FUNCTIONS CHANGE TOGETHER. The stale mirror carried
// the words "the engine's own proof, mirrored" and named what it mirrored. It
// still drifted. Only calling one function keeps them equal, and only a check
// keeps anyone from writing a second one.
//
// WHAT THIS FILE FAILS ON: any file outside engine/readproof.ts that carries the
// probe fractions. They are the fingerprint of the maths — nothing else in the
// tree has a reason to name 0.92 beside 0.3 and 0.6.
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { proofFor, readingProbes, readingWords } from "../engine/readproof.ts";

const HERE = join(import.meta.dirname, "..");
const OWNER = join("engine", "readproof.ts");

function sources(dir: string, out: string[] = []): string[] {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.name === "node_modules" || e.name === "vendor" || e.name.startsWith(".")) continue;
    if (e.isDirectory()) sources(p, out);
    else if (e.name.endsWith(".ts") && statSync(p).size < 2_000_000) out.push(p);
  }
  return out;
}

test("only engine/readproof.ts carries the probe fractions", () => {
  const guilty: string[] = [];
  for (const p of sources(HERE)) {
    if (p.endsWith(OWNER) || p.endsWith("one-probe-maths.test.ts")) continue;
    const body = readFileSync(p, "utf8");
    if (body.includes("0.92") && body.includes("0.3") && body.includes("0.6")) guilty.push(p.slice(HERE.length + 1));
  }
  assert.deepEqual(
    guilty,
    [],
    `these files re-implement the probe maths — import it from engine/readproof.ts instead:\n${guilty.join("\n")}`,
  );
});

test("the answer proofFor gives satisfies the probes readingProbes asks", () => {
  // The two halves are the same maths seen from both ends. If they ever stop
  // agreeing, every read in the suite fails and nothing says why.
  const body = readFileSync(join(HERE, "..", "guidance", "contract.md"), "utf8");
  const { ask, expect } = readingProbes(body);
  assert.equal(ask.length, 3);
  const given = proofFor(body).toLowerCase();
  for (const e of expect) assert.ok(given.includes(e.toLowerCase()), `proofFor does not answer the probe "${e}"`);
});

test("a word carries a letter or a digit, and nothing else counts", () => {
  const w = readingWords("# Heading\n\n- a bullet\n\n| x | y |\n\n---\n\nplain words here");
  assert.deepEqual(w, ["Heading", "a", "bullet", "x", "y", "plain", "words", "here"]);
});
