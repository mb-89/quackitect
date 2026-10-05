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
group: the-verbs-run-in-go
step: do
record:
  - step: do
    hand: box b87e97900f8f · claude-code-remote
    hash_before: f0828caacbfd7fc93a3b9c65e10aa8bceef35de2
    hash_after: f0828caacbfd7fc93a3b9c65e10aa8bceef35de2
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "    2.1  test/contract/vale-paths.test.js a rationale reads the same by its absolute path as by its relative one"
    inputs:
      - name: ask
        hash: bfb6a9e0f3734e47
        size: 426
    def: df12650931d480c9
reason: done
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

./RUNME.sh branch test src/quack/box_verbs_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The work landed in pull request 96, and this ticket stayed open on main after its group closed. Commit 2dbc261 joins PATH and writes paths in the box verb tests the way a Windows box reads them. Commit 29d2b6b makes the hook row read one way on every box. Commits f29bb3a and 15e5529 make a tree read as itself whichever slash spells its roots. Commit ebb440a takes main in. The `check (windows-latest)` job ran green on the head of pull request 96 (job 111488208212 of run 37219991884), and auto-merge took it into main as 1fed04e0b. `cd src && GOOS=windows go test -c ./quack/` builds on this branch. This close changes no code.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: both done lines hold, on the job and the build named in says
- the cleanup: pull request 96 carried it, and this close adds none
- one place: the evidence points at the commits and the job, and repeats no code

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

This ticket moves from `box-verbs-run-in-go` to its parent `the-verbs-run-in-go`. Its work landed in pull request 96, and it stayed open on main after its group closed. The pull hands out the leaves of the open group alone, so the parent's branch takes it, passes `do` on that evidence, and closes it before the parent closes.
