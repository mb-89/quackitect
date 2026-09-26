---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: answers-read-the-last-text/design/review
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
group: the-gates-read-the-state
parent: answers-read-the-last-text
record:
  - step: do
    hand: box c28a93a32b71 · claude-code-remote
    hash_before: 433504b0d6f9fcd754a715999dc3bf25b965e941
    hash_after: 433504b0d6f9fcd754a715999dc3bf25b965e941
    answered:
      - name: tests
        exit: 0
        said: green, 47 test(s) pass in 2 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/the-todo-joins-the-queue.md:161:1: CodeSpans: A sentence holds 4 code spans, and this one holds 6. Carry th"
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the callers list misses `readsCompaction` in `src/scripts/probe.js`, which reads `Object.values(HEARD)` and so takes `HEARD.again`, and the case "an owner row opening on the warning line reads as the same owner row" in `test/level0/answer.test.js`, which calls `answersIn`. Both hold under the change, and the builder names them

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

./RUNME.sh test test/level0/probe.test.js test/level0/answer.test.js

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

Both readers hold under the change, and a case holds each.

- `readsCompaction` in `src/scripts/probe.js` takes `HEARD.again` among its sayings. The repeat lands only once the line stands paid, so the first saying after a compaction still decides. A new case in `test/level0/probe.test.js` drives a repeat after the paying line
- the case an owner row opening on the warning line reads as the same owner row, in `test/level0/answer.test.js`, calls `answersIn` and passes unchanged

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change follows the ask: it names both readers, and a case holds each
- the cleanup: none stands
- the readers stand named in this ticket alone

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
