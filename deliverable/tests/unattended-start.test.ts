// THE START STEP MUST RELEASE ITS CALLER, and that is the assertion nobody
// makes by accident.
//
// A test that only checks "the lane answers" passes while the launching
// command still hangs, because the lane does answer — from a process the
// caller is still waiting on. Four entrypoint steps run after start, so a
// blocked start is a silent failure of everything downstream.
//
// MEASURED TWICE, AND THE FIRST MEASUREMENT WAS WRONG. i28 recorded a caller
// held for 45,600 ms and skipped this test on Windows because of it. At
// verification the same shape was re-timed against the parent PROCESS instead
// of the lane runner around it: 74 ms, with a child sleeping 20 s. The first
// run timed the harness, which waits on the child it inherited.
//
// SO THE SKIP IS GONE. It suppressed a case that passes, on the only platform
// this repository is developed on, which left the iteration's one load-bearing
// assertion running nowhere at all.
import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";

import { LANE_SPAWN, recordOnTrunk } from "../engine/bin/se-start.ts";
import { freshRoot } from "./helpers.ts";

const DELIVERABLE = join(import.meta.dirname, "..");
const ENTRYPOINT = join(DELIVERABLE, "engine", "bin", "se-start.ts");
const SOURCE = readFileSync(ENTRYPOINT, "utf8");

/** Spawn a child that outlives the parent by `ms`, and time how long the
 *  PARENT took to return. The gap between the two is the whole question.
 *
 *  THE OPTIONS COME FROM THE ENTRYPOINT, never from a copy written here. The
 *  earlier version re-declared them as a string literal, so changing the real
 *  spawn to something blocking left this test green. */
function callerHeldFor(ms: number): number {
  const child = `setTimeout(function(){}, ${ms})`;
  const parent = [
    "const{spawn}=require('child_process');",
    `const c=spawn(process.execPath,['-e',${JSON.stringify(child)}],`,
    `${JSON.stringify(LANE_SPAWN)});`,
    "c.unref();",
    "console.log(c.pid);",
  ].join("");
  const began = Date.now();
  const r = spawnSync(process.execPath, ["-e", parent], { encoding: "utf8" });
  const took = Date.now() - began;
  assert.equal(r.status, 0, "the probe parent itself must exit cleanly");
  return took;
}

// THE ORACLE IS THE GAP, never "it did not throw". The parent must come back
// while the child is provably still alive, so the number is compared against
// the child's own lifetime rather than against a constant somebody chose.
test("the start step's spawn releases its caller before the child ends", () => {
  const childLives = 4000;
  const held = callerHeldFor(childLives);
  assert.ok(
    held < childLives / 2,
    `the launching command must return while the child runs. It held for ${held} ms against a child living ${childLives} ms, so every entrypoint step after start would never run.`,
  );
});

// THE PIN IS READ, NEVER COPIED. The entrypoint compares the running node
// against package.json's own declaration, so the two cannot drift.
test("the declared runtime floor is one the engine can actually run on", () => {
  const declared = (JSON.parse(readFileSync(join(DELIVERABLE, "package.json"), "utf8")) as { engines?: { node?: string } }).engines?.node;
  assert.ok(declared !== undefined, "package.json must declare engines.node — the verify step has nothing to check against otherwise");
  const ver = (s: string): [number, number] => {
    const m = /(\d+)\.(\d+)/.exec(s);
    return m === null ? [Number(/(\d+)/.exec(s)?.[1] ?? "0"), 0] : [Number(m[1]), Number(m[2])];
  };
  const want = ver(declared);
  const have = ver(process.version);
  // THE FLOOR TRACKS THE PIN, MAJOR AND MINOR. It used to assert a bare major,
  // which was enough while the floor sat at a major boundary. It no longer
  // does: unflagged TypeScript execution landed in Node 22 at 22.18, so the
  // floor is INSIDE a major and 22.6 must still be refused.
  //
  // WHY 22 AND NOT 24 (owner ruling 2026-08-18): a cloud box gets 22 by
  // default, so pinning above it means installing a runtime on every arrival.
  // Measured on the i35 run — nothing in the engine needs 24, and the only
  // failures under 22 were these floor assertions failing BECAUSE the runtime
  // was 22.
  assert.ok(
    want[0] > 22 || (want[0] === 22 && want[1] >= 18),
    `the engine spawns its scripts as \`node <file>.ts\` with no flag, so the floor must be a version where that is the default — 22.18 or newer. It declares ${declared}.`,
  );
  assert.ok(
    have[0] > want[0] || (have[0] === want[0] && have[1] >= want[1]),
    `this machine runs ${process.version} and the declaration demands ${declared}`,
  );
});

// AN UNATTENDED AGENT STARTS WITH WHATEVER IT WAS HANDED. Nobody is beside it
// to say where it is, so the guidance card must exist and the entrypoint must
// point at it by path. A card nobody is told about is a card nobody reads.
test("the cloud runner's guidance exists and the entrypoint hands it over", () => {
  const card = join(DELIVERABLE, "..", "guidance", "method", "cloud-runner.md");
  const text = readFileSync(card, "utf8");
  for (const owed of ["se_pull", "engines.node", "se_note"]) {
    assert.ok(text.includes(owed), `the cloud-runner card must tell an unattended agent about ${owed}`);
  }
  assert.ok(
    SOURCE.includes("cloud-runner.md"),
    "se-start.ts must name the guidance card by path — an agent that is not told where it is starts by reinventing",
  );
});

