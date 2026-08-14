// THE ANSWER'S BOUND (tsp-answer-bound). Authored test-first at i27's
// author-tests, turned green by the answer-bound chunk.
//
// The driver is a use event rather than a grade. Every pull in the session of
// 2026-08-14 returned between 280 and 350 KB and could not be read, and two
// fills were misdirected as a direct result.
import { strict as assert } from "node:assert";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { ANSWER_BOUND_BYTES, boundAnswer, setAnswerSpill } from "../engine/bound.ts";

const SE = mkdtempSync(join(tmpdir(), "se-bound-"));

/** An answer far past the bound, shaped like the scenario deck that caused it. */
const oversized = (): unknown => ({ rows: Array.from({ length: 20_000 }, (_, i) => `row ${i} of a scenario deck`) });

test("the engine declares a bound for an answer", () => {
  assert.equal(typeof ANSWER_BOUND_BYTES, "number");
  assert.equal(ANSWER_BOUND_BYTES > 0, true, "a bound of zero would send nothing at all");
});

test("an answer within the bound is returned whole", () => {
  const payload = { where: ["iterations/i27/specify-build"], do: "work the state" };
  const answered = boundAnswer("se_pull", payload);
  assert.equal(answered.cut, false, "the bound must not cost the common case anything");
  assert.deepEqual(JSON.parse(answered.text), payload, "a small answer comes back byte for byte");
});

test("the size of the whole answer is reported even when it fits", () => {
  const answered = boundAnswer("se_note", { captured: "note-1" });
  assert.equal(answered.bytes, answered.text.length, "a reader can see the shape of the problem before it bites");
});

test("an oversized answer never exceeds the bound", () => {
  const answered = boundAnswer("se_pull", oversized());
  assert.equal(answered.cut, true);
  assert.equal(answered.text.length <= ANSWER_BOUND_BYTES, true, "the floor is the whole point");
});

test("an oversized answer carries its first page inline, so the caller always sees content", () => {
  const answered = boundAnswer("se_pull", oversized());
  const page = JSON.parse(answered.text);
  assert.equal(typeof page.body, "string");
  assert.equal(page.body.length > 0, true, "a pointer with no content is a wasted round trip");
  assert.equal(page.body.startsWith("{"), true, "the page is the head of the real answer");
  assert.equal(page.page.of, answered.bytes);
});

test("the cursor names a verb that pages, so following it cannot recurse", () => {
  setAnswerSpill(SE);
  const answered = boundAnswer("se_pull", oversized());
  const page = JSON.parse(answered.text);
  assert.equal(page.next.tool, "se_file_read", "se_log_query would return the whole answer and be cut again");
  assert.equal(typeof page.next.args.limit, "number", "a cursor with no limit is the recursion, not the fix");
  assert.equal(page.next.args.path, ".se/answers/se_pull.json");
});

test("the whole answer is on disk where the paged reader can reach it", () => {
  setAnswerSpill(SE);
  const answered = boundAnswer("se_pull", oversized());
  const onDisk = readFileSync(join(SE, "answers", "se_pull.json"), "utf8");
  assert.equal(onDisk.length, answered.bytes, "the spill is the whole answer, not the page");
  const page = JSON.parse(answered.text);
  assert.equal(onDisk.startsWith(page.body), true, "the inline page is the head of the file, so a reader can continue");
});

// ------------------------------------- every exit, not just the happy one
//
// The owner's demand, 2026-08-14: the bound must hold everywhere the engine
// talks to the agent, and be routed through ONE place. mcp.ts has three exits
// that carry content, and these pin all three.

test("a refusal is bounded, because an unreadable refusal hides its own remedy", () => {
  const huge = { clause: "SE-C-112", expected: "x", got: "y".repeat(400_000), remedy: { tool: "se_pull", args: {} } };
  const answered = boundAnswer("se_pull-refused", huge);
  assert.equal(answered.cut, true);
  assert.equal(answered.text.length <= ANSWER_BOUND_BYTES, true);
  const page = JSON.parse(answered.text);
  assert.equal(page.body.includes("SE-C-112"), true, "the clause must survive into the page a reader gets");
});

test("an error is bounded, and it is the worst one to lose because it carries no remedy", () => {
  const answered = boundAnswer("se_run-errored", { kind: "errored", message: "stack".repeat(100_000) });
  assert.equal(answered.cut, true);
  assert.equal(answered.text.length <= ANSWER_BOUND_BYTES, true);
  assert.equal(JSON.parse(answered.text).body.includes("errored"), true);
});

test("the bound is one mechanism, so every exit answers in the same shape", () => {
  const shapes = ["se_pull", "se_pull-refused", "se_run-errored"].map((t) => {
    const page = JSON.parse(boundAnswer(t, { rows: Array.from({ length: 20_000 }, (_, i) => `row ${i}`) }).text);
    return Object.keys(page).sort().join(",");
  });
  assert.equal(new Set(shapes).size, 1, "a caller must not have to learn three shapes to read one engine");
});
