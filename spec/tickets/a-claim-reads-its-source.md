---
kind: [[ticket]]
state: open
steps:
  - name: design
    reads: [[spec/guidance/voice]]
    steps:
      - name: draft
        does: writes the approach the ask calls for
        from: anyone
        by: anyone
        input: ask
        evidence:
          - name: approach
            form: text
            says: the approach here where it takes minutes, or a link to the design output where it takes a note
      - name: review
        does: reads the approach against the ask
        not: draft
        on_fail: draft
        reads: [[spec/guidance/review/reviewing]]
        input: design/draft
        evidence:
          - name: verdict
            form: verdict
            says: pass or fail, with findings one a line
  - name: implement
    reads: [[spec/guidance/code/testing]]
    needs: ["branch test"]
    input: design/draft
    checklist: ["the change touches no file the ask leaves out", "every door the change reaches has a fake", "a comment names the approach the change implements"]
    steps:
      - name: tests-red
        does: writes the tests the ask calls for
        evidence:
          - name: tests
            form: command
            expects: assertion
            says: the tests you write fail on their own assertion
          - name: seen
            form: text
            says: what you see, and what surprises you
      - name: reflect
        does: names the class of error in the findings, and the fix for the class
        when: returned
        input: verdict
        evidence:
          - name: class
            form: text
            says: the class of error the findings describe, and the fix for the class
      - name: change
        does: makes the change
        reads: [[spec/guidance/code/code]]
        evidence:
          - name: lint
            form: command
            expects: 0
            says: the tree builds and lints
      - name: tests-green
        does: makes the tests pass
        input: tests-red
        evidence:
          - name: tests
            form: command
            expects: green
            says: the same tests pass
          - name: check
            form: command
            expects: 0
            says: the check is green on the commit
          - name: says
            form: text
            says: what changes and why, for a reader who was not there
  - name: verdict
    does: reads every hunk against the ask and the approach
    not: implement
    on_fail: implement/reflect
    reads: [[spec/guidance/review/reviewing]]
    input: ["diff", "implement"]
    to: retro
    checklist: ["every fact the change adds stands in one place, and a note points at the file instead of repeating it"]
    evidence:
      - name: read
        form: files
        says: every file you read, one a line
      - name: verdict
        form: verdict
        says: pass or fail, findings one a line
group: the-review-lands-overnight
process: [[spec/processes/standard]]
process_hash: 838dd6d003506639
step: design/draft
record:
  - step: design/draft
    hand: box dcd73916add7 · claude-code-remote
    hash_before: 3a2d46149d34a67f1d8ba04e2e2d827287381fcd
    hash_after: 3a2d46149d34a67f1d8ba04e2e2d827287381fcd
  - step: design/review
    hand: box dcd73916add7 · claude-code-remote · helper-2
    hash_before: 94c8ec812cc823699d2cd411dd261ab9494a09f4
    hash_after: 94c8ec812cc823699d2cd411dd261ab9494a09f4
    returns: 1
    why: "design: The bridge box carries no `join`, so `planHere` throws and the queue read drops every todo row.; design: The bridge box carries no `agent`, so `takeable` orders rows apart from `branch list --queue` in a harness.; design: The fix builds the read door off `handDoors(box.env)`, `join`, a git door, `weights` and `stale`, and names each.; design: A digit past the last row lands `last`, which stands before the first untagged row.; craft: `planRides` drops the tool's answer, so a plan riding another call reads git twice for nothing.; craft: `answerOf` lives in `src/scripts/work-answer.js`, and the callers list names `work-list.js`.; craft: Two todos with one digit in one call anchor on one row, so a case pins their order."
---

# Ask

A design draft names every caller and answers every earlier review finding, so a review passes it in fewer rounds. The owner sees the queue place of each new todo, so an order fix lands right the first time.

A draft misses callers an earlier review names, and fails review again. The hand calls the todo order right off unit tests, and the owner corrects the order by hand.

- the design/draft leaf in `spec/processes/standard.yaml` carries `callers` and `answers`
- the plan door answers the queue place each new todo takes
- a place digit reads the queue order
- a case under `test/level0` covers the plan door's answer and the place digit
- `./RUNME.sh check` exits 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

Two changes, one each for the draft and the todo.

| part | what changes |
|---|---|
| the draft leaf | `spec/processes/standard.yaml` gives `design/draft` two list fields beside `approach` |
| `callers` | every caller of what the approach changes, one a line, as a file and a function |
| `answers` | every finding an earlier review names, one a line, with the answer the approach gives it, or `first` on a first draft |
| the queue read | `plans` in `src/bridge/plan.js` reads the queue through `answerOf` in `src/scripts/work-answer.js` |
| the doors | the read runs on `box.disk`, a git door built on `box.proc` at `box.work`, and the weights `asks` reads |
| the digit | `placeWord` takes the rows at a whole place from `1` up, and a digit names the row standing at that place |
| the ends | a digit of `1` stays `true`, and a digit past the last row stays `last` |
| the answer | the door reads the queue again once the plan stands, and names each new todo with its place |
| the design | `spec/design_output/stop.md#the-plan` names the digit and the answer, and points at the anchor in `pull.md` |
| the cases | `test/level0/plan.test.js` teaches a fake process a queue of three tickets |

The cases hold two claims:

- a digit of `2` anchors the todo before the ticket at place `2`, whatever the plan's todo order
- the answer names each new todo with the place `branch list --queue` prints for it

The callers the change reaches:

- `TOOLS[PLAN_CALL]` in `src/bridge/server.js`, and `planRides` there, which call `plans`
- `placeWord` in `src/bridge/plan.js`, which `plans` alone calls
- `answerOf` in `work-list.js`, behind `list --json` and `queueOnly`, which read the same answer and change nothing
- no code names `design/draft`, so the new fields reach a hand through the route the pull copies

The costs:

- each plan answer reads git twice, once for the digit and once for the answer
- a box carrying no process door reads no queue, so a digit past `1` lands `last`
- an open ticket keeps its copy of the old route, and `./RUNME.sh ticket update` copies the new leaf onto it

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

fail
- design: The bridge box carries no `join`, so `planHere` throws and the queue read drops every todo row.
- design: The bridge box carries no `agent`, so `takeable` orders rows apart from `branch list --queue` in a harness.
- design: The fix builds the read door off `handDoors(box.env)`, `join`, a git door, `weights` and `stale`, and names each.
- design: A digit past the last row lands `last`, which stands before the first untagged row.
- craft: `planRides` drops the tool's answer, so a plan riding another call reads git twice for nothing.
- craft: `answerOf` lives in `src/scripts/work-answer.js`, and the callers list names `work-list.js`.
- craft: Two todos with one digit in one call anchor on one row, so a case pins their order.

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

## reflect

<!-- names the class of error in the findings, and the fix for the class -->

### class

<!-- the class of error the findings describe, and the fix for the class -->

<!-- the form is text -->

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->

<!-- the form is command -->

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->

<!-- the form is command -->

### check

<!-- the check is green on the commit -->

<!-- the form is command -->

### says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

# verdict

<!-- reads every hunk against the ask and the approach -->

## read

<!-- every file you read, one a line -->

<!-- the form is files -->

## verdict

<!-- pass or fail, findings one a line -->

<!-- the form is verdict -->

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
