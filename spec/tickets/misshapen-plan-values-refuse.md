---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: plan-keeps-its-todos/gate
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
group: tickets-keep-their-chapters
parent: plan-keeps-its-todos
record:
  - step: do
    hand: box 1ad094d8843c · claude-code-remote
    hash_before: 312feaa3ede86a4097ab382a570b890ff8953c93
    hash_after: 312feaa3ede86a4097ab382a570b890ff8953c93
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/plans passes
      - name: check
        exit: 0
        said: "   63.6  in all"
    inputs:
      - name: ask
        hash: a6e89f41500ac070
        size: 475
    def: 2a67cb30183504ee
reason: done
---

# Ask

The plan file keeps every todo where a known key holds a value of the wrong shape, because the plan refuses such a file as it refuses one reading as no JSON object.

A plan file whose `todos` key holds an object reads as zero todos, so the next plan call writes over every todo the file held.

- go test ./src/modules/plans passes a case where a file holding a `todos` object, a `working` number and a `places` list each refuse and stand unchanged
- ./RUNME.sh check is green

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

    ./RUNME.sh test src/modules/plans

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The plan read in `src/modules/plans/plans.go` decodes each known key into its shape: `working` as text, `todos` as a list of objects, `places` as an object. A key of another shape refuses as a file reading as no JSON object does, so the next plan call writes over no todo. The case `TestAPlanKeyOfTheWrongShapeRefusesAndStands` runs the three shapes and asserts each refuses and stands. The change landed in 312feaa3e beside plan-keeps-its-todos, since both edit one function.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask
- no cleanup stands past the change
- the refusal stands once, in `errNoObject`

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
