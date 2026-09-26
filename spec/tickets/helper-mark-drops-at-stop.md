---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-stop-reads-the-state/design/review
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
parent: the-stop-reads-the-state
record:
  - step: do
    hand: box c28a93a32b71 · claude-code-remote
    hash_before: a6eded9d0d617cf8af1657fc0419fd7eb80ef23c
    hash_after: a6eded9d0d617cf8af1657fc0419fd7eb80ef23c
    answered:
      - name: tests
        exit: 0
        said: green, 38 test(s) pass in 3 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/the-todo-joins-the-queue.md:161:1: CodeSpans: A sentence holds 4 code spans, and this one holds 6. Carry th"
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

a helper's end reaches the server as `classic.Stop` carrying `agentId`, which `helperReports` in `src/bridge/wait.js` reads. `onTurnEnd` in `src/bridge/answer.js` returns at `agentId` before it does anything. Drop the `box.helpers` mark where the helper's end lands, keyed on an id that the spawn event and that end both carry

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

./RUNME.sh test test/level0/stop-helper.test.js test/level0/stop-door.test.js test/contract/stop-rules.test.js

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

A helper's mark drops where its end lands: `helperEnds` in `src/bridge/stop.js` runs at the helper's own `classic.Stop`, under its `agentId`, ahead of `helperReports`. No id stands on both the spawn and that stop, so the mark is a count on `box.helpers`. `helperSpawns` adds one for a spawn in the background. The case a helper's stop takes its mark off, and the stop call's claim falls, in `test/level0/stop-helper.test.js`, holds it. This commit carries the parent's whole change, which its own close names.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change follows the ask, and departs on the key: no shared id stands, so the mark is a count, and `stop.md` says so
- the cleanup: the server's two entries call the mark as plain statements
- the rule stands in `stop.md` under `A helper still runs`

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
