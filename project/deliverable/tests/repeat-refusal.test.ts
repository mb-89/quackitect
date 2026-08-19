// THE THIRD IDENTICAL REFUSAL SAYS IT IS THE THIRD.
//
// MEASURED ON THE i15 WALK: se_file_move was refused 27 times with SE-C-110,
// the whole burst inside NINE SECONDS. The tool was not legal in that state
// and never became legal, so the twenty-seventh answer was word for word the
// first. Nothing counted it.
//
// THE TWO GUARDS THAT EXIST MEASURE SOMETHING ELSE. The toll counts silence;
// the stall guard counts updates since anything closed. Both were satisfied
// throughout — the walk was narrating and the walk was busy. It was busy
// asking one question that had already been answered.
import { strict as assert } from "node:assert";
import { test } from "node:test";
import { RepeatWatch } from "../engine/repeat.ts";

test("the first two identical refusals say nothing — a retry is not a loop", () => {
  const w = new RepeatWatch();
  assert.equal(w.refused("se_file_move", "SE-C-110"), undefined);
  assert.equal(w.refused("se_file_move", "SE-C-110"), undefined);
});

test("the third says how many times, and that the remedy is not landing", () => {
  const w = new RepeatWatch();
  w.refused("se_file_move", "SE-C-110");
  w.refused("se_file_move", "SE-C-110");
  const n = w.refused("se_file_move", "SE-C-110");
  assert.ok(n !== undefined, "the third identical refusal is still silent");
  assert.equal(n.count, 3);
  assert.match(n.do, /3 times in a row/, `the answer does not say how many: "${n.do}"`);
  assert.match(n.do, /REMEDY IS NOT LANDING/, `the answer does not say the remedy failed: "${n.do}"`);
});

test("a different clause on the same tool is a different question, not a repeat", () => {
  const w = new RepeatWatch();
  w.refused("se_file_move", "SE-C-110");
  w.refused("se_file_move", "SE-C-110");
  assert.equal(w.refused("se_file_move", "SE-C-046"), undefined, "two different refusals were counted as one repeat");
});

test("the same clause on a different tool is a different question too", () => {
  const w = new RepeatWatch();
  w.refused("se_file_move", "SE-C-110");
  w.refused("se_file_move", "SE-C-110");
  assert.equal(w.refused("se_pull", "SE-C-110"), undefined);
});

test("a call that gets through clears it — the walk moved", () => {
  const w = new RepeatWatch();
  w.refused("se_file_move", "SE-C-110");
  w.refused("se_file_move", "SE-C-110");
  w.passed();
  assert.equal(w.refused("se_file_move", "SE-C-110"), undefined, "a refusal after real work counts as a continued loop");
});

test("at five it stops saying read-it-again and names the two ways out", () => {
  const w = new RepeatWatch();
  let n: ReturnType<RepeatWatch["refused"]>;
  for (let i = 0; i < 5; i++) n = w.refused("se_file_move", "SE-C-110");
  assert.ok(n !== undefined);
  assert.equal(n.count, 5);
  assert.match(n.do, /STOP REPEATING IT/, `the fifth still advises another attempt: "${n.do}"`);
  assert.match(n.do, /escape/, `the answer does not name the escape hatch: "${n.do}"`);
  assert.doesNotMatch(n.do, /Read the clause itself/, "the fifth repeats the third's advice, which is the advice that failed");
});

test("the 27-call burst that motivated this would have been told at call three", () => {
  // The exact shape from the log: one tool, one clause, nothing in between.
  const w = new RepeatWatch();
  const said: number[] = [];
  for (let i = 1; i <= 27; i++) {
    const n = w.refused("se_file_move", "SE-C-110");
    if (n !== undefined) said.push(n.count);
  }
  assert.equal(said[0], 3, "the burst runs further than two calls before anything is said");
  assert.equal(said.at(-1), 27, "the count stops climbing, so a long loop reads like a short one");
});

// AND THE NOTE REACHES THE ANSWER, through the one place every refusal is
// serialised. A counter nothing reads is not a guard.
test("a refusal served three times carries the repeat note", async () => {
  const { spawnSync } = await import("node:child_process");
  const { bootedServer, call, freshRoot, gitInit } = await import("./helpers.ts");
  const root = freshRoot();
  gitInit(root);
  spawnSync("git", ["add", "-A"], { cwd: root, encoding: "utf8" });
  spawnSync("git", ["-c", "user.name=t", "-c", "user.email=t@t", "commit", "-q", "-m", "f"], { cwd: root, encoding: "utf8" });
  const server = await bootedServer(root);

  // One call that cannot succeed, sent unchanged. A read of a path that is
  // not there is refused the same way every time, which is the shape.
  const bad = { path: "project/there-is-no-such-file-here.md" };
  const one = (await call(server, "se_file_read", bad)).body as { kind?: string; repeated?: unknown };
  if (one.kind !== "rejected") return; // the fixture served it; nothing to repeat
  assert.equal(one.repeated, undefined, "the first refusal already claims to be a repeat");
  await call(server, "se_file_read", bad);
  const three = (await call(server, "se_file_read", bad)).body as { repeated?: { count?: number; do?: string } };
  assert.ok(three.repeated !== undefined, "the third identical refusal says nothing about being the third");
  assert.equal(three.repeated.count, 3);
  assert.match(String(three.repeated.do), /REMEDY IS NOT LANDING/);
});
