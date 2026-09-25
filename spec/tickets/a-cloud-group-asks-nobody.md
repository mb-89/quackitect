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
          - name: callers
            form: list
            says: every caller of what the approach changes, one a line, as a file and a function
          - name: answers
            form: list
            says: every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft
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
process: [[spec/processes/standard]]
process_hash: 7a1a6e274b56e7ee
step: design/review
record:
  - step: design/draft
    hand: box d6f05e3a585030 · claude-code
    hash_before: c1784e141f3fe804dcc2f04470a25a0ed880cf09
    hash_after: c1784e141f3fe804dcc2f04470a25a0ed880cf09
  - step: design/review
    hand: box d6f05e3a585030 · claude-code · helper-2
    hash_before: 72c970e44b46c42c421b97a9f42e2d0ab5a340fa
    hash_after: 72c970e44b46c42c421b97a9f42e2d0ab5a340fa
    returns: 1
    why: "| grade | finding | fix |; |---|---|---|; | design | `the-editor-takes-an-inset` and `the-owner-walks-a-ticket` stand open at a `by: person` step in the open group `the-editor-holds-the-drawing`, so the rule turns `./RUNME.sh check` red where it lands | name what the implement step does with the two, so the third line of the ask holds |; | design | `branch unblock` refuses on a cloud box, and the finding names it on every box | name the line the finding gives a cloud box, or name the change that lets a cloud box hand the question out as the ask says |; | craft | `waiting` in `src/scripts/ticket-yours.js` already names an open ticket at a person leaf | call it from the rule in place of a second reader |; | craft | the leaf reader stands in `src/scripts/pull-route.js`, and `lib/copilot-dispatch.js` already imports from `src` | import the reader where it stands, and drop the move |; | craft | `treeFaults` runs from `src/scripts/cli-read.js`, which the callers list leaves out | name `cli-read.js` in place of `cli-check.js` |; | craft | the approach names no test | name the fake tree the test feeds: a child at a person step refused, and a child closed `became` passed |"
  - step: design/draft
    hand: box d6f05e3a585030 · claude-code
    hash_before: a1d7cf67a1452cb44dfe9feb4004fdc860236f1c
    hash_after: a1d7cf67a1452cb44dfe9feb4004fdc860236f1c
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

A cloud box works a group to its merge and waits on nobody. A question for the owner leaves the group as a ticket of its own, and the group merges.

Without it a child at a person step stands in the cloud with nobody to answer it, and the group stays open.

- `./RUNME.sh check` fails on an open group holding a child at a step `by: person`, and a test drives it
- the check passes once that child leaves the group through `./RUNME.sh branch unblock`
- `./RUNME.sh check` passes

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

A tree rule `groupAsksNobody` joins `RULES` in `.claude/skills/level0/lib/tree.js`, which the check runs at error. It names a ticket where all three hold:

- `waiting` in `src/scripts/ticket-yours.js` names it: open, at a `by: person` leaf
- it names a `group`
- that group's ticket stands open

| part | what it does |
|---|---|
| the module | `.claude/skills/level0/lib/group-asks.js`, beside `tree.js`, as `everyModuleTested` stands in `tested.js` |
| the reading | the tickets under `spec/tickets`, through `tree.paths` and `tree.read` |
| the person leaf | `waiting` answers it, so the rule writes no reader of its own |
| the finding on a desk | names the ticket and its step, and the line `./RUNME.sh branch unblock <ticket> <successor>` |
| the finding on a cloud box | names the ticket and its step, and points at rule 7 of [[spec/guidance/cloud]]: take the step and answer it |
| an unblocked child | closes `became`, so the rule passes it |
| the design | [[spec/design_output/work#a-person-step-leaves]] gains one line: the check holds an open group to no person step |

The group `the-editor-holds-the-drawing` holds two children at a person step: `the-editor-takes-an-inset` and `the-owner-walks-a-ticket`. The implement step frees them before the rule lands:

1. mint a successor for each, outside the group, opening at a `by: person` step
2. on `work/the-editor-holds-the-drawing`, run `./RUNME.sh branch unblock` for each
3. merge that branch to main, then land the rule, so `./RUNME.sh check` stands green

The test is `test/level0/group-asks.test.js`. It feeds a fake tree with an open group and two children:

- a child open at a `by: person` step, which the rule names
- a child closed `became`, which the rule passes

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->

<!-- the form is list -->

- `.claude/skills/level0/lib/tree.js`, `treeFaults`, which runs `RULES`
- `src/scripts/cli-read.js`, the sweep, which calls `treeFaults`
- `src/scripts/ticket-yours.js`, `waiting`, which the rule calls and leaves as it stands

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->

<!-- the form is list -->

- two children stand open at a person step: the implement step unblocks both on their group's branch and merges it before the rule lands
- `branch unblock` refuses on a cloud box: the finding on a cloud box points at rule 7 of the cloud guidance in its place
- `waiting` already names a person leaf: the rule calls it
- the leaf reader stands in `src/scripts/pull-route.js`: nothing moves, and `waiting` reaches it where it stands
- `treeFaults` runs from `cli-read.js`: the callers name `cli-read.js`
- the approach names no test: `test/level0/group-asks.test.js` feeds the fake tree the approach names

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

fail

| grade | finding | fix |
|---|---|---|
| design | `the-editor-takes-an-inset` and `the-owner-walks-a-ticket` stand open at a `by: person` step in the open group `the-editor-holds-the-drawing`, so the rule turns `./RUNME.sh check` red where it lands | name what the implement step does with the two, so the third line of the ask holds |
| design | `branch unblock` refuses on a cloud box, and the finding names it on every box | name the line the finding gives a cloud box, or name the change that lets a cloud box hand the question out as the ask says |
| craft | `waiting` in `src/scripts/ticket-yours.js` already names an open ticket at a person leaf | call it from the rule in place of a second reader |
| craft | the leaf reader stands in `src/scripts/pull-route.js`, and `lib/copilot-dispatch.js` already imports from `src` | import the reader where it stands, and drop the move |
| craft | `treeFaults` runs from `src/scripts/cli-read.js`, which the callers list leaves out | name `cli-read.js` in place of `cli-check.js` |
| craft | the approach names no test | name the fake tree the test feeds: a child at a person step refused, and a child closed `became` passed |

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
