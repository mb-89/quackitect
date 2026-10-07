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
group: lint-without-vale
parent: lint-without-vale
step: do
---

# Ask

The files main brings in pass the Go lint. The Problems panel outside the tickets folders then stands clear.

Without it the push waits on these warnings, and every hand meets them again.

- `./RUNME.sh lint` names no warning in `.claude/skills/level0/lib/index-tools.js`.
- `./RUNME.sh lint` names no warning in `src/quack/runme_test.go` or `src/quack/verb_mint_test.go`.
- `./RUNME.sh lint` names no warning in `test/level0/index-tools.test.js`.
- `./RUNME.sh check` exits 0.

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
