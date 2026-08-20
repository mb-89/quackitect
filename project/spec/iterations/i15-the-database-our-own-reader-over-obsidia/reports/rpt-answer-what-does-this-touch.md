---
spec: tsp-a-structured-query-answers-what-a-decision-touches
story: sty-answer-what-does-this-touch
performed_by: agent
performed_at: 2026-08-19T20:35:00.000Z
---

# Report: an agent asks what a decision touches

## What was run

The procedure from tsp-a-structured-query-answers-what-a-decision-touches,
against the real, built engine, not a mock. The script is
demo-answer-what-does-this-touch.ts in this same folder, run with
node against project/deliverable/engine/query.ts (answerStructuredQuery),
the same function se_query wires to.

The question asked was real: what does the architecture decisions register
hold, and what does one of them touch. The base was
spec/queries/decisions-architecture.base, one of the 26 harvested files.

## What was observed

STEP 2 FAILED ON FIRST RUN, FOR REAL, AND THE FAILURE WAS A BUG. The base
declares its filter (type == adr and kind == architecture) once, above
its views, the documented shape every one of the 26 harvested files uses.
parseBase in engine/tables.ts only ever read a filter nested INSIDE a view,
a shape only the test fixtures use. The document-level filter was silently
dropped, so the query matched the WHOLE VAULT: 1907 rows, not the small
architecture-decisions set the base declares.

THIS IS FIXED, IN THIS SAME PASS. parseBase now falls back to the
document-level filters when a view carries none of its own, and keeps the
view own filters when it has them (see engine/tables.ts, the comment at
parseBase). Two regression tests were added to query.test.ts, pinning both
the fallback and the override. Re-run after the fix: STEP 2 returns 1 row,
the one real architecture decision in this corpus matching the filter
(adr-query-in-engine is filed under a different kind and does not match
this particular view filter, which the query correctly excludes).

STEP 3 PASSED. Asking for a field the view does not carry (decided_in) is
refused by name, listing the legal fields (addresses, name, statement),
SE-C-144, exactly as the story fifth slide describes.

STEP 4 WAS NOT COMPLETED AS WRITTEN. The one matched row carries an
undefined name field: the matching note uses id as its identifier
frontmatter key, not name, and the harvested base view asks for name.
This is not a code defect. The property is genuinely absent on that note,
and Bases renders an absent property as blank rather than refusing. It is a
harvest-content finding: at least one of the 26 harvested .base files
requests a column several of its own matching notes do not populate, which
narrows what follow one returned id to its file can do until a reader
falls back to a field the notes actually carry. Captured as a stray via
se_note rather than fixed here. Changing a harvested file is not this
state job, and the pinned-subset ADR reserves that kind of decision for
its own review.

## What this proves against the story

The agent CAN reach the evaluator with one call now that se_query is wired.
The unknown-field refusal names the field and lists the legal ones, matching
the story own fifth slide. The measured cost is one query and one refusal
check; the fourth step (follow one id to its file) could not complete this
run because of the harvest-content gap above, so the full four-calls-to-one
claim is not fully measured yet. Three of four steps are demonstrated.

## References

- Script: reports/demo-answer-what-does-this-touch.ts (this folder)
- Fix: project/deliverable/engine/tables.ts, parseBase
- Regression tests: project/deliverable/tests/query.test.ts, the two cases
  added after the sort-by-file-name case
- Battery: 1501/1501 green after the fix, preflight green, biome clean
