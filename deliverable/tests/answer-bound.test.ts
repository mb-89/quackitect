// THE ANSWER'S BOUND (tsp-answer-bound). Authored test-first at i27's
// author-tests, turned green by the answer-bound chunk.
//
// The driver is a use event rather than a grade. Every pull in the session of
// 2026-08-14 returned between 280 and 350 KB and could not be read, and two
// fills were misdirected as a direct result.
import { strict as assert } from "node:assert";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { ANSWER_BOUND_BYTES, boundAnswer, SPILL_PAGE_CHARS, setAnswerSpill } from "../engine/bound.ts";
import { smallestInlineOutputBytes } from "../engine/harness.ts";

const SE = mkdtempSync(join(tmpdir(), "se-bound-"));

/** An answer far past the bound, shaped like the scenario deck that caused it. */
const oversized = (): unknown => ({ rows: Array.from({ length: 20_000 }, (_, i) => `row ${i} of a scenario deck`) });

// THE BOUND BELONGS TO THE MACHINE IT RUNS ON (owner ruling). A box that cuts
// at twenty thousand should cut there, and one that carries fifty thousand
// should carry fifty thousand. The figure below is the STARTING POINT for a
// machine nobody has climbed a ladder on, not a ceiling for everybody.
//
// THE TRADEOFF, STATED RATHER THAN HIDDEN. This assertion used to demand 6,000
// or less, because one host was seen offloading at 8 KB. An unmeasured host
// that behaves that way will now offload until somebody measures it, and the
// ladder in guidance/method/boot.md is the answer: a host writing an answer to
// disk is the trigger to climb, once.
test("the engine declares a bound for an answer", () => {
  assert.equal(typeof ANSWER_BOUND_BYTES, "number");
  assert.equal(ANSWER_BOUND_BYTES > 0, true, "a bound of zero would send nothing at all");
  assert.equal(ANSWER_BOUND_BYTES, 20_000, "the starting point for a machine nobody has measured");
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
  assert.equal(page.next.args.char_offset, 0);
  assert.equal(page.next.args.char_limit, SPILL_PAGE_CHARS, "character paging survives one huge escaped JSON line");
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

test("a caller's own spill directory wins over the module's, so two roots cannot collide", () => {
  // The module global points at SE, as the last server to build would leave it.
  setAnswerSpill(SE);
  const mine = mkdtempSync(join(tmpdir(), "se-spill-"));
  const answered = boundAnswer("se_pull", oversized(), mine);
  const onDisk = readFileSync(join(mine, "answers", "se_pull.json"), "utf8");
  assert.equal(onDisk.length, answered.bytes, "the spill landed under the caller's root, not the global one");
});

test("the bound is derived from the measured hosts, never written by hand", () => {
  const smallest = smallestInlineOutputBytes();
  assert.notEqual(smallest, undefined, "at least one host must be measured for the bound to mean anything");
  assert.ok(ANSWER_BOUND_BYTES <= (smallest ?? 0), "the bound must fire before the tightest host cuts");
});

test("paging the cursor to exhaustion rebuilds the original answer byte for byte", () => {
  setAnswerSpill(SE);
  const payload = oversized();
  const answered = boundAnswer("se_pull", payload);
  const page = JSON.parse(answered.text);
  const whole = readFileSync(join(SE, "answers", "se_pull.json"), "utf8");

  // Walk it exactly as the cursor instructs, a page at a time.
  let rebuilt = "";
  let offset = page.next.args.char_offset as number;
  const limit = page.next.args.char_limit as number;
  while (offset < whole.length) {
    rebuilt += whole.slice(offset, offset + limit);
    offset += limit;
  }
  assert.equal(rebuilt.length, answered.bytes, "every byte of the original came back");
  assert.deepEqual(JSON.parse(rebuilt), payload, "and it parses as the answer that was withheld");
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

// THE PAGE THE CURSOR SUGGESTS WAS A LITERAL 3,000 AND NOBODY HAD MEASURED IT.
//
// 40% of all lane calls in one measured session were paging spilled answers
// back — 6,433 of 16,157 — and a 22 KB answer cost eight round trips.
//
// RAISING IT WAS REFUSED FOR THE RIGHT REASON AND THE WRONG NUMBER. The worry
// was escaping: a slice comes back inside a JSON envelope and every quote and
// newline is escaped again, so the belief was that 3,000 could serialise near
// 6,000. Measured on the text that actually spills — an already-serialised
// answer, sliced and serialised a second time — it costs 1.066, not 2. The real
// constraint was an envelope ALLOWANCE of 2,500 against a measured envelope of
// 162 characters.
//
// THIS CASE MEASURES rather than asserting a number, because a number typed
// into a test is the same mistake one layer along.
test("the suggested spill page keeps a read's own answer inside the bound", async () => {
  const { SPILL_PAGE_CHARS } = await import("../engine/bound.ts");
  const { fileRead } = await import("../engine/files.ts");

  // THE PAGE IS SIZED ON THE MEASURED COST, NOT THE WORST CASE (2026-08-23).
  // Sizing on 2 made the page less than half of what fits, so every reading
  // loop paid about twice the calls it needed — boot's four documents cost
  // about 29 page reads instead of about 14.
  //
  // WHAT MAKES THE OPTIMISM SAFE is not a bigger margin. characterRead
  // serialises its own answer and shrinks the slice until it fits, reporting
  // what actually came back in char_range.to. The cases below are the proof:
  // they push the densest real shapes through fileRead and check the answer
  // stayed inside the bound.
  assert.ok(SPILL_PAGE_CHARS < ANSWER_BOUND_BYTES, "the page cannot exceed the bound it is derived from");

  const root = mkdtempSync(join(tmpdir(), "spill-page-"));
  // Two shapes that really spill: quote-dense records, and long source lines.
  // Both are written ALREADY SERIALISED, which is what a spill file holds.
  const dense = JSON.stringify(
    { notes: Array.from({ length: 300 }, (_, i) => ({ id: `n-${i}`, body: 'a "quoted" line\nwith breaks\tand tabs' })) },
    null,
    1,
  );
  const source = JSON.stringify({ content: readFileSync(new URL("../engine/bound.ts", import.meta.url), "utf8") }, null, 1);

  for (const [name, body] of [
    ["dense", dense],
    ["source", source],
  ]) {
    writeFileSync(join(root, `${name}.json`), body, "utf8");
    let worst = 0;
    for (let off = 0; off + SPILL_PAGE_CHARS <= body.length; off += SPILL_PAGE_CHARS) {
      const r = fileRead(root, `${name}.json`, { charOffset: off, charLimit: SPILL_PAGE_CHARS });
      worst = Math.max(worst, JSON.stringify(r, null, 1).length);
    }
    assert.ok(
      worst <= ANSWER_BOUND_BYTES,
      `a ${name} page of ${SPILL_PAGE_CHARS} serialised to ${worst}, over the ${ANSWER_BOUND_BYTES} bound — the derivation is wrong`,
    );
  }
  rmSync(root, { recursive: true, force: true });
});

test("the cap probe records into the machine-state folder, not beside it", () => {
  // MEASURED. The handler passed `rootOf(".se")` — the PROJECT ROOT —
  // to a pair of functions whose parameter is the `.se` folder itself. The probe
  // answered `recorded: 38000`, the file landed untracked at the top of the
  // repository, and the bound never moved.
  //
  // A MEASUREMENT THAT REPORTS SUCCESS AND CHANGES NOTHING is the worst shape a
  // bug can take, because the agent stops looking. Nothing else in the engine
  // would have caught it: both sides of the read/write pair agree with each
  // other, so only the call site is wrong.
  const src = readFileSync(new URL("../engine/tools-run.ts", import.meta.url), "utf8");
  const start = src.indexOf('name: "se_probe_cap"');
  assert.ok(start > 0, "se_probe_cap is still a tool");
  const block = src.slice(start, src.indexOf('name: "se_run"', start));
  const folder = /const (\w+) = seDir\(/.exec(block);
  assert.ok(folder, "the probe derives the machine-state folder with seDir");
  for (const verb of ["recordHostCap", "hostCapState"]) {
    const call = new RegExp(`${verb}\\((\\w+)`).exec(block);
    assert.ok(call, `se_probe_cap still calls ${verb}`);
    assert.equal(call[1], folder[1], `${verb} must be handed the machine-state folder, and it got ${call[1]}`);
  }
});
