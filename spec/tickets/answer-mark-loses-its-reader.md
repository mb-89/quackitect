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
    hash_before: e3c220db233a45341816e2ce00c78df2b0035b6a
    hash_after: 8a867c70c7465cfc5562b94499354f6eedbd6ae8
    answered:
      - name: tests
        exit: 0
        said: green, 27 test(s) pass in 2 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/the-queue-moves-to-plan.md:121:99: Sentence: A sentence holds 25 words. Cut this one in two."
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

forEvidence is the one reader that acts on the answer mark, so the cut leaves the mark with no reader past the stripping. The mark stands in spec/schemas/guidance.schema.yaml, and its comment names the judge of pull.md. Decide whether the mark stays, and rewrite that comment either way

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/guidance.test.js test/contract/guidance-rules.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The answer mark stays. While forEvidence stands, it keeps the two answer rules of voice.md out of the judge's material, and the contract test in test/contract/guidance-rules.test.js holds that. The schema comment now names forEvidence as the reader, in place of the judge chapter of pull.md that the cut removes. The mark, its schema key and its two uses in voice.md leave beside forEvidence, and the Discussion of judge-cut-takes-its-helpers lists them.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

The change follows the ask: it decides the mark stays, and rewrites the comment.
The cleanup the change reveals, the mark's own removal, stands as a list on judge-cut-takes-its-helpers.
The comment points at forEvidence and the ticket, and copies no fact from them.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
