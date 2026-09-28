---
kind: [[ticket]]
state: open
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
group: boxes-keep-their-own-tickets
step: do
---

# Ask

A ticket a box mints on its branch, a question, a finding or a fix, joins the group the box works, and the group reaches done once every child closes. Only work a person alone can do, a trial on the owner's machine, a secret, a setting on GitHub or claude.ai, leaves the group loose on main. That is the owner's ruling: "If a box opens a ticket that it can solve itself, it assigns it to its own group. And then it can't finish until it fixed all its items."

Without it `branch done` files every open child loose on main, and a box hands its own agent work back to the queue unfinished.

- `./RUNME.sh test test/level0/unblock.test.js` passes, with a case where the mint on a work branch names the branch's group
- `./RUNME.sh test test/level0/work-done.test.js` passes, with a case where `branch done` refuses while an agent child stands open, and a case where a person-only child leaves loose
- `./RUNME.sh check` passes

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
