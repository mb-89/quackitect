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
group: the-verbs-run-in-go
step: do
---

# Ask

The box verbs' Go tests pass on Windows, so the PR's Windows check turns green and the group merges.

The fakes join a PATH with a colon and name no PATHEXT, so a Windows drive letter splits apart. One case also writes a raw Windows path into JSON. The Windows check stays red, and the group never merges.

- `go test ./src/quack/` passes on the Windows runner of the PR's check
- `GOOS=windows go test -c ./src/quack/` builds

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

This ticket moves from `box-verbs-run-in-go` to its parent `the-verbs-run-in-go`. Its work landed in pull request 96, and it stayed open on main after its group closed. The pull hands out the leaves of the open group alone, so the parent's branch takes it, passes `do` on that evidence, and closes it before the parent closes.
