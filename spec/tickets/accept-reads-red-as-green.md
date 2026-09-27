---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: anyone
    by: anyone
    to: retro
    input: ask
    tags: ["code", "testing"]
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
urgent: true
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
step: do
record:
  - step: do
    hand: box d6f05e3a585030 · claude-code
    hash_before: 4c1e65b584fa01839c9ae3d17863c20b4fc684c5
    hash_after: 4c1e65b584fa01839c9ae3d17863c20b4fc684c5
    answered:
      - name: tests
        exit: 0
        said: green, 12 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/the-queue-views-agree.md:265:115: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: f5eeebc90c59b4ee
        size: 667
    def: df12650931d480c9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

A final gate reruns the red pass and expects its cases green, so a standard-route ticket passes its acceptance. The rerun then proves the red cases now pass.

Without it, `routeRun` in `src/scripts/pull.js` reruns the `tests` field under `design/tests-red` expecting `assertion`. The green that `implement/tests-green` made refuses it. So every standard-route accept refuses, and `holds-leave-with-their-ticket` stands stuck there.

- a case in `test/level0/pull-accept.test.js` passes a final gate over a red field that runs green
- a case there refuses a final gate over a red field that still fails
- `./RUNME.sh test test/level0/pull-accept.test.js` answers green

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/pull-accept.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

A final gate reruns every command field of the route. A red pass among them now reruns expecting `green` in place of `assertion`, because the green pass after it turns those cases green. So a standard-route ticket passes its acceptance again, and the rerun proves the red cases pass. The row stands in the final acceptance chapter of `spec/design_output/pull.md`.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: two cases in test/level0/pull-accept.test.js hold the pass and the refusal, and the file answers green
- the change reveals one cleanup, the note accept-reruns-the-red-tests, which the retro closes onto this ticket
- the fact stands once, in the final acceptance table of spec/design_output/pull.md, and the code points there

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
