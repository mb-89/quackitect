// EVERY REACH OUT OF THE ENGINE GOES THROUGH A NAMED DOOR, OR SAYS WHY NOT.
//
// This generalises the widget guard. That one governs a single conversation —
// who may emit markup — and this governs several, from one rule module that
// the write-time refusal and the whole-tree sweep both read.
//
// THE PREDICATE IS NOT WRITTEN HERE. It lives in engine/doors.ts. A copy in the
// test would be a second place holding one truth, which is the failure the
// whole regime is about, and tsp-the-door-regime-s-static-attributes checks
// this file for exactly that.
import { strict as assert } from "node:assert";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
// THE RULE MODULE REFUSES NOTHING. el-door-rule says so in as many words: it
// answers questions and performs no reach of its own. The two refusals live
// beside it and read it, which is the split widgets.ts does NOT have and the
// one thing this generalisation improves on its own worked example.
import { guardDepartureHasReason, guardNoUndeclaredReach } from "../engine/doorguard.ts";
import { DOORS, departureFile, departures, door, entryPoints, governedCount, strays } from "../engine/doors.ts";

/** A fresh root per case. Isolation is what makes these legal to run together,
 *  and a shared fixture is how a rare failure is born. */
function freshRoot(): string {
  const root = mkdtempSync(join(tmpdir(), "doors-"));
  mkdirSync(join(root, "deliverable", "engine"), { recursive: true });
  mkdirSync(join(root, "deliverable", "machines"), { recursive: true });
  return root;
}

function put(root: string, rel: string, text: string): void {
  const full = join(root, rel);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, text, "utf8");
}

/** The door this record builds first. Named here once so a rename breaks one
 *  line rather than twelve. */
const DISK = "keeping-a-record-on-disk";

// THE LIST IS SECTIONED, ONE HEADING PER DOOR. A bullet outside a section
// belongs to no door, so two doors cannot read each other's departures.
// See dsp-the-departure-list.md#interface.

/** A module that plainly holds the disk conversation. */
const REACHES_DISK = 'import { readFileSync } from "node:fs";\nexport const x = readFileSync;\n';

// ---------------------------------------------------------------------------
// req-the-reachability-guard-enumerates-exports-from-the-source
// ---------------------------------------------------------------------------

// THE FAULT THIS RECORD EXISTS TO FIX. A hand-written list of six sat in
// tests/help.test.ts and the engine had grown well past it, so entry points
// nobody listed answered to nothing.
test("the entry points are counted from the source, not from a list", () => {
  const found = entryPoints();
  assert.ok(
    found.length > 6,
    `the enumeration found ${String(found.length)} entry points. The hand-written list it replaces holds six, so anything at or below six means the list is still being read.`,
  );
});

// A WALK THAT RETURNS NOTHING PASSES EVERY OTHER ASSERTION. That is the silent
// pass the widget guard's own second case exists to catch, inherited here.
test("the entry point enumeration is not empty", () => {
  assert.ok(entryPoints().length > 0, "the entry point walk returned nothing, so every check over it is passing on an empty set");
});

