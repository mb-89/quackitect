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
    hash_before: a54ede1f23221fae5d3edbb3f4a4951e50a5546e
    hash_after: ae03c9657fd493b162742fb5a0f964c235a2442f
    answered:
      - name: tests
        exit: 0
        said: green, src/imports passes
      - name: check
        exit: 0
        said: "  117.6  in all"
    inputs:
      - name: ask
        hash: 38778863d0fe2c0d
        size: 179
    def: 2f2c3d6572124fa4
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the tree case proves no firing, since no case plants an audit and an unlisted test file that sleeps, so the span match through path.Match goes unproven while the tree stands clean

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

The guard splits into UnauditedWaits, a pure pass over the audit text and the parsed files, and the tree case that feeds it the tree. A new case plants an audit holding a path and a glob, with files listed, globbed, outside and quiet, and asserts the guard names the outside file alone. The audit takes the seven files the guard found outside it, and the caller wait sleeping in a module test names a child.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the point, and folds in the planted CommandContext call and the narrowed quack spans, which ride the same commit
- the cleanup it reveals stands in the change: the spans the guard reads come off one regexp in clock.go
- the audit list stands once, in the doors note, and the guard reads it there

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
