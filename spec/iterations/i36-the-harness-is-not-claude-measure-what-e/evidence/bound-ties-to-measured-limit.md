---
form: bound-ties-to-measured-limit
by: agent
signed_off: 2026-08-19T16:38:14.921Z
authors: agent
files: null
---

# Evidence form / bound-ties-to-measured-limit

## current_situation

The bound was the literal 6,000, tied to nothing. Its comment said it was chosen under the smallest host limit observed biting, but no code connected the two, so a remeasurement would have left the number where it was.

spec/harness-portability.md still describes the bound as 60,000, which is what that drift looks like from outside.

AND THE CURSOR WAS NOT ACTUALLY PASSABLE. Nine cases in mcp.test.ts failed with `spill read failed ... SE-C-040` — the narration toll refusing the paging read with "22 calls since the last". The lane withheld an answer, handed back the exact call that fetches the rest, and then refused that call.

walking.md already rules that the reading loop pays nothing, because the machine forced the hop and no judgment happened on it. Following a spill cursor is the same shape and was not covered.

## built

Two files.

project/deliverable/engine/bound.ts. `ANSWER_BOUND_BYTES` is now DERIVED: `Math.min(OWN_CEILING, smallestInlineOutputBytes() ?? OWN_CEILING)`, where OWN_CEILING is the 6,000 the requirement names. The value is unchanged today because 6,000 is already tighter than the smallest measured host limit of 20,480. What changed is that measuring a host tighter than 6,000 now lowers the bound by itself, which a hand-written number could never do.

project/deliverable/engine/toll.ts. `isReadingHop` now also returns true for an `se_file_read` whose path starts `.se/answers/`. Following the lane's own cursor is the engine's instruction being obeyed, not work to narrate.

WHY THAT SECOND CHANGE BELONGS HERE. The requirement is that an oversized result stays RECOVERABLE. A toll that refuses the paging read makes the only route to the withheld result impassable, so the bound would be withholding answers it then refuses to hand back.

TESTS. Two new cases in answer-bound.test.ts:

- the bound is derived from the measured hosts, never written by hand. It asserts the bound is at or under the smallest measured limit, so the two can never drift apart.
- paging the cursor to exhaustion rebuilds the original answer byte for byte. It walks the spill exactly as the cursor instructs, then asserts both the length and that the concatenation parses back into the original payload.

Run on 2026-08-19 over answer-bound.test.ts, harness.test.ts, narration.test.ts and toll-reading.test.ts: 31 passed, 0 failed. Both standing toll batteries still pass with the new exemption in place.

## follow_up

BYTE EQUALITY IS PROVEN OVER THE SPILL FILE, not over a live transport. The new case reads the spill and pages it exactly as the cursor instructs, which exercises the arithmetic and the cursor's own arguments. It does not exercise a host actually making those calls.

THE 20,480 IS A DOCUMENTED THRESHOLD, NOT ONE WE MEASURED. It comes from GitHub's own documentation of COPILOT_LARGE_OUTPUT_THRESHOLD_BYTES, recorded in the 2026-08-18 scan. VS Code remains unmeasured entirely, so the smallest is currently the only host with a number.

THE PORTABILITY SPEC IS STALE. It says the bound is 60,000. It is 6,000, and now derived. That document is not this chunk's to edit but it will mislead the next reader.

## anything_else

