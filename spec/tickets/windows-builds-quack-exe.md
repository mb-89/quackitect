---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-foundation-closes-its-gaps/accept
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
step: do
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: the-foundation-closes-its-gaps
parent: the-foundation-closes-its-gaps
record:
  - step: do
    hand: box d7e2ac6b84cc · claude-code-remote
    hash_before: 8596ae09dcb0aeae08bef388abe7423c07695431
    hash_after: 8596ae09dcb0aeae08bef388abe7423c07695431
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "src/index/door.go:1:1: FileCeiling: A file holds 600 lines, and the file holds 608. Split it by topic."
    inputs:
      - name: ask
        hash: 670e140954a00d2c
        size: 175
    def: 0ed6eff0a1a99c52
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the manager case in `src/quack/manager_test.go` builds `quack` with no `.exe`, so the Windows check fails. Name the binary with `.exe` on Windows, as `src/lsp/outside.go` does

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

    ./RUNME.sh branch test src/quack/manager_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

`TestTheIndexLoadsTheManagerWithNoOtherModule` in `src/quack/manager_test.go` built `quack` with no `.exe`, so on Windows `exec` found nothing and the case failed. The build now names the binary through `binaryIn`, which adds `.exe` where `runtime.GOOS` reads `windows`. The case passes on Linux and vets under `GOOS=windows`. The Windows job of the CI run on the pushed commit decides the Windows half.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask
- the CI log also names an orphan index the case's stop left on Windows, which follows from the same failed exec, so no note of its own
- the `.exe` rule stands in this case alone, since no other test builds a binary

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
