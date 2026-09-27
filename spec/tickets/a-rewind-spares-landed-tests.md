---
kind: [[ticket]]
state: open
steps:
  - name: design
    steps:
      - name: owner-read
        does: reads the ask a handover carries, before any draft
        by: person
        when: handed
        input: ask
        evidence:
          - name: read
            form: verdict
            says: pass where the ask says what the owner said, or fail with the owner's words
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
          - name: size
            form: list
            says: every file the approach touches, one a line
      - name: tests-red
        does: writes the tests the ask calls for
        tags: ["code", "testing"]
        needs: ["branch test"]
        input: draft
        checklist: ["every done_when line meets a test that fails, or a checkpoint the hand answers where no command decides", "every door the tests reach has a fake"]
        evidence:
          - name: tests
            form: command
            expects: assertion
            says: the tests you write fail on their own assertion
          - name: red
            form: list
            says: every test file standing red until tests-green closes, one a line, which the check leaves out
          - name: seen
            form: text
            says: what you see, and what surprises you
  - name: gate
    gate: does the approach answer the ask, and does a red test decide every done_when line
    does: reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points
    not: design/draft
    tags: ["review"]
    input: ["design/draft", "design/tests-red"]
    evidence:
      - name: verdict
        form: verdict
        says: accept, accept with points naming a fix ticket a line, or reject with findings one a line
  - name: implement
    tags: ["code", "testing"]
    needs: ["branch test"]
    input: ["design/draft", "gate"]
    checklist: ["the change touches no file the ask leaves out", "every door the change reaches has a fake", "a comment names the approach the change implements", "every fact the change adds stands in one place, and a note points at the file instead of repeating it"]
    steps:
      - name: change
        does: makes the change
        evidence:
          - name: lint
            form: command
            expects: 0
            says: the tree builds and lints
      - name: tests-green
        does: makes the tests pass
        input: design/tests-red
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
  - name: accept
    gate: does the whole work answer the ask, and does every command of the route pass
    final: true
    when: backlog
    does: reads the diff since its last verdict against the ask and every prose criterion, and names what falls short as points
    not: implement/change
    tags: ["review", "accept"]
    input: ["ask", "implement"]
    evidence:
      - name: verdict
        form: verdict
        says: accept, accept with points naming a fix ticket a line, or reject with findings one a line
  - name: view
    does: reads the change in the view the ask names
    by: person
    when: view
    on_fail: implement
    to: retro
    input: ["ask", "implement/tests-green"]
    evidence:
      - name: seen
        form: verdict
        says: pass where the view shows the ask's number, or fail with what it shows
process: [[spec/processes/standard]]
process_hash: 22b42ea1501e8967
step: design/tests-red
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box d6f05e3a585030 · claude-code
    hash_before: 8ac6708a8e1ef2ee9c5b65e70efa7b64e168f0aa
    hash_after: 8ac6708a8e1ef2ee9c5b65e70efa7b64e168f0aa
    inputs:
      - name: ask
        hash: 51cba604bf4d0a4a
        size: 822
    def: 7883b3d10633c780
---

# Ask

A ticket whose design review goes stale after its change lands walks back to green, so the box that builds it closes its group.

A stale design review sends a ticket back to `implement/tests-red`, whose evidence expects a failing assertion. Once the change lands the tests pass, so no rerun passes the step and the ticket strands mid-route. `the-retro-reads-the-backlog` stands there: a rename moves its route test, rewrites the draft's test list, and marks `design/review` stale after `implement/change` passes.

- a rewind keeps a landed `tests-red` whole while its tests stand unmoved, or reruns it at its recorded commit. A case under `test/level0` decides it
- the case replays the rewind `the-retro-reads-the-backlog` meets, a rename moving a test the draft names
- `./RUNME.sh check` exits 0

view: none

from: none

# design

## owner-read

<!-- reads the ask a handover carries, before any draft -->

### read

<!-- pass where the ask says what the owner said, or fail with the owner's words -->

<!-- the form is verdict -->

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->
<!-- the form is text -->

A red leaf is a leaf whose evidence holds a command field expecting `assertion`. The walk meets one that a pass in the record already carries. Where every test its command names holds content that stood in the tree of that pass's `hash_after`, the walk keeps the leaf and goes past it. The entry reads `{ step, skipped: true, kept: <hash_after>, why }`, so the progress counts it passed and the stale read reads the red pass behind it.

The check reads content, so a rename moving a test keeps the leaf. A test whose content moved hands the leaf out again, as today.

| part | where |
|---|---|
| `keptRed(it, text, leaf)` answers the check | `src/scripts/pull-kept.js`, new |
| the walk after a pass calls it beside the `when` condition | `stepOn` in `src/scripts/pull-writes.js` |
| the walk at a pull calls it, so a ticket already stranded walks on | `advanced` in `src/scripts/pull-hand.js` |
| the blobs of the red commit | `git ls-tree -r <hash_after>` through the git door |
| the blob of each working test | `git hash-object <path>` through the git door |

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- `src/scripts/pull-writes.js`, `stepOn`, which a pass runs
- `src/scripts/pull-bless.js`, `blessed`, which runs `stepOn`
- `src/scripts/pull-hand.js`, `advanced`, which a pull runs

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- `test/level0/pull-kept.test.js`, a rewound ticket walks past a red leaf whose tests stand as they stood red
- `test/level0/pull-kept.test.js`, a rename moving a test the draft names keeps the red leaf, the rewind the-retro-reads-the-backlog meets
- `test/level0/pull-kept.test.js`, a test whose content moved hands the red leaf out again
- `test/level0/pull-kept.test.js`, a pull meeting a ticket stranded at a red leaf walks it on

The done lines and the case deciding each:

- the rewind keeps a landed `tests-red`: the first case
- the replay of the rename: the second case
- the check: `./RUNME.sh check`

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- `src/scripts/pull-kept.js`
- `src/scripts/pull-writes.js`
- `src/scripts/pull-hand.js`
- `test/level0/pull-kept.test.js`
- `spec/design_output/pull.md`

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- `stepOn`, `advanced`, `inputRead` and `lastOf` stand opened, and a skipped entry counts as passed in `passedSteps` of `src/tickets/tickets.go`
- the callers come off a search for `stepOn(` and `advanced(` over `src`
- each done line names the case deciding it

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->

<!-- the form is list -->

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->

<!-- the form is verdict -->

# implement

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

# accept

<!-- reads the diff since its last verdict against the ask and every prose criterion, and names what falls short as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->

<!-- the form is verdict -->

# view

<!-- reads the change in the view the ask names -->

## seen

<!-- pass where the view shows the ask's number, or fail with what it shows -->

<!-- the form is verdict -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
