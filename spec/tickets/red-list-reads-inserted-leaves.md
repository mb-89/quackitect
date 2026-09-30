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
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: open-tasks-switch-lands
group: open-tasks-switch-lands
step: do
record:
  - step: do
    hand: box d81f28f032e0 · claude-code-remote
    hash_before: e206dfab0ea888d33c1a92bb5813d44cbbbedd56
    hash_after: e206dfab0ea888d33c1a92bb5813d44cbbbedd56
    answered:
      - name: tests
        exit: 0
        said: green, 4 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/vale-ls-windows-trial.md:41:1: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: da7a03913c54e00f
        size: 562
    def: df12650931d480c9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

The check leaves out the tests an inserted red leaf names. A second design round then keeps its red cases and a green check.

Without it, `expectedRed` in `src/scripts/red-list.js` reads the leaf named `tests-red` alone. A `tests-red-2` leaf that a reject inserts reads nothing. The check then answers red while the ticket stands between its red and green steps.

- a case in `test/level0/red-list.test.js` holds a `tests-red-2` leaf's files to the red list
- `./RUNME.sh check` exits 0 on `work/open-tasks-switch-lands` while the badge ticket stands at its gate

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/red-list.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The check sets aside the tests an open ticket names red between its red and green steps. It read the leaf named tests-red alone. A gate reject inserts a second round, tests-red-2, and that list read nothing, so the check went red on a ticket standing where red is expected. expectedRed in src/scripts/red-list.js now reads every leaf named tests-red or tests-red with a round number. A case in test/level0/red-list.test.js holds a tests-red-2 list to the red list.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: one pattern in expectedRed, and the case first, red on its own assertion
- the cleanup it reveals: a helper spawned for a gate meets the parent plan todo and the queue binding, and a note parks it
- every fact stands once: the pattern builds on RED, and names no second spelling

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
