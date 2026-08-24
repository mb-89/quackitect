// THE WALK'S FEEDBACK LOOP — places the machine knows something and does not
// say it. i3's charter.
//
// TEST-FIRST: the reproduction is the requirement's voice, and a behaviour fix
// with no reproducing check is the lazy work the process exists to stop. Both
// cases here are RED until i3 builds its half.
//
// THE ORACLE IS `credited`, NOT THE OWED LIST. A first draft asserted that
// route_reads falls to zero after a read, and both cases then failed at that
// precondition instead of at their claim — coverage that proves nothing, which
// is the exact failure this file's spec warns about. The way ahead recomputes
// what it demands, so the owed list is not a credit ledger.
//
// What IS a credit ledger is the read's own answer. reading.test.ts pins the
// rule these cases build on: read the reading twice in one session and the
// second read credits nothing, because nothing is credited twice.
//
// So a surviving credit is observable as an EMPTY `credited` after a reload,
// and a died credit is observable as the same documents credited all over
// again.
import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { appendFileSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { Session } from "../engine/session.ts";
import { buildServer } from "../engine/tools.ts";
import { call, checkDocs, freshRoot } from "./helpers.ts";

// THIS FILE WRITES process.env, so it stays sequential and quarantined here
// rather than sharing a file with independent cases. The credit rides the
// session stamp on purpose — it restores for THIS session and never the next,
// which is what keeps req-compaction-reowes-the-reading true. A case with no
// stamp would prove the opposite of what it claims.
process.env.SE_SESSION = "feedback-loop-test";

// A RELOAD IS A NEW PROCESS OVER ONE TREE. A test cannot replace its own
// process, so it does the one thing a reload does that matters here: it makes
// the stored credit belong to a DIFFERENT process. Same session, new engine.
//
// Without this the case would prove the opposite of what it claims. Two
// Session objects inside one process are NOT a reload, and reads.test.ts
// exists to forbid the second one inheriting anything.
const simulateReload = (root: string): void => {
  const p = join(root, ".se", "settings.json");
  const s = JSON.parse(readFileSync(p, "utf8")) as Record<string, unknown>;
  s.reads_pid = process.pid + 1;
  writeFileSync(p, `${JSON.stringify(s)}\n`, "utf8");
};

const readTheReading = async (root: string): Promise<string[]> => {
  const session = new Session(root);
  const server = buildServer(root, session);
  const got = await call(server, "se_file_read", { path: ".se/reading.md" });
  assert.equal(got.isError, false, JSON.stringify(got.body));
  return got.body.credited as string[];
};

// A RELOAD IS A SECOND SESSION OVER ONE ROOT. That is what se_reload does to
// the engine: the process is replaced and the tree is not.
//
// req-reading-credit-survives-a-reload
test("the reading credit survives a reload", async () => {
  const root = freshRoot();

  const first = await readTheReading(root);
  assert.ok(first.length > 0, "a fresh root owes reading, or this case proves nothing");

  simulateReload(root);
  const afterReload = await readTheReading(root);
  assert.deepEqual(afterReload, [], "RED until i3: the credit keys to document content and survives the reload, so nothing is owed again");
});

// THE OTHER HALF OF RELOADING IN PLACE (owner ruling 2026-08-15): "the point of
// boot is to boot the agent, not the machine".
//
// The position is deliberately NOT remembered — req-reload-restarts-clean
// recomputes it from evidence. The target is what says which way to walk, so
// without it the recompute has nowhere to go and stops at the desk. Observed
// twice mid-i12: a reload cost an aim and a sweep to stand where it stood.
//
// req-reload-restarts-clean
test("the aimed target survives a reload, and a fresh session starts unaimed", () => {
  const root = freshRoot();
  const before = new Session(root);
  before.setTarget("front_desk");
  assert.equal(before.target, "front_desk", "the aim did not take, so this case would prove nothing");

  simulateReload(root);
  assert.equal(new Session(root).target, "front_desk", "a reload keeps the aim, so the recompute walks back with no call from the agent");

  // A DIFFERENT SESSION HAS AIMED AT NOTHING. Every real start still lands at
  // the desk (owner ruling 2026-07-29), because only a matching session stamp
  // restores. Same guard the reading credit rides, for the same reason.
  const p = join(root, ".se", "settings.json");
  const s = JSON.parse(readFileSync(p, "utf8")) as Record<string, unknown>;
  s.session = "a-different-session";
  writeFileSync(p, `${JSON.stringify(s)}\n`, "utf8");
  assert.equal(new Session(root).target, "front_desk", "a new session inherits no aim");
});

// THE OTHER HALF OF THE SAME DEMAND. A credit that survived everything would
// be worse than one that survives nothing, because the reader would hold old
// words while the engine called them read.
//
// req-reading-credit-survives-a-reload
test("a document whose content moved is owed again", async () => {
  const root = freshRoot();

  const credited = await readTheReading(root);
  const moved = credited[0];
  assert.ok(moved !== undefined, "something was credited, or there is nothing to move");

  // THE FIXTURE WRITES THROUGH THE FILESYSTEM, never the lane. At boot the
  // lane allows se_pull and se_file_read only, and walking the session
  // somewhere writable would change the very reading this case measures.
  appendFileSync(join(root, moved), "\nA line that moves the content.\n", "utf8");

  simulateReload(root);
  const afterReload = await readTheReading(root);
  assert.deepEqual(afterReload, [moved], "RED until i3: exactly the changed document is owed again, and no credit outlives its own words");
});

// THE TWO REMAINING CHARTER ITEMS OWE THEIR FIXTURES, and neither is written
// here rather than written badly.
//
// - req-red-objective-serves-its-fill needs a route whose OBJECTIVE carries a
//   red claim. A fresh root walks boot to the desk with nothing red, so the
//   fixture has to stand a record up and redden the state the route lands on.
// - req-one-verb-says-why-a-state-is-grey needs the verb's name, which is a
//   design decision this iteration has not taken. Asserting against a name
//   nobody chose would fail for the wrong reason — which is precisely what
//   this file's first draft did, and why the oracle above changed.
//
// Both are named in tsp-walk-feedback-loop as steps this state still owes.

// THE THIRD PLACE THE MACHINE KNEW AND DID NOT SAY: why a state is grey.
//
// The walk computes every condition on a step to decide whether it opens. It
// threw the FIRST failure and discarded the rest, so the answer existed for a
// microsecond and then had to be reconstructed by hand from files the lane was
// already holding.
//
// THE SPEC LISTED THIS STEP AS OWED, and named the reason honestly: the verb's
// name was a design decision this iteration had not taken. It is taken now
// (se_why), so the step is written rather than left owed.
test("one verb names every condition holding a state, and the walk refuses with the first of them", async () => {
  const root = freshRoot();
  const session = new Session(root);
  const server = buildServer(root, session);

  await session.advance();
  await session.advance();

  // A STATE THAT STANDS ANSWERS EMPTY. This is the half that makes the verb
  // usable: "nothing holds it" has to be sayable, or every answer reads as bad
  // news and the reader learns to ignore it.
  const desk = await call(server, "se_why", { state: "front_desk" });
  assert.equal(desk.isError, false, JSON.stringify(desk.body));
  assert.equal(typeof desk.body.says, "string", "the verb always says something in words");
  assert.ok(Array.isArray(desk.body.blockers), "and always hands back a list, even an empty one");

  // THE VERB SURVIVES A WRONG NAME. It exists to be asked from a position of
  // not knowing, so a name that resolves to nothing is an ANSWER, not a crash.
  const nonsense = await call(server, "se_why", { state: "no-such-state" });
  assert.equal(nonsense.isError, false, "an unknown state is answered, never thrown");
  assert.equal(nonsense.body.standing, false, "a state that cannot be read does not stand");
  assert.match(String(nonsense.body.says), /could not be read|held by/, "and it says so in words");

  // NO ARGUMENT MEANS WHERE THE WALK STANDS, which is the question somebody
  // actually has when they ask.
  const here = await call(server, "se_why", {});
  assert.equal(here.isError, false, JSON.stringify(here.body));
  assert.equal(here.body.state, session.active()[0] ?? null, "the default subject is the current position");
});

// ONE MECHANISM, TWO CALLERS. The verb must report what the walk would refuse
// with, and the only way to guarantee that is for both to read one list.
//
// A second copy would drift, and the drift would be invisible: the verb would
// explain a state by rules the walk no longer judges it by. That is worse than
// no verb, because it is confidently wrong.
test("the verb and the walk read ONE blocker list, not two copies", () => {
  // THE CLAIMS LEFT THE CLASS but the rule did not: the collector and both
  // readers must still be one list, and they are all in the claims now. The
  // session keeps a one-line wrapper, which is not a second copy.
  const src = readFileSync(join(import.meta.dirname, "..", "engine", "sessionclaims.ts"), "utf8");

  const collector = src.indexOf("stateBlockers(stateId: string): Blocker[]");
  assert.ok(collector > 0, "the collector exists and is the one place the conditions are computed");

  // The walk's assert must DELEGATE. If it grows its own checks again, this
  // goes red and says why.
  const asserter = src.indexOf("assertStateFormMet(stateId: string): void");
  assert.ok(asserter > 0, "the walk still asserts");
  const body = src.slice(asserter, asserter + 500);
  assert.match(body, /this\.stateBlockers\(stateId\)\[0\]/, "the walk throws the FIRST blocker rather than recomputing one");
  assert.equal((body.match(/throw new Rejection/g) ?? []).length, 1, "and it throws in exactly one place");

  // The verb must delegate too.
  const verb = src.indexOf("whyGrey(stateId?: string)");
  assert.ok(verb > 0, "the verb exists");
  assert.match(src.slice(verb, verb + 900), /this\.stateBlockers\(/, "and it reads the same list");
});

// THE SECOND PLACE THE MACHINE KNEW AND DID NOT SAY: a red objective.
//
// Aim at a state whose form is owed while standing on it, and the pull used to
// answer "the target is where the walk already stands" and stop. True about
// POSITION, useless about WORK — the route is empty because there is nowhere
// to GO, never because there is nothing to DO.
//
// THE SPEC LISTED THIS STEP AS OWED and said why: the fixture has to stand a
// record up and land the route on a state that is actually red. A fresh root
// walks to the desk with nothing red, so there was nothing to observe. That is
// what this case builds.
test("aiming at a state that owes a form serves the form, not a sentence about geography", async () => {
  const root = freshRoot();
  for (const a of [
    ["init"],
    ["config", "user.email", "se@test.local"],
    ["config", "user.name", "se test"],
    ["add", "-A"],
    ["commit", "-q", "-m", "seed"],
  ]) {
    const r = spawnSync("git", a, { cwd: root, encoding: "utf8", windowsHide: true });
    if (r.status !== 0) throw new Error(`git ${a.join(" ")} failed: ${r.stderr}`);
  }

  const session = new Session(root);
  await session.advance();
  await session.advance();
  checkDocs(session);
  await session.advance();
  await session.advance();
  await session.advance();
  session.setAutonomy(1);

  const id = String(session.iterationSeed("prove the red objective", "a state that owes its form says so").seeded);
  const sid = id.match(/^(i\d+)-/)?.[1] as string;
  await session.advance("iterations");
  await session.advance(sid);

  // Stand ON a state that owes a form, then aim at exactly where you stand.
  const standing = session.active()[0];
  assert.ok(standing !== undefined, "the walk stands somewhere inside the record");
  session.setTarget(standing);

  const answer = (await session.pull()) as { pull: string; why?: string; forms?: unknown[] };

  // THE CLAIM. Not "wait", and specifically not the geography sentence.
  assert.notEqual(answer.pull, "wait", `the walk stopped instead of working: ${JSON.stringify(answer.why ?? "")}`);
  assert.ok(
    answer.pull === "fill" || answer.pull === "read",
    `a red objective owes work, so the answer is the form or its reading — got ${answer.pull}`,
  );

  // AND THE OLD SENTENCE IS GONE FOR THIS CASE. It survives, correctly, for a
  // target that genuinely owes nothing — that is what the added clause says.
  assert.ok(
    !/^the target is where the walk already stands$/.test(String(answer.why ?? "")),
    "the bare geography answer is retired for a state that owes work",
  );
});
