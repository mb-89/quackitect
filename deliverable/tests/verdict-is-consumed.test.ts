// A VERDICT NOBODY CAN CONSUME IS NOT A VERDICT.
//
// A state the walk LANDS on re-judges on every attempt, and that is right: the
// walk may have edited something, and the judgment is about to be relied on.
//
// WHAT IT COST. Each pull started a judgment, answered before it finished, and
// the next pull threw that answer away and started another. The verdict landed
// every time and was consumed never, so the step reported `deciding` for as
// long as anyone kept pulling. Measured at one verification whose battery runs
// 128 seconds and whose recorded verdict already said passed: five pulls, five
// full runs, and the walk never moved.
//
// THE GUARD IS THE WRITE COUNT. Re-judging exists because the walk may have
// edited. Where nothing has been written, there is nothing new to judge. The
// moment anything is written the count moves, and the next attempt runs for
// real — so a green verdict can never stand over an edit.
//
// A SHELL COMMAND COUNTS AS A WRITE TO EVERYTHING, because the lane cannot see
// what it touched. That is the fail-safe direction: a spurious bump costs one
// re-run, a missed one would let a stale pass stand.
import { strict as assert } from "node:assert";
import { describe, test } from "node:test";
import { forgetPath, noteWrite, withPass, writeEpoch } from "../engine/notes.ts";

describe("the write count separates a live verdict from an overtaken one", { concurrency: false }, () => {
  test("nothing moves it but a write", () => {
    const before = writeEpoch();

    // A pass is an operation OPENING, not an edit. It moves the derived
    // counter, and it must not move this one — every pull opens a pass, so a
    // shared counter would read as a change on every single call.
    withPass(() => writeEpoch());
    withPass(() => withPass(() => writeEpoch()));

    assert.equal(writeEpoch(), before, "opening an operation is not writing");
  });

  test("a write through the door moves it", () => {
    const before = writeEpoch();

    forgetPath("some/file/the/lane/just/wrote.md");

    assert.equal(writeEpoch(), before + 1, "the door tells it, rather than it discovering");
  });

  test("a command the lane cannot see into moves it too", () => {
    const before = writeEpoch();

    noteWrite();

    assert.equal(writeEpoch(), before + 1, "a shell may touch anything, so it counts as touching everything");
  });

  // IT ONLY EVER GOES UP. A count that could fall would let an old verdict
  // match a newer tree, which is the whole failure this guards.
  test("it never falls", () => {
    const seen = [writeEpoch()];
    noteWrite();
    seen.push(writeEpoch());
    forgetPath("another/file.md");
    seen.push(writeEpoch());

    for (let i = 1; i < seen.length; i++) assert.ok(seen[i] > seen[i - 1], "each step is strictly later than the last");
  });
});

// THE SEAM ITSELF: the launcher reads the count, and the run records it.
describe("the launcher honours a verdict it can still trust", { concurrency: true }, () => {
  test("a landing hop consults the fresh verdict, and the run records the count", async () => {
    const src = await import("node:fs").then((fs) => fs.readFileSync(new URL("../engine/sessionscript.ts", import.meta.url), "utf8"));

    assert.match(src, /freshVerdict\.set\(key, \{ ok, stamp: result\.stamp, writes: writeEpoch\(\) \}\)/, "the run records what it judged");
    // THE ORDER IS THE WHOLE OF IT. Recording the verdict WRITES the form, so a
    // count taken before that write is stale by one and never matches again.
    const recordAt = src.indexOf("this.host.recordVerdict(machine, s, ok, result.stamp)");
    const stampAt = src.indexOf("this.freshVerdict.set(key, { ok, stamp: result.stamp");
    assert.ok(recordAt > 0 && stampAt > 0, "both lines stand");
    assert.ok(stampAt > recordAt, "the count is taken AFTER the verdict's own write, never before it");
    // THE FORMATTER OWNS THE LINE BREAKS, so each condition is matched on its
    // own rather than as one run of text.
    assert.match(src, /landedFresh\?\.ok === true/, "a later attempt honours only a PASS");
    assert.match(src, /landedFresh\.writes === writeEpoch\(\)/, "and only while nothing has been written since");
    assert.match(src, /landedFresh\.stamp === this\.scriptStamp\(scripts\)/, "and only about the same scripts");
    assert.match(src, /!passingThrough,?\s/, "the skip is for the LANDING hop — passing through has its own, older path");
  });
});
