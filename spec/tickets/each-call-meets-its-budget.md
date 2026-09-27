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
        checklist: ["every file, function and verb the approach names stands opened, and each claim checked there", "the callers list names every caller of what the approach changes", "every done_when line names the test that decides it"]
        evidence:
          - name: approach
            form: text
            says: the approach here where it takes minutes, or a link to the design output where it takes a note
          - name: callers
            form: list
            says: every caller of what the approach changes, one a line, as a file and a function
          - name: tests
            form: list
            says: every test the change adds, one a line, as a file and a test name
          - name: answers
            form: list
            says: every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft
      - name: review
        does: reads the approach against the ask
        not: draft
        on_fail: draft
        reads: [[spec/guidance/review/design]]
        input: design/draft
        evidence:
          - name: verdict
            form: verdict
            says: pass, pass with findings naming a child a line, or fail with findings one a line
  - name: implement
    reads: [[spec/guidance/code/testing]]
    needs: ["branch test"]
    input: ["design/draft", "design/review"]
    checklist: ["the change touches no file the ask leaves out", "every door the change reaches has a fake", "a comment names the approach the change implements", "every fact the change adds stands in one place, and a note points at the file instead of repeating it", "every row the design review passes with stands fixed in the change"]
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
        to: retro
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
process: [[spec/processes/standard]]
process_hash: 9d870e3fd3c577a6
group: guidance-rides-each-step
step: implement/change
record:
  - step: design/draft
    hand: box d7d8cca5d3cd · claude-code-remote
    hash_before: be3fa3f7d2b43883f8d204063e9413c537680b7a
    hash_after: be3fa3f7d2b43883f8d204063e9413c537680b7a
  - step: design/review
    hand: box d7d8cca5d3cd · claude-code-remote · helper-2
    hash_before: e8e5d80d56770f1313586ed2ebe62f5809ff7cec
    hash_after: e8e5d80d56770f1313586ed2ebe62f5809ff7cec
  - step: implement/tests-red
    hand: box d7d8cca5d3cd · claude-code-remote
    hash_before: 92ab5d4a8fe75efb9eb9ca84e9f0d0d0e8afd8d7
    hash_after: 92ab5d4a8fe75efb9eb9ca84e9f0d0d0e8afd8d7
    answered:
      - name: tests
        exit: 1
        said: assertion, 5 test(s) fail on their own assertion
---

# Ask

The cold engine stays fast, and a slow call turns the battery red before a hand meets it. [[spec/design_input/level-two]] asks it in its chapter Time budgets.

Today the pull grows slower with each piece of work it carries, and nothing names the call that slows.

- `spec/config/level0.json` names a time budget for the pull, the hand-back, the resolver and the query for stale steps
- a test in the battery times each call over a fixture against its budget, and fails past it
- `./RUNME.sh check` exits 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->
<!-- the form is text -->

- `spec/config/level0.json` gains a `budget` key: `pull`, `handBack`, `resolver` and `stale`, each in milliseconds. `spec/config/level0.schema.json` declares each with its unit.
- The pull is `pull` in `src/scripts/pull.js` handing out a leaf. The hand-back is the same verb under `--pass`.
- The resolver is the function guidance-resolves-by-tags adds to `src/scripts/guidance-hand.js`, so this child waits on that one.
- The query for stale steps is `handsAgain` over `readsOf` in `src/scripts/guidance-hand.js`. It answers whether the notes a held step reads moved since the take. The index query of the design input's chapter Evidence and stale steps takes its place once it stands.
- `test/level0/budget.test.js` reads the budgets from the tracked config, drives each call over the fake doors of `test/level0/pull-doors.js`, and fails a call past its budget. A slow call turns the battery red, so the hand meets it at the check.
- The engine code stays as it stands. The budget is a requirement a test holds.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

none: the change adds config keys and a test, and changes no function

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

test/level0/budget.test.js the config names a time budget for the pull, the hand-back, the resolver and the query for stale steps,test/level0/budget.test.js each call meets its budget over the fixture

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

first

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every file, function and verb the approach names stands opened: pull, handsAgain, readsOf, pull-doors, level0.json and its schema
- the change calls no new function from engine code, so the callers list stands empty
- each done_when line names a case in test/level0/budget.test.js, and the check line names ./RUNME.sh check

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass, pass with findings naming a child a line, or fail with findings one a line -->
<!-- the form is verdict -->

pass with findings
- budget-fixture-grows-with-work: the draft times each call over the doors of test/level0/pull-doors.js, whose map carries one ticket and one group, so the test misses the growth the ask names; build the fixture with many tickets, holds and groups, and time each call at that size
- budget-names-the-resolver-call: the draft names the resolver by the sibling ticket alone; name resolved and readsFor in src/scripts/guidance-hand.js as guidance-resolves-by-tags adds them, and time readsOf with handsAgain, since readsOf reads and hashes the notes while handsAgain compares arrays
- budget-headroom-on-cloud-boxes: a wall-clock budget over fakes flakes on a loaded cloud box; set each budget with headroom over a measured median, and say the unit and the headroom in the help of spec/config/level0.schema.json

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test test/level0/budget.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Every case fails on its own assertion: the config names no budget yet, and guidance-hand.js answers no resolved until guidance-resolves-by-tags lands. The fixture carries a group of many children and as many loose tickets, and many notes under many folders, so a call slowing with the work it carries turns the case red. Each case times the median of several runs, which a loaded box moves less than a single run.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the tests touch test/level0/budget.test.js alone
- the cases drive the fake disk, git and clock of test/level0/pull-doors.js
- the file header names the chapter Time budgets
- each budget stands once, in spec/config/level0.json, and the case reads it there
- the review's rows stand in the test: the fixture grows with the work, the resolver case names resolved in guidance-hand.js, the stale case times readsOf with handsAgain, and the median answers the loaded box

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

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