// A NEW ENTRY POINT IS FOUND WITHOUT ANYBODY EDITING ANYTHING.
test("an entry point added to the tree is enumerated without a list edit", () => {
  const root = freshRoot();
  try {
    put(root, "deliverable/engine/bin/se-brand-new.ts", "export function main(): void {}\n");
    assert.ok(
      entryPoints(root).includes("deliverable/engine/bin/se-brand-new.ts"),
      "an entry point added to the source was not enumerated, so the guard is reading a list rather than the tree",
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// req-an-exemption-without-a-reason-is-refused-at-write-time
// ---------------------------------------------------------------------------

// THE DIFFERENTIATOR. Every compared system lets somebody bypass a boundary,
// and none makes the bypass explain itself.
test("a departure with no reason is refused at write time", () => {
  const root = freshRoot();
  try {
    const list = departureFile(DISK);
    const body = `## keeping-a-record-on-disk\n\n<!-- departures below this line -->\n- deliverable/engine/thing.ts\n`;
    assert.throws(
      () => guardDepartureHasReason(root, list, body, "test"),
      /reason/i,
      "a departure line carrying a bare path was accepted, which is the one thing this design claims to do differently",
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

// THE REFUSAL NAMES WHERE TO LOOK. A diagnosis that does not say which line is
// a remedy with the remedy removed.
test("the refusal names the file and the line the reason is missing from", () => {
  const root = freshRoot();
  try {
    const list = departureFile(DISK);
    const body = `## keeping-a-record-on-disk\n\n<!-- departures below this line -->\n- deliverable/engine/one.ts — a real reason\n- deliverable/engine/two.ts\n`;
    let message = "";
    try {
      guardDepartureHasReason(root, list, body, "test");
    } catch (e) {
      message = String((e as { message?: unknown }).message ?? e);
    }
    assert.match(message, /deliverable\/engine\/two\.ts/, `the refusal did not name the offending path. It said: ${message}`);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

// THE BOUNDARY. Empty after trimming is the line between refused and accepted.
test("a departure whose reason is only whitespace is refused", () => {
  const root = freshRoot();
  try {
    const list = departureFile(DISK);
    const body = `## keeping-a-record-on-disk\n\n<!-- departures below this line -->\n- deliverable/engine/thing.ts —    \n`;
    assert.throws(() => guardDepartureHasReason(root, list, body, "test"), /reason/i, "whitespace passed for a reason");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

// THE OTHER SIDE OF THE BOUNDARY. The rule demands a reason, never a good one.
// Judging quality is a reviewer's job, and the list is what they read.
test("a departure with a one-word reason is accepted", () => {
  const root = freshRoot();
  try {
    const list = departureFile(DISK);
    const body = `## keeping-a-record-on-disk\n\n<!-- departures below this line -->\n- deliverable/engine/thing.ts — vendored\n`;
    guardDepartureHasReason(root, list, body, "test");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

// A DECLARED DEPARTURE IS READ BACK WITH ITS REASON. The reason IS the entry,
// so a list that parses paths and drops reasons has kept the wrong half.
test("a declared departure is read back carrying its reason", () => {
  const root = freshRoot();
  try {
    put(
      root,
      departureFile(DISK),
      `## keeping-a-record-on-disk\n\n<!-- departures below this line -->\n- deliverable/engine/thing.ts — it owns its own jail under .se\n`,
    );
    assert.equal(
      departures(DISK, root).get("deliverable/engine/thing.ts"),
      "it owns its own jail under .se",
      "the departure list dropped the reason, which is the entry rather than metadata on it",
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// req-absence-from-the-exemption-list-means-not-exempt
// ---------------------------------------------------------------------------

// THE DEFAULT IS GOVERNED. A reader who does not find a module on the list must
// be able to conclude it was not allowed, rather than not looked at.
test("a reaching module absent from the list is reported", () => {
  const root = freshRoot();
  try {
    put(root, "deliverable/engine/undeclared.ts", REACHES_DISK);
    assert.ok(
      strays(DISK, root).includes("deliverable/engine/undeclared.ts"),
      "a module that reaches the conversation and sits on no list went unreported, so absence from the list means nothing",
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

// AND A DECLARED ONE IS NOT REPORTED. Without this the case above passes for a
// guard that reports everything.
test("a reaching module declared with a reason is not reported", () => {
  const root = freshRoot();
  try {
    put(root, "deliverable/engine/declared.ts", REACHES_DISK);
    put(
      root,
      departureFile(DISK),
      `## keeping-a-record-on-disk\n\n<!-- departures below this line -->\n- deliverable/engine/declared.ts — it is the door itself\n`,
    );
    assert.deepEqual(strays(DISK, root), [], "a declared departure was still reported, so the list is not being read");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

// A MISSING LIST MEANS NO DEPARTURES, never a crash. The guard has to answer
// even where nobody has written the list yet.
test("a missing departure list means no departures rather than a crash", () => {
  const root = freshRoot();
  try {
    assert.equal(departures(DISK, root).size, 0, "a missing list did not read as empty");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// The write-time guard: it refuses the ADDITION, never the edit
// ---------------------------------------------------------------------------

// A FILE THAT ALREADY REACHES STAYS WRITABLE. Most of the engine reaches disk,
// and a guard that froze them would block the fix as well as the fault. HOW
// MANY IS THE SWEEP'S ANSWER: a number written here goes stale on the next
// import somebody adds, and this comment said 81 while the tree held 82.
test("a write that turns a quiet file into a reacher is refused", () => {
  const root = freshRoot();
  try {
    assert.throws(
      () => guardNoUndeclaredReach(root, "deliverable/engine/quiet.ts", REACHES_DISK, "test"),
      /doors\.md|departure|door/i,
      "a write that added an undeclared reach was accepted",
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("a write to a file that already reaches is allowed", () => {
  const root = freshRoot();
  try {
    put(root, "deliverable/engine/already.ts", REACHES_DISK);
    guardNoUndeclaredReach(root, "deliverable/engine/already.ts", `${REACHES_DISK}export const y = 1;\n`, "test");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// Mechanical support for tsp-the-door-regime-s-static-attributes
// ---------------------------------------------------------------------------

// req-no-setting-disables-every-rule-at-once. One switch would undo the reason
// requirement, the list and the sweep together.
test("the rule module reads no environment variable", () => {
  const source = readFileSync(new URL("../engine/doors.ts", import.meta.url), "utf8");
  assert.equal(/process\.env/.test(source), false, "the rule module reads process.env, which is where a blanket off-switch lives");
});

// req-a-door-is-named-for-the-conversation-it-governs. A technology name is the
// carving the pattern's own primary source identifies as the failure.
test("no door is named for a technology", () => {
  const technologies = ["disk", "fs", "filesystem", "network", "http", "syscall", "shell", "process"];
  const named = DOORS.filter((d) => technologies.includes(d.id));
  assert.deepEqual(
    named.map((d) => d.id),
    [],
    "a door is named for what carries the conversation rather than for the conversation",
  );
});

// EVERY DOOR SAYS WHAT IT CANNOT SEE. Added by the prototype gate: 38 of 178
// modules reach a shell, and a shell carries no path a guard can judge.
test("every door states its coverage limit", () => {
  const silent = DOORS.filter((d) => d.governs.trim() === "");
  assert.deepEqual(
    silent.map((d) => d.id),
    [],
    "a door does not say what it governs, so a reader cannot tell what it misses",
  );
});

// THE TABLE IS NOT EMPTY. A regime with no doors passes every case above.
test("the rule table holds at least one door", () => {
  assert.ok(DOORS.length > 0, "the rule table is empty, so every check over it is passing on nothing");
});

// AND THE NAMED DOOR RESOLVES. A lookup that returns undefined would make every
// case above assert against nothing.
test("the disk-conversation door resolves by name", () => {
  assert.equal(door(DISK).id, DISK, `no door is registered under ${DISK}`);
});

// ---------------------------------------------------------------------------
// FAULT-BASED CASES. The classes above are equivalence classes and boundaries.
// These six come from asking what would BREAK the rule, which is the shape
// meth-test-design puts under fault-based methods, and every one of them was
// found by fresh eyes rather than by the cases above.
// ---------------------------------------------------------------------------

test("a section with no marker declares nothing", () => {
  const root = freshRoot();
  try {
    put(root, departureFile(DISK), `## ${DISK}\n\n- deliverable/engine/thing.ts — a real-looking reason\n`);
    assert.equal(
      departures(DISK, root).size,
      0,
      "a section that never opened its list handed out a departure anyway. The list says no marker turns a door off, and a missing one turned the region rule off.",
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("a door whose id prefixes another reads only its own section", () => {
  const root = freshRoot();
  try {
    const body =
      `## ${DISK}-and-the-network\n\n<!-- departures below this line -->\n- deliverable/engine/other.ts — the neighbour's\n\n` +
      `## ${DISK}\n\n<!-- departures below this line -->\n- deliverable/engine/mine.ts — this door's\n`;
    put(root, departureFile(DISK), body);
    const declared = departures(DISK, root);
    assert.ok(declared.has("deliverable/engine/mine.ts"), "the door lost its own departure");
    assert.ok(
      !declared.has("deliverable/engine/other.ts"),
      "the door read a neighbouring section's departures as its own. deliverable/machines/doors.md states the opposite as a property of itself.",
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

// THE FOURTH EQUIVALENCE CLASS the test spec names: a line that is not a path
// at all. It was silent, which is worse than refused — the author believes an
// exemption stands and the sweep goes on reporting the module.
test("a bullet the parser cannot read is refused rather than ignored", () => {
  const root = freshRoot();
  try {
    const body = `## ${DISK}\n\n<!-- departures below this line -->\n- deliverable/engine/thing — a reason, and no extension\n`;
    assert.throws(
      () => guardDepartureHasReason(root, departureFile(DISK), body, "test"),
      /names no module/i,
      "a bullet naming no matchable module was accepted, so the author was told nothing and granted nothing",
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

// THE LINE NUMBER IS A NAMED PROPERTY of the refusal, counted in the FILE
// rather than in the block. It was implemented and nothing tested it.
test("the refusal names the line the reason is missing from, counted in the file", () => {
  const root = freshRoot();
  try {
    const body = `## ${DISK}\n\n<!-- departures below this line -->\n- deliverable/engine/one.ts — a real reason\n- deliverable/engine/two.ts\n`;
    let message = "";
    try {
      guardDepartureHasReason(root, departureFile(DISK), body, "test");
    } catch (e) {
      message = String((e as { message?: unknown }).message ?? e);
    }
    assert.match(message, /:5\b/, `the refusal did not name line 5, where the bare path sits in the file. It said: ${message}`);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

// EVERY BARE LINE IS NAMED, not the first. Reporting one at a time cost an
// author one refused write per missing reason.
test("the refusal names every departure that states no reason, not only the first", () => {
  const root = freshRoot();
  try {
    const body = `## ${DISK}\n\n<!-- departures below this line -->\n- deliverable/engine/one.ts\n- deliverable/engine/two.ts\n`;
    let message = "";
    try {
      guardDepartureHasReason(root, departureFile(DISK), body, "test");
    } catch (e) {
      message = String((e as { message?: unknown }).message ?? e);
    }
    assert.match(message, /one\.ts/, `the refusal did not name the first bare path. It said: ${message}`);
    assert.match(
      message,
      /two\.ts/,
      `the refusal named only the first bare path, so a second write is owed for the second. It said: ${message}`,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// THE STATIC ATTRIBUTES, mechanised. tsp-the-door-regime-s-static-attributes
// names a mechanical check for two of its items and neither existed, so the
// spec claimed ground the suite did not hold — which a reader takes as evidence
// the ground is covered.
// ---------------------------------------------------------------------------

function sourceOf(rel: string): string {
  return readFileSync(new URL(rel, import.meta.url), "utf8");
}

// THE PROPERTY, NOT ONE LITERAL. The case that stood here asserted the exact
// regex that had been there and nothing else, so a restatement as
// `new RegExp(...)`, as `/^\s*-\s+/`, or as a hand-parse would all have passed
// a case named for the property.
const RESTATEMENTS = ['"^-', "'^-", "`^-", "/^-", "/^\\s*-", 'startsWith("- ")', '.endsWith(".ts")'];

test("the write guard holds no copy of the departure shape", () => {
  const source = sourceOf("../engine/doorguard.ts");
  for (const shape of RESTATEMENTS) {
    assert.ok(
      !source.includes(shape),
      `doorguard.ts restates the departure-line shape as ${shape}. req-one-rule-is-expressed-once-and-read-by-two-callers forbids exactly that, and committing it inside this record is the failure the record exists to fix.`,
    );
  }
});

// THE GUARD THAT ENFORCES THE DISK DOOR WAS ITSELF AN UNDECLARED REACH, and
// nothing said so. It imported node:fs to ask whether a file already reached.
test("the guard that enforces the disk door does not itself reach disk", () => {
  const source = sourceOf("../engine/doorguard.ts");
  assert.ok(
    !/from "node:fs/.test(source),
    "doorguard.ts imports the filesystem, so the module that refuses an undeclared reach is one. The on-disk question belongs in the rule module, which is declared.",
  );
});

// ITEM ONE'S SECOND HALF. The environment grep answers one way to turn every
// rule off at once; this answers the other. A runtime count passes on whatever
// the table happens to hold, so the SOURCE is asked whether it can be emptied.
const EMPTIERS = ["DOORS.splice(", "DOORS.pop(", "DOORS.shift(", "DOORS.length =", "DOORS = "];

test("the rule module holds no path that empties the door table", () => {
  const source = sourceOf("../engine/doors.ts");
  const declaration = "export const DOORS";
  const after = source.slice(source.indexOf(declaration) + declaration.length);
  for (const emptier of EMPTIERS) {
    assert.ok(
      !after.includes(emptier),
      `doors.ts carries ${emptier}, which is one control that suspends every rule together. req-no-setting-disables-every-rule-at-once forbids that.`,
    );
  }
});

// ITEM FOUR'S OTHER HALF. The no-copy case proves the guard holds no COPY of
// the shape. This proves it reads the ORIGINAL, which is a different claim: a
// caller could hold no regex and still decide the rule some other way.
const CALLERS = ["../engine/doorguard.ts", "../engine/bin/sweep.ts"];

test("both callers read the rule module rather than deciding alone", () => {
  for (const rel of CALLERS) {
    assert.match(
      sourceOf(rel),
      /from "\.\.?\/doors\.ts"/,
      `${rel} does not import from the rule module, so whatever it decides about a door it decides by itself`,
    );
  }
});

// THE CHOKEPOINT. Three of the lane's four write verbs called neither refusal,
// and the guarded one was not the verb the contract tells every agent to use
// for source edits. This is a reading made mechanical rather than a behaviour
// test: it catches a call site deleted, not a guard that stops refusing.
const WRITE_PATHS = ["../engine/files.ts", "../engine/files-patch.ts", "../engine/move.ts"];

test("every write path in the lane calls the one content guard", () => {
  for (const rel of WRITE_PATHS) {
    assert.match(
      sourceOf(rel),
      /guardWriteContent\(/,
      `${rel} writes without asking the one guard, so a rule enforced there is enforced on one verb of four`,
    );
  }
});

// A SWEEP THAT LOOKED AT NOTHING MUST NOT REPORT GREEN. The case that stood
// here asserted that the count and the stray list were both zero — and BOTH
// WERE ALREADY TRUE before the fix. That was the bug. This runs the sweep.
test("the sweep refuses to call a tree it never looked at green", () => {
  const root = mkdtempSync(join(tmpdir(), "doors-empty-"));
  try {
    const sweep = fileURLToPath(new URL("../engine/bin/sweep.ts", import.meta.url));
    let out = "";
    let exit = 0;
    try {
      out = execFileSync(process.execPath, [sweep, "--root", root], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    } catch (e) {
      const failed = e as { status?: number; stdout?: string };
      exit = failed.status ?? 1;
      out = failed.stdout ?? "";
    }
    assert.match(out, /UNCHECKED/, `the sweep said nothing about having looked at nothing. It printed: ${out}`);
    assert.notEqual(
      exit,
      0,
      `the sweep exited 0 on a tree holding no governed file, which every caller reads as green. It printed: ${out}`,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

// THE PRIMITIVE BEHIND IT, kept because a caller needs to tell "nothing wrong"
// from "nothing looked at", and because the case above cannot say WHY it failed.
test("a root holding no engine folder governs no file, which is why the count exists", () => {
  const root = mkdtempSync(join(tmpdir(), "doors-empty-"));
  try {
    assert.equal(governedCount(DISK, root), 0, "a tree with no engine folder governs no file");
    assert.equal(
      strays(DISK, root).length,
      0,
      "and it therefore reports no strays, which is exactly the reading that must not pass for green",
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

/** The ops a refusal hands back, or a failure saying it accepted what it should
 *  have refused. */
function remedyOps(fn: () => void): { path: string; old_string: string; new_string: string }[] {
  try {
    fn();
  } catch (e) {
    const r = (e as { remedy?: { args?: { ops?: unknown } } }).remedy;
    return (r?.args?.ops ?? []) as { path: string; old_string: string; new_string: string }[];
  }
  throw new Error("the guard accepted a line it was supposed to refuse");
}

// A REMEDY THAT CANNOT BE APPLIED IS A DIAGNOSIS WEARING A REMEDY'S CLOTHES.
//
// The write carrying the bare line was REFUSED, so that line stands on no disk
// anywhere and a patch anchored to it matches nothing. Found by performing the
// demonstration rather than asserting it: the remedy came back, was sent
// verbatim, and refused with SE-C-105 for zero occurrences.
test("the remedy for a bare line the refused write carried anchors on text the file has", () => {
  const root = freshRoot();
  try {
    const list = departureFile(DISK);
    put(root, list, `## ${DISK}\n\n<!-- departures below this line -->\n`);
    const body = `## ${DISK}\n\n<!-- departures below this line -->\n- deliverable/engine/thing.ts\n`;
    const ops = remedyOps(() => guardDepartureHasReason(root, list, body, "test"));
    const disk = readFileSync(join(root, list), "utf8");
    assert.ok(
      disk.includes(ops[0].old_string),
      `the remedy anchors on text the file does not carry, so sending it refuses. It anchored on: ${ops[0].old_string}`,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

// THE OTHER HALF, and it is why the choice is per line rather than global.
//
// Where the bare line DOES stand on disk, an author dropped the reason from a
// line already declared, and replacing that line is right. It stays anchored to
// the whole line because a bare path is a strict PREFIX of the same path
// carrying its reason.
test("the remedy for a bare line already on disk replaces that line in place", () => {
  const root = freshRoot();
  try {
    const list = departureFile(DISK);
    const body = `## ${DISK}\n\n<!-- departures below this line -->\n- deliverable/engine/thing.ts\n`;
    put(root, list, body);
    const ops = remedyOps(() => guardDepartureHasReason(root, list, body, "test"));
    assert.equal(
      ops[0].old_string,
      "- deliverable/engine/thing.ts\n",
      "a line standing on disk is repaired where it stands, not appended a second time",
    );
    const disk = readFileSync(join(root, list), "utf8");
    assert.ok(disk.includes(ops[0].old_string), "the in-place remedy does not match the file it targets");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

// THE SAME HOLE ON THE MALFORMED BRANCH. Both shapes of SE-C-150 hand back a
// patch, so both owe one that applies.
test("the remedy for an unreadable bullet the refused write carried anchors on text the file has", () => {
  const root = freshRoot();
  try {
    const list = departureFile(DISK);
    put(root, list, `## ${DISK}\n\n<!-- departures below this line -->\n`);
    const body = `## ${DISK}\n\n<!-- departures below this line -->\n- deliverable/engine/thing — a reason, and no extension\n`;
    const ops = remedyOps(() => guardDepartureHasReason(root, list, body, "test"));
    const disk = readFileSync(join(root, list), "utf8");
    assert.ok(
      disk.includes(ops[0].old_string),
      `the remedy anchors on text the file does not carry, so sending it refuses. It anchored on: ${ops[0].old_string}`,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
