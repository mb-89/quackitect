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
process: [[spec/processes/trivial]]
process_hash: 05e53b89dab63152
group: the-engine-holds-the-route
step: do
record:
  - step: do
    hand: box d7d809305dcf · claude-code-remote
    hash_before: b7b7962e3d7231e27fc277be42586c1f64643068
    hash_after: fed0f554aeac756c10d292bb665e70d1cd0862e1
    answered:
      - name: tests
        exit: 0
        said: green, 8 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/the-queue-moves-to-plan.md:121:99: Sentence: A sentence holds 25 words. Cut this one in two."
reason: done
---

# Ask

The reviewer at a gate reads the question the gate answers, and scopes its attack inside it. Before it clears, it asks whether anything here contradicts what it sees in the phase. [[spec/design_input/level-two#gates]] asks both.

Today `workAnswer` in `src/scripts/pull-chapter.js` prints the `does` of a gate and leaves its `gate` out, so the reviewer guesses the question.

- a pull on a gate prints its `gate` question under the header. A case in `test/level0/pull-chapter.test.js` decides it
- a pull on a gate asks: does anything here contradict what you see in the phase. A case in `test/level0/pull-chapter.test.js` decides it
- a pull on a step carrying no `gate` prints neither. A case in `test/level0/pull-chapter.test.js` decides it
- `./RUNME.sh check` exits 0

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/pull-chapter.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

A pull on a gate now prints the question the gate answers and the question the reviewer asks before it clears. BEFORE_CLEAR in src/scripts/pull-chapter.js owns the second, and the gate chapter of spec/design_output/pull.md points at it. Three cases in test/level0/pull-chapter.test.js cover a gate and a plain step.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask line by line
the formatter reflow the fix verb writes over the tree stays out of the change
BEFORE_CLEAR stands in pull-chapter.js alone, and the design note points at it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
