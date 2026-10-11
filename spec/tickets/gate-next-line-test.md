---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: crash-leaves-a-handover/gate
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
group: handovers-and-light-work
parent: crash-leaves-a-handover
record:
  - step: do
    hand: box 2b095da7efc0 · claude-code-remote
    hash_before: f066f02ee54f2230b6201dec92ad440f56d9045d
    hash_after: f066f02ee54f2230b6201dec92ad440f56d9045d
    answered:
      - name: tests
        exit: 0
        said: green, src/pull passes
      - name: check
        exit: 0
        said: "   69.9  in all"
    inputs:
      - name: ask
        hash: 6c5ae910edc06414
        size: 155
    def: 58cddef1c8d4dff6
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the draft writes next on the gate verdict entries in src/pull/pull_gate.go, and no case in src/pull/pull_next_test.go hands a gate verdict back with --next

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

    ./RUNME.sh branch test src/pull/pull_next_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

A new case hands a gate reject back with --next, and reads the line on the entry the gate writes. With the next pair dropped from the two gate entries in pull_gate.go, the case turns red. So it guards the write the draft names.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the case stands in pull_next_test.go
- the change reveals no cleanup
- the case reuses nextLine, greenBox and alphaText

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
