---
minted_in: i12
id: req-answer-pages-never-overflows
type: "[[requirement]]"
statement: If an answer exceeds the response bound, then the engine shall serve a first page and name the cursor that walks the rest.
kind: functional
verify_method: test
breaks_if_removed: A host moves the oversized answer to disk and hands back its head, so the agent works from a truncated result without being told which part is missing.
breaks_how_badly: crippling
refines:
  - uc-take-a-step
source_refs:
  - vp-rigor-without-toil
  - i12
priority: must
---

## Detail

The demand has two halves and both bind.

- NOTHING IS CUT. The whole answer stays reachable.
  - A page is a window onto it.
  - A page is never a shorter version of it.
- THE CURSOR IS NAMED IN THE ANSWER. The reader is told the call that
  fetches the next page.

WHY CUTTING IS WORSE THAN WAITING. A slow answer announces itself. A cut
answer does not, and nothing in it says what went missing.

## What stands today

The bound is live and it works. This record's own kickoff answer came
back at 259015 bytes against a bound of 60000, and it carried three
things.

- `page`, saying which window arrived.
- `next`, naming `se_file_read` with its offset and limit.
- a note saying the whole answer is on disk.

So the row is met at the pull. It is written because the demand had no
node, and a demand with no node is a promise nothing shows.

## What is not covered here

The SIZE of the answer is a separate concern from whether it pages. A
234KB form that pages correctly still costs the reader eight page reads.
That is a design question for the record's build, not a second clause on
this row.
