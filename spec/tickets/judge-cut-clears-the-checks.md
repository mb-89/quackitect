---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-judge-leaves-the-code/design/review
    by: anyone
    to: retro
    input: ask
    reads: [[spec/guidance/working]]
    needs: ["branch test"]
    checklist: ["the change follows the ask, or the discussion says why it departs", "the cleanup the change reveals is in the change, or is a note of its own", "every fact the change adds stands in one place, and a note points at the file instead of repeating it"]
    evidence:
      - name: tests
        form: command
        expects: green
        says: the tests that cover the change, or the check where it touches no code
      - name: check
        form: command
        expects: 0
        says: the check is green on the commit
      - name: says
        form: text
        says: what changes and why, for a reader who was not there
step: do
process: [[spec/processes/trivial]]
process_hash: 05e53b89dab63152
group: the-engine-holds-the-route
parent: the-judge-leaves-the-code
record:
  - step: do
    hand: box d7d809305dcf · claude-code-remote
    hash_before: a67c0ebbceb12c01e1a6e9cdee87d86c565ebb9c
    hash_after: 9d486daa467569e0f16fdc50916bcda60ad68696
    answered:
      - name: tests
        exit: 0
        said: green, 19 test(s) pass in 2 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/the-queue-moves-to-plan.md:121:99: Sentence: A sentence holds 25 words. Cut this one in two."
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the ask wants no judge chapter in spec/design_output/pull.md, but the draft cuts only the two subchapters. The checks keeps item 5, the material paragraph, the layer table and the prose-fields paragraph, and each speaks of the judge. The cut takes them too, so the chapter lists the shell checks alone

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/contract/pull-payload.test.js test/contract/paragraph.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The checks chapter of spec/design_output/pull.md now names the four checks the shell runs, and nothing of the judge. The judge item, the material and layer paragraphs, the prose-fields paragraph and the two judge subchapters leave. Nothing links into the subchapters that leave.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

The change follows the ask: the chapter lists the shell checks alone.
The cleanup the change reveals, the answer mark row, leaves with the cut, and the helper list on judge-cut-takes-its-helpers drops it.
The change adds no fact, and the chapter keeps its one sentence on where the checks run.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
