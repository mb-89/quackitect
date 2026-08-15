---
form: answer-bound
by: agent
signed_off: 2026-08-14T15:53:20.702Z
authors: agent
files:
---

# Evidence form / answer-bound

## current_situation

NO ANSWER LEAVES THE ENGINE ABOVE 60 KB, and an oversized one arrives as its first page plus a cursor rather than as a pointer or a host's silent cut.

THREE EXITS CARRY CONTENT out of mcp.ts, and all three are bounded in ONE shape: the result, the refusal and the error. A test pins that a caller never has to learn three shapes to read one engine.

A POINTER ALONE RECURSED, and the owner caught it. An answer of 350 KB whose pointer said fetch-the-whole-from-the-log produces another 350 KB answer, cut again, forever. The floor held and the caller never got the content.

SO IT PAGES. The first page rides inline. The whole answer spills to .se/answers/<tool>.json, machine-local and never committed. The cursor names se_file_read with an offset and a limit, which is the lane's own paging verb and is bounded by its own limit, so following it cannot recurse.

ONE EXIT CANNOT BE COVERED. tools/list must arrive as a parseable array; paging it would leave the agent with no tools at all. It stays small by keeping descriptions short, and the code says so where somebody would look.

## built

project/deliverable/engine/bound.ts — new. ANSWER_BOUND_BYTES, boundAnswer(), setAnswerSpill().

project/deliverable/engine/mcp.ts — the bound wired at all three exits, and the protocol-level catch truncated with its size named.

project/deliverable/engine/tools.ts — setAnswerSpill(seDir(root)) at buildServer.

project/deliverable/tests/answer-bound.test.ts — 10 cases: the bound exists, a small answer is byte-for-byte, an oversized one fits, its first page is the head of the real answer, the cursor names a paging verb, the spill is the whole answer, and refusals and errors bound in the same shape.

VERDICT: 10 of 10.

## follow_up

THIS IS THE FLOOR AND NOT THE WHOLE FIX. The record's scope asks for both halves: split the sources into sub-indexed chunks AND keep a mechanism that guarantees nothing can overflow whatever the sources look like. No element carries the split yet, and it is named as a hole at gate-architecture.

WHAT TO WATCH AFTER THE NEXT RELOAD. Every pull in this session returned between 280 and 350 KB. They will now arrive as a first page plus a cursor, which changes how the lane feels to drive. If the first page turns out to cut the position or the instruction off, the envelope order in boundAnswer is what to reorder.

THE SPILL IS ONE FILE PER TOOL, overwritten. Disk stays bounded by the number of tools rather than the number of calls, and the newest is always the one a caller wants.

## anything_else

THE ASSERTION CAUGHT ME, and it is worth recording because it is the case that would otherwise have shipped.

My first cut guessed a 4 KB envelope allowance and sliced the body to fit. JSON.stringify then escaped every quote and newline in that body, so a 56 KB slice serialised well past 60 KB. The bounded answer EXCEEDED THE BOUND.

The test that caught it was one line: the serialised text must be no longer than the bound. Without it the mechanism would have looked right, passed its other six cases, and failed exactly when it mattered — on the biggest answers.

IT NOW MEASURES rather than assumes, shrinking the page until the serialised whole actually fits.
