// A TEST THAT SWAPS A PACKAGE SEAM DOES NOT RUN IN PARALLEL.
//
// A seam is a package-level variable a test replaces to drive the code without
// the world: gitRuns, readsTheProxyNote, theToolchain. Every test in the
// package shares it, so one test holding a fake while another drives the real
// thing is a race with no lock in it.
//
// MEASURED. Two parallel tests in gitfedcancel_test.go held gitRuns while three
// other parallel tests drove the real git, and those three failed as a group
// with git answering that refs/se/claims is not a valid object name. Alone,
// each passed. wk-00e4785e51 took those two out of parallel, which fixed the
// instance and left the rule unwritten. See wk-64e8f37aa4.
//
// GO REFUSES t.Setenv INSIDE A PARALLEL TEST for exactly this reason, and has
// no such refusal for a plain variable. This is that refusal, for these seams.
//
// A HELPER COUNTS AS ITS CALLER. aFedGit swaps gitRuns and every test calling
// it swaps gitRuns, so the walk follows one hop into the package's own helpers.
//
//   node util/checks/no-parallel-seam-swap.mjs <root>
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = process.argv[2] ?? ".";
const dir = join(root, "src", "engine");

let bad = 0;
function say(what, ok, why) {
  if (!ok) bad++;
  console.log((ok ? "  ok   " : "  FAIL ") + what + (ok ? "" : "\n         " + why));
}

let files;
try {
  files = readdirSync(dir).filter((f) => f.endsWith(".go"));
} catch (e) {
  say("src/engine can be read", false, e.message);
  console.log("\n0 test(s) read. 1 failed.");
  process.exit(1);
}

// THE SEAMS ARE THE PACKAGE'S OWN VARIABLES, read rather than listed, so a seam
// added tomorrow is guarded the day it lands.
const seams = new Set();
for (const f of files) {
  const text = readFileSync(join(dir, f), "utf8");
  for (const m of text.matchAll(/^var\s+([A-Za-z]\w*)\s*=/gm)) seams.add(m[1]);
  // var ( ... ) blocks: a name assigned inside one is the same kind of seam.
  for (const block of text.matchAll(/^var \(\n([\s\S]*?)^\)/gm)) {
    for (const m of block[1].matchAll(/^\t([A-Za-z]\w*)\s*=/gm)) seams.add(m[1]);
  }
}

// theFunctions splits a file into its top level functions, name to body.
function theFunctions(text) {
  const out = new Map();
  const starts = [...text.matchAll(/^func (?:\([^)]*\) )?([A-Za-z_]\w*)\(/gm)];
  for (const [i, m] of starts.entries()) {
    const end = i + 1 < starts.length ? starts[i + 1].index : text.length;
    out.set(m[1], text.slice(m.index, end));
  }
  return out;
}

const bodies = new Map();
for (const f of files) {
  for (const [name, body] of theFunctions(readFileSync(join(dir, f), "utf8"))) {
    bodies.set(name, { file: f, body });
  }
}

// swapsASeam says which seams this body assigns, directly.
//
// A NAME THE FUNCTION DECLARES IS ITS OWN, not the package's. run and
// separators are both package variables and both are shadowed by a local of
// the same name, and reading a shadowed assignment as a swap named 160 tests
// that swap nothing.
function swapsASeam(body) {
  const hit = new Set();
  // A SWAP UNDER A LOCK IS DELIBERATE, and it is the escape this check's own
  // refusal offers. aFedToolchain takes feeding.Lock before it writes the seam
  // and releases it in the cleanup, so two feeders cannot overlap. That was
  // wk-2493bf564a, measured as four failures in eight runs before the lock.
  if (/\.Lock\(\)/.test(body)) return hit;
  for (const seam of seams) {
    const its = new RegExp("(?:^|[(,\\s])" + seam + "\\s*(?:,[\\w\\s,]*)?:=|\\bvar\\s+" + seam + "\\b", "m");
    if (its.test(body)) continue; // the function declares it, so it is a local
    const assigns = new RegExp("^\\s*(?:[\\w,\\s]*,\\s*)?" + seam + "\\s*(?:,[^=\\n]*)?=[^=]", "m");
    if (assigns.test(body)) hit.add(seam);
  }
  return hit;
}

// theHelpers are the package's own functions that swap a seam, so a caller of
// one swaps it too.
const helpers = new Map();
for (const [name, { body }] of bodies) {
  const swapped = swapsASeam(body);
  if (swapped.size > 0 && !name.startsWith("Test")) helpers.set(name, swapped);
}

let read = 0;
for (const [name, { file, body }] of bodies) {
  if (!name.startsWith("Test") || !file.endsWith("_test.go")) continue;
  read++;
  if (!/\bt\.Parallel\(\)/.test(body)) continue;
  const swapped = new Set(swapsASeam(body));
  for (const [helper, seamsIt] of helpers) {
    if (new RegExp("\\b" + helper + "\\s*\\(").test(body)) {
      for (const s of seamsIt) swapped.add(s);
    }
  }
  say(name + " runs in parallel and swaps no package seam", swapped.size === 0,
    file + " swaps " + [...swapped].join(", ") + " while running in parallel. " +
    "Every test in the package shares that variable, so another parallel test " +
    "reads the fake or the real thing by luck. Take t.Parallel off this test, " +
    "or give the seam a lock every reader takes");
}

console.log("\n" + read + " test(s) read. " + bad + " failed.");
process.exit(bad ? 1 : 0);
