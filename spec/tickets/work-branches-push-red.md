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
step: do
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

An agent pushes its work branch while its check stands red, where CI guards the tree. The pull request still takes a green CI run before it merges, and the push to main still takes the green stamp. So red work leaves the box every half hour, and a box that stops mid-change loses nothing.

The gate on every branch kept work inside the box for hours at a time. A box that stopped while red took its commits with it, and the gate added nothing CI does not already hold.

- `./RUNME.sh test test/level0/prepush.test.js` passes a case where an agent pushes a red work branch under CI
- the same file passes a case where an agent's red push to main still comes back refused
- `./RUNME.sh check` exits 0

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/prepush.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The pre-push hook held every branch an agent pushed to the green stamp. A box mid-change stands red, so its work stayed on the box for hours. A box that stopped while red lost its commits when the coordinator archived it.

Now `holds` skips the stamp for work branches where `.github/workflows/check.yml` stands. The pull request takes a green CI run before auto-merge lands it, so red work reaches main nowhere. A push to main still takes the green stamp, and a cloud box still pushes main nowhere.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the agent gate reads ciGuards, and the trunk gate stands as it was
- the cleanup it reveals: none
- every fact stands once: the workflow path lives in `CI` in prepush.js

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
