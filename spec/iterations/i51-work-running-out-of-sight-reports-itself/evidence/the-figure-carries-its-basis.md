---
form: the-figure-carries-its-basis
by: agent
signed_off: 2026-08-21T11:16:48.976Z
authors: agent
files: null
---

# Evidence form / the-figure-carries-its-basis

## current_situation

No entry carried a duration, and none carried what a duration would rest on.

BOTH ARRIVE AS ONE VALUE. `timeRemaining` returns the figure and its basis together, so a build cannot drift them apart into two fields that disagree.

THE BASIS IS NEVER ABSENT. An operation with nothing to measure carries no figure and says which of four reasons applies: it has finished, it has no measurable work, its progress cannot be read, or nothing has finished yet.

THE PROJECTION SAYS IT IS NOT DEPENDABLE, in its own words. That is not modesty: measured on this record, a linear projection over-predicted in one run and under-predicted in another.

## built

TWO FILES CHANGED.

`deliverable/engine/run.ts` — `JobView` gains an optional `remaining_ms` and a REQUIRED `basis`. A new `timeRemaining` reads the running work's own progress file, counts the distinct parts finished, and projects linearly against the total. `view` spreads its result onto every entry.

`deliverable/tests/files.test.ts` — the direct-read ceiling goes from 118 to 119, with the same reason as the last raise: machine-local JSONL, no door, no parse of a trace node.

MEASURED, 2026-08-21: all three cases in `tests/work-account.test.ts` pass. `every entry states how much longer it needs and what that figure rests on` was written red at author-tests and is green now. The typechecker is clean and biome checked the file with no fixes.

THE BASIS IS REQUIRED IN THE TYPE, not optional. That is the design decision made structural: a build cannot ship a figure with no basis, because the type will not let it.

## follow_up

`the-account-rides-every-answer` CLOSES THIS STRAND. The account exists and is worth attaching; that chunk decides where.

THE HANDBACK STRAND IS UNTOUCHED AND UNBLOCKED. Its four chunks lean only on the table, which was signed two chunks ago.

ONE THING THE FIGURE STILL CANNOT DO. It projects only for work whose progress is a file of finished parts. A leaving judgment writes no such file yet, so it will carry a basis saying no measurement exists until the handback chunk gives it one.

## anything_else

THE FOUR REASONS FOR HAVING NO FIGURE ARE WORTH READING AS A SET, because each is a different fact about the world.

- `finished` — there is nothing left to wait for.
- `no measurement of comparable work exists` — the kind of work has no countable parts.
- `this work writes no progress that can be read` — it should have, and the file is missing or unreadable.
- `nothing has finished yet of N` — it will have a figure shortly, and does not yet.

A READER ACTS DIFFERENTLY ON EACH. Flattening them to an absent field, which is what the entry did before this chunk, tells them none of it.