// A STEP THAT CANNOT NAME ITSELF IS THE FAILURE THE ENTRYPOINT EXISTS TO
// REMOVE. Every exit path prints "<step>: <why>" and nothing else.
//
// IT NOW CHECKS BOTH DIRECTIONS. It asserted only that no die() named a
// stranger, so deleting six of the seven steps kept it green.
test("every entrypoint failure names exactly one of the six steps", () => {
  // SIX SINCE i34: `adopt` went with the claim system it existed to call.
  const steps = ["verify", "install", "start", "wait", "fetch", "launch"];
  const named = [...SOURCE.matchAll(/\bdie\("([a-z]+)"/g)].map((m) => m[1]);
  const strangers = named.filter((n) => !steps.includes(n));
  assert.deepEqual(strangers, [], `every die() names one of the six steps; these do not: ${strangers.join(", ")}`);
  const missing = steps.filter((s) => !named.includes(s));
  assert.deepEqual(missing, [], `every one of the six steps must have a way to fail loudly; these have none: ${missing.join(", ")}`);
});

// A CALLER WHO FORGOT AN ARGUMENT IS NOT A FAILING STEP. It exited as
// `verify:`, which sent the reader to look at the runtime.
test("a usage error exits without wearing a step's name", () => {
  const r = spawnSync(process.execPath, [ENTRYPOINT], { encoding: "utf8" });
  assert.equal(r.status, 2, `a usage error exits 2, separating it from a step failure. It exited ${r.status}.`);
  assert.ok(r.stderr.includes("usage:"), `the usage line must be printed. Got: ${r.stderr.trim()}`);
  for (const step of ["verify:", "install:", "start:", "wait:", "fetch:", "launch:"]) {
    assert.ok(!r.stderr.startsWith(step), `a usage error must not present as ${step} — it points the reader at the wrong thing`);
  }
});

// THE CHECKOUT IS THE ONE THE CALLER MEANT, and verify is where that is
// caught. A machine walking the wrong repository looks healthy the whole way.
test("verify refuses a checkout whose origin is not the repository asked for", () => {
  const r = spawnSync(process.execPath, [ENTRYPOINT, "--repo", "https://example.invalid/not-this-one", "--iteration", "i0"], {
    encoding: "utf8",
  });
  assert.equal(r.status, 1, `a wrong checkout is a step failure and exits 1. It exited ${r.status}.`);
  assert.ok(r.stderr.startsWith("verify:"), `the failure names its step. Got: ${r.stderr.trim()}`);
  assert.ok(r.stderr.includes("not-this-one"), "the message names the repository that was asked for, so the reader can see the mismatch");
});

// THE ADOPT CASE IS DELETED (i34). It pinned that the adopt step took a real
// claim rather than checking a branch existed, because two machines given the
// same id would otherwise both have walked it.
//
// THE STEP ITSELF IS GONE with the claim system. A record is a folder on trunk
// and a clone that has trunk has every record, so there is nothing to adopt.
// What stops two agents sharing one record is now an assumption with a
// trigger, raid-asm-only-one-agent-works-a-clone-at-a-time, rather than a lock.

// THE FETCH STEP PROVES THE RECORD, AND THE RECORD IS A FOLDER ON TRUNK (i6).
//
// It asked git for `refs/remotes/origin/it/<id>` and died without it. i34 made
// the seed mint a folder and no branch, so the branch a cloud start demanded
// stopped being created the day the seed stopped creating it. Every one still
// on the remote is a leftover — twenty-six of them, which cannot be deleted
// while this check reads them.
test("the fetch step proves the record by its folder on trunk", () => {
  const root = freshRoot();
  const id = "i99-a-fixture-iteration";
  assert.equal(recordOnTrunk(root, id), "", "a clone without the folder does not hold the record");

  const rel = join("spec", "iterations", id, "record.md");
  mkdirSync(join(root, dirname(rel)), { recursive: true });
  writeFileSync(join(root, rel), `---\nid: ${id}\nstatus: seeded\n---\n`, "utf8");
  assert.equal(recordOnTrunk(root, id), `spec/iterations/${id}/record.md`, "the folder IS the iteration, and the path is what comes back");
});

// NO BRANCH IS CONSULTED ANY MORE, and that is the property the twenty-six
// leftover branches wait on. A source check, because the alternative is
// standing up a remote to prove a negative.
//
// COMMENTS ARE STRIPPED FIRST. The entrypoint's own comment records why the
// branch check went, and it has to be free to say the words — a check that
// forbids naming the thing it removed forbids explaining the removal.
test("the entrypoint reads no it/* branch", () => {
  const code = SOURCE.split("\n")
    .filter((l) => !l.trimStart().startsWith("//"))
    .join("\n");
  assert.ok(!/refs\/remotes\/origin/.test(code), "se-start.ts must not resolve a remote branch — a record is a folder on trunk");
  assert.ok(!/it\/\$\{iteration\}/.test(code), "se-start.ts must not build an it/<id> branch name");
});

// LAUNCH STARTS AN AGENT. It stood for one iteration checking two files
// existed and printing "ready", which produced no walking agent at all — the
// one thing the requirement demands, graded fatal.
test("launch spawns a caged agent rather than announcing readiness", () => {
  const launch = /function launch\([\s\S]*?\n}/.exec(SOURCE)?.[0] ?? "";
  assert.ok(launch.length > 0, "se-start.ts must have a launch step");
  assert.ok(launch.includes("spawn("), "the launch step must spawn the agent — printing `ready` produces no walking agent");
  assert.ok(launch.includes("settings.json"), "the launch step must place the cage before spawning, or the agent runs uncaged");
  assert.ok(/die\("launch"/.test(launch), "launch must fail loudly when it cannot start an agent");
});
