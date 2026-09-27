---
kind: [[ticket]]
state: open
step: design/person-1
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
      - name: person-1
        does: answers the question the engine asks
        by: person
        to: engine
        asks: "The route strands: the reject round wires no input, and the route verb refuses the rewire. Do you rewire four inputs by hand, or does the engine fix land first?"
        evidence:
          - name: answer
            form: choice
            says: the answer, which the step behind this one reads
            options: ["I rewire by hand", "the engine fix lands first"]
      - name: draft-2
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
      - name: tests-red-2
        does: writes the tests the ask calls for
        tags: ["code", "testing"]
        needs: ["branch test"]
        input: ["design/draft-2", "design/tests-red"]
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
    not: design/draft-2
    tags: ["review"]
    input: ["design/draft-2", "design/tests-red-2"]
    evidence:
      - name: verdict
        form: verdict
        says: accept, accept with points naming a fix ticket a line, or reject with findings one a line
  - name: implement
    tags: ["code", "testing"]
    needs: ["branch test"]
    input: ["design/draft-2", "gate"]
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
        input: design/tests-red-2
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
group: the-engine-fixes-its-faults
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
  - step: design/tests-red
    hand: box d6f05e3a585030 · claude-code
    hash_before: d8a6b89ab773213fb04e947113907f223cbe83fe
    hash_after: d8a6b89ab773213fb04e947113907f223cbe83fe
    answered:
      - name: tests
        exit: 1
        said: assertion, 4 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: 202c93b0d8e8b6f7
        size: 2365
    def: 08e16d07b0de477c
  - step: gate
    hand: box d6f05e3a585030 · claude-code · helper-4
    hash_before: 172fd0c19e906958617353edd36f0758fc0e6d66
    hash_after: 172fd0c19e906958617353edd36f0758fc0e6d66
    returns: 1
    why: "keptRed reads the wrong tree. `passed` in pull-writes.js writes `hash_after` as the tip before the pass commit, and `landed` stages the red tests of the hand into that pass commit, so `git ls-tree -r <hash_after>` holds no new red test and the keep never holds. The own red pass of this ticket shows it: d8a6b89ab lacks test/level0/pull-kept.test.js, and the pass commit f46fe8257 carries it. The red pass of the-retro-reads-the-backlog shows it too: 916443192 lacks retro-backlog.test.js and retro-route.test.js, and its pass commit f27f6c9fc carries them.; A whole-file blob check fails the case the ask names. implement/change 7c8c13970 appends cases to retro-mint.test.js and retro-backlog.test.js, so their blobs move while their red cases stand, and only the renamed route test keeps its blob 312a209. That ticket still strands at implement/tests-red. Pick a keep that survives an appended case, or take the other branch of the ask: a rerun at the recorded commit.; The replay case replays no real rewind. Its fake answers `git ls-tree -r <hash_after>` with the test present, and its record holds the red pass alone: no change pass, no stale review, no appended case. Build the fixture off the record of the-retro-reads-the-backlog, so the case fails on a keep that rescues nothing.; The keep also runs before the change lands. On the standard route a draft edit marks design/tests-red stale, `inputRead` puts the step there, and `advanced` keeps it, so a case the edited draft adds is never written red. Keep a red leaf only where a pass of a later leaf follows its red pass.; The callers list names `blessed` in pull-bless.js, which stands nowhere. The caller is `bless`, and `offer` in pull-hand.js calls `advanced`."
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

A red leaf is a leaf whose evidence holds a command field expecting `assertion`. The walk meets one that a pass in the record already carries. The walk reads every test its command names. Where the tree of that pass's `hash_after` holds each one's content too, the walk keeps the leaf and goes past it. The entry reads `{ step, skipped: true, kept: <hash_after>, why }`, so the progress counts it passed and the stale read reads the red pass behind it.

The check reads content, so a rename moving a test keeps the leaf. A test whose content moved hands the leaf out again, as today.

