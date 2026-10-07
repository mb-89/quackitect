---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-testing-rules-name-the-doors/gate
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
group: tests-meet-the-doors-once
parent: the-testing-rules-name-the-doors
record:
  - step: do
    hand: box e97c7a20bbd2 · claude-code-remote
    hash_before: 1e7cbd19994b906f007dff6525d461b5f9e01f1d
    hash_after: 1e7cbd19994b906f007dff6525d461b5f9e01f1d
    answered:
      - name: tests
        exit: 0
        said: green, src/imports passes
      - name: check
        exit: 0
        said: "  109.6  in all"
    inputs:
      - name: ask
        hash: e97896cfe214a7e4
        size: 139
    def: 2f2c3d6572124fa4
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the planted file in src/imports/clock_test.go holds no exec.CommandContext call, though the approach names it, so no case decides that name

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/imports/clock_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

Commit ae03c9657 plants a CommandContext call under an aliased import in the planted file, and the pass case asserts it among the four real waits, so a case decides each name the guard reads.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the point
- no cleanup stands past it
- the names the guard reads stand once, in the realWaits map of clock.go

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
