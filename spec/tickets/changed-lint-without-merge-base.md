---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: rules-lint-changed-files-first/gate
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
point: gate
todo: false
step: do
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: lint-without-vale
parent: rules-lint-changed-files-first
record:
  - step: do
    hand: box 09cf21ad3c5d · claude-code-remote
    hash_before: 16ff5e00ae70874aedfbbc25df4e56245e4a65da
    hash_after: 84ac381c72cece10f44e0732a6dafec7c64f10f0
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "   85.8  in all"
    inputs:
      - name: ask
        hash: 8a74a61291a93dcc
        size: 299
    def: 1462c12807ab5533
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

CI's check.yml checks out at depth one with no origin/main ref, so the changed door's merge base with origin/main finds nothing there; the approach names no fallback, and the implement step gives the door one (the files of HEAD's own commit, or an empty list with a line saying so) and a case for it

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/quack/lint_changed_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

CI's checkout at depth one holds no origin/main ref, so a merge base finds nothing there. The changed door in `src/quack/lint_changed.go` now reads the merge base where one stands. Where none stands, it reads the files of HEAD's own commit, and it says so in one line on the error stream. Both roads add the working tree's changes and the new files, and drop a deleted file. `lintHere` wires the door into the lint, so the parent's `--changed` flag reads it. `TestChangedOver` drives both roads over a fake git.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the fallback takes HEAD's own commit, the first road the ask names, and a case drives it
- the cleanup: none shows, and the door reuses the trunk name from the command module
- one place: the trunk's name stays in `src/modules/hooks/command/trunk.go`, and the door points at this ticket

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