| part | where |
|---|---|
| `keptRed(it, text, leaf)` answers the check | `src/scripts/pull-kept.js`, new |
| the walk after a pass calls it beside the `when` condition | `stepOn` in `src/scripts/pull-writes.js` |
| the walk at a pull calls it, so a ticket already stranded walks on | `advanced` in `src/scripts/pull-hand.js` |
| the file hashes of the red commit | `git ls-tree -r <hash_after>` through the git door |
| the file hash of each working test | `git hash-object <path>` through the git door |

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

- `stepOn`, `advanced`, `inputRead` and `lastOf` stand opened. A skipped entry counts as passed in `passedSteps` of `src/tickets/tickets.go`
- the callers come off a search for `stepOn(` and `advanced(` over `src`
- each done line names the case deciding it

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

    ./RUNME.sh test test/level0/pull-kept.test.js

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- test/level0/pull-kept.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Over a keptRed that keeps nothing, these cases fail on their own assertion. They are the kept leaf, the rename, the rewound review walking past, and the stranded ticket walking on. The case where a test's content moves passes over the stub, because it guards the other side. There a leaf whose tests move goes out again.

| the case | the class of fault it guards |
|---|---|
| a red leaf whose tests hold their red content | a rewind asks a landed change to fail again |
| a rename moving a test | a move of a file reads as a change of its tests |
| a test whose content moved | a keep passes over tests that no longer stand as they stood red |
| a rewound review walking past | the pass after a rewind strands the ticket at its red leaf |
| a stranded ticket at a pull | a ticket stranded today stays stranded |

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each done line meets a case above: the keep, the rename replay, and the check at tests-green
- the git door the cases reach answers through the fake git of pull-doors.js

## person-1

<!-- The route strands: the reject round wires no input, and the route verb refuses the rewire. Do you rewire four inputs by hand, or does the engine fix land first? -->

### answer

<!-- the answer, which the step behind this one reads -->

<!-- the form is choice -->

I rewire by hand

## draft-2

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->

<!-- the form is list -->

### tests

<!-- every test the change adds, one a line, as a file and a test name -->

<!-- the form is list -->

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->

<!-- the form is list -->

### size

<!-- every file the approach touches, one a line -->

<!-- the form is list -->

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

## tests-red-2

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

reject
- keptRed reads the wrong tree. `passed` in pull-writes.js writes `hash_after` as the tip before the pass commit. `landed` stages the hand's red tests into that pass commit. So `git ls-tree -r <hash_after>` holds no new red test, and the keep fails. This ticket's own red pass shows it. d8a6b89ab lacks test/level0/pull-kept.test.js, and the pass commit f46fe8257 carries it. The red pass of the-retro-reads-the-backlog shows it too. 916443192 lacks retro-backlog.test.js and retro-route.test.js, and its pass commit f27f6c9fc carries them.
- A whole-file hash check fails the case the ask names. implement/change 7c8c13970 appends cases to retro-mint.test.js and retro-backlog.test.js. So their file hashes move while their red cases stand. The renamed route test alone keeps its hash 312a209. That ticket still strands at implement/tests-red. Pick a keep that survives an appended case. Or take the other branch of the ask: a rerun at the recorded commit.
- The replay case replays no real rewind. Its fake answers `git ls-tree -r <hash_after>` with the test present. Its record holds the red pass alone: no change pass, no stale review, no appended case. Build the fixture off the record of the-retro-reads-the-backlog. Then the case fails on a keep that rescues nothing.
- The keep also runs before the change lands. On the standard route a draft edit marks design/tests-red stale. `inputRead` puts the step there, and `advanced` keeps it. So a case the edited draft adds skips its red run. Keep a red leaf only where a pass of a later leaf follows its red pass.
- The callers list names `blessed` in pull-bless.js, which stands nowhere. The caller is `bless`, and `offer` in pull-hand.js calls `advanced`.

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
