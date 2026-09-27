---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-todo-joins-the-queue/design/review
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
parent: the-todo-joins-the-queue
record:
  - step: do
    hand: box c28a93a32b71 · claude-code-remote
    hash_before: 08a1ed65af8927cee7b8595dad122b9c931386a3
    hash_after: 08a1ed65af8927cee7b8595dad122b9c931386a3
    answered:
      - name: tests
        exit: 0
        said: green, 22 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/the-todo-road-stands-first.md:39:1: Sentence: A sentence holds 25 words. Cut this one in two."
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

`plansHere` in `src/bridge/plan.js` reads the plan already, and `PLANS` stands in `.claude/skills/level0/lib/runs.js`, so `inHand` calls `plansHere` and reads no second copy

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

./RUNME.sh test test/level0/named.test.js

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

`inHand` reads the plan's `working` todo off `PLANS` in `.claude/skills/level0/lib/runs.js`, the path the review names. It departs from `plansHere` in `src/bridge/plan.js`: `src/engine/named.js` serves the commit verb and the pull too. An import there pulls the bridge, git and the queue reader into every script. The read is one parse of one file, and `PLANS` stands as the one owner of the path.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change follows the ask on the path, and says why it departs on `plansHere`
- the cleanup: none stands
- the path stands in `lib/runs.js` once, and both readers import it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
