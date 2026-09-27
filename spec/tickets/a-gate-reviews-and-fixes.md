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
group: the-engine-holds-the-route
step: implement/tests-red
record:
  - step: design/draft
    hand: box d7d6cb0fb1105 · claude-code-remote
    hash_before: 418254f005756d217cb9c5ef8d39454c96d50bef
    hash_after: 418254f005756d217cb9c5ef8d39454c96d50bef
  - step: design/review
    hand: box d7d6cb0fb1105 · claude-code-remote · helper-2
    hash_before: 46efa876a4c88d1dd62e695ed14eaa13bf52786f
    hash_after: 46efa876a4c88d1dd62e695ed14eaa13bf52786f
---

# Ask

A reviewer with no stake in the work reads each phase at its gate. It fixes what it finds within its own diff, and lets the work go on. [[spec/design_input/level-two]] asks it in its chapters Gates and The standard process.

Today a small fault costs a review round, and nobody reviews the code before the merge.

- `spec/schemas/process.schema.yaml` admits a gate step with the verdicts accept, accept with points and reject. A case in `test/level0/process.test.js` decides it
- `spec/processes/standard.yaml` carries design with draft and tests-red, a gate, and implement with change and tests-green
- a gate hand-back admits the commit of the reviewer, where `commitsFor` in `src/scripts/pull-writes.js` refuses it today. A case under `test/level0` decides it
- accept with points mints a fix ticket a point, a trivial child at the front of the queue. A case under `test/level0` decides it
- a reject inserts the steps to work again, and a second reject inserts a person step. A case under `test/level0` decides it
- the check reads the tests a process lists as expected red, until its tests-green closes. A case under `test/level0` decides it
- `./RUNME.sh check` exits 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

A step carrying `gate` is a gate: the value is the question it answers. The change lands the chapter The gate in `spec/design_output/pull.md`, and the rows below hold its shape.

| piece | the change |
|---|---|
| the schema | the step schema in `spec/schemas/ticket.schema.yaml` admits `gate`, a string, and `process.schema.yaml` reads it through its `$ref` |
| the verdict | `verdictIn` in `src/scripts/pull-chapter.js` reads `accept`, `accept with points` and `reject` beside `pass` and `fail`: accept reads as pass, points as findings, reject as fail |
| the route | `spec/processes/standard.yaml` runs design with draft and tests-red, then `gate` by a helper, then implement with change and tests-green, and keeps owner-read and view |
| the guard | `handFaults` in `src/scripts/pull-chapter.js` skips the moved-tip guard on a gate leaf, so the reviewer's own commit hands back |
| the points | `minted` in `src/scripts/pull-writes.js` takes a `fix` flag on a gate: each child stands `open` with `todo: true`, so the pull hands it out first |
| the reject | a new `rejected` in `src/scripts/pull-gate.js` copies the leaves of the phase before the gate onto its end, each named `<leaf>-<round>`, and points `step` at the first copy. From the second reject on, `withPersonStep` goes in before that copy too |
| the red list | tests-red gains the list field `red`, the test files that stand red. `expectedRed` in `src/scripts/red-list.js` reads every ticket past tests-red and short of tests-green. `test` in `src/scripts/cli.js` runs the red files apart, and its exit reads the rest alone |

Weighed: a reject inserts copies, as the design input asks for `draft-2`, so each round keeps its own evidence. Assumed: the phase a gate closes is the sibling step before it, so the gate names no target.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->

<!-- the form is list -->

- `src/scripts/pull.js` `handBack`, which calls the verdict reader, the hand faults, the mint and the fail
- `src/scripts/pull-chapter.js` `formFault`, which calls `verdictIn`
- `src/scripts/pull-writes.js` `minted`, which `handBack` calls
- `src/scripts/cli.js` `test`, which the check and the test verb call
- `src/scripts/cli.js` `testArgv`, which `test` calls
- `.claude/skills/level0/hooks/pull-tool.js`, which maps a verdict word onto a flag
- every ticket on `spec/processes/standard.yaml`, which `./RUNME.sh ticket update` moves onto the new route

### tests

<!-- every test the change adds, one a line, as a file and a test name -->

<!-- the form is list -->

- `test/level0/process.test.js` a gate step and its verdicts meet the schema
- `test/level0/process.test.js` the standard process runs design, the gate, then implement
- `test/level0/pull-gate.test.js` a gate hand-back admits the reviewer's own commit
- `test/level0/pull-gate.test.js` accept with points mints an open fix ticket a point, at the front
- `test/level0/pull-gate.test.js` a reject inserts the phase again before the gate
- `test/level0/pull-gate.test.js` a second reject inserts a person step
- `test/level0/red-list.test.js` the red list holds a ticket past tests-red, and drops it at tests-green

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->

<!-- the form is list -->

- first

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- every file and function named stands opened: the pull files, the check's test run, both schemas and the standard process
- the callers list follows each changed function to the file calling it
- every done_when line maps to a test row above, and `./RUNME.sh check` decides the last

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass, pass with findings naming a child a line, or fail with findings one a line -->

<!-- the form is verdict -->

pass
- the callers list names `.claude/skills/level0/hooks/pull-tool.js` for the verdict map, and the map stands in `src/scripts/pull-tool.js`, which reads `pass` and `fail` alone: the builder adds `accept`, `accept with points` and `reject` there
- `formFault` in `src/scripts/pull-chapter.js` refuses a verdict opening with a word past pass or fail: the builder widens its message and its check with `verdictIn`
- `handBack` in `src/scripts/pull.js` sends every fail to `failed` in `src/scripts/pull-writes.js`: the builder routes a gate's reject to `rejected` there, and names `failed` in the callers list
- `minted` mints each child at `state: draft` today: the gate's `fix` flag sets `open` and `todo: true`, and leaves a design review's children as they stand
- the ask reads the red list from the process, and the approach reads it from a `red` field on each ticket: the builder names that choice in the design output chapter The gate

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
