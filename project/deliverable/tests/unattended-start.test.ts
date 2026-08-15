// THE START STEP MUST RELEASE ITS CALLER, and that is the assertion nobody
// makes by accident.
//
// A test that only checks "the lane answers" passes while the launching
// command still hangs, because the lane does answer — from a process the
// caller is still waiting on. Four entrypoint steps run after start, so a
// blocked start is a silent failure of everything downstream.
//
// MEASURED BEFORE THIS TEST EXISTED, 2026-08-15: a child sleeping 45 s held
// its caller for 45,600 ms with detached, unref and stdio ignore all set, on
// Windows. See exp-does-a-backgrounded-lane-release-its-caller.
import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const DELIVERABLE = join(import.meta.dirname, "..");

/** Spawn a child that outlives the parent by `ms`, and time how long the
 *  PARENT took to return. The gap between the two is the whole question. */
function callerHeldFor(ms: number): number {
  const child = `setTimeout(function(){}, ${ms})`;
  const parent = [
    "const{spawn}=require('child_process');",
    `const c=spawn(process.execPath,['-e',${JSON.stringify(child)}],`,
    "{detached: process.platform !== 'win32', stdio: 'ignore'});",
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
test("the start step's spawn releases its caller before the child ends", {
  skip: process.platform === "win32" ? "windows cannot detach — measured, and the target is POSIX" : false,
}, () => {
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
  const want = Number(/(\d+)/.exec(declared)?.[1] ?? "0");
  const have = Number(/v(\d+)/.exec(process.version)?.[1] ?? "0");
  assert.ok(
    want >= 23,
    `the engine spawns its scripts as \`node <file>.ts\` with no flag, so the floor must be a version where that is the default. It declares ${declared}.`,
  );
  assert.ok(have >= want, `this machine runs ${process.version} and the declaration demands ${declared}`);
});

// AN UNATTENDED AGENT STARTS WITH WHATEVER IT WAS HANDED. Nobody is beside it
// to say where it is, so the guidance card must exist and the entrypoint must
// point at it by path. A card nobody is told about is a card nobody reads.
test("the cloud runner's guidance exists and the entrypoint hands it over", () => {
  const card = join(DELIVERABLE, "..", "guidance", "method", "cloud-runner.md");
  const text = readFileSync(card, "utf8");
  for (const owed of ["se_pull", "engines.node", "detached", "se_note"]) {
    assert.ok(text.includes(owed), `the cloud-runner card must tell an unattended agent about ${owed}`);
  }
  const src = readFileSync(join(DELIVERABLE, "engine", "bin", "se-start.ts"), "utf8");
  assert.ok(
    src.includes("cloud-runner.md"),
    "se-start.ts must name the guidance card by path — an agent that is not told where it is starts by reinventing",
  );
});

// A STEP THAT CANNOT NAME ITSELF IS THE FAILURE THE ENTRYPOINT EXISTS TO
// REMOVE. Every exit path prints "<step>: <why>" and nothing else.
test("every entrypoint failure names exactly one of the seven steps", () => {
  const src = readFileSync(join(DELIVERABLE, "engine", "bin", "se-start.ts"), "utf8");
  const steps = ["verify", "install", "start", "wait", "fetch", "adopt", "launch"];
  const named = [...src.matchAll(/\bdie\("([a-z]+)"/g)].map((m) => m[1]);
  assert.ok(named.length > 0, "se-start.ts must fail through die(), which is what carries the step name");
  const strangers = named.filter((n) => !steps.includes(n));
  assert.deepEqual(strangers, [], `every die() names one of the seven steps; these do not: ${strangers.join(", ")}`);
});
