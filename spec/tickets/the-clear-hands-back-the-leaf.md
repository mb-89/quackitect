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
group: clear-hands-back-the-leaf
step: design/tests-red
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box 156418b839c4 · claude-code-remote
    hash_before: f4417d4e23037a0016caeae2d0fe7d79d4cb2551
    hash_after: f4417d4e23037a0016caeae2d0fe7d79d4cb2551
    inputs:
      - name: ask
        hash: 1e318d444c0e3d69
        size: 1525
    def: 7883b3d10633c780
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
<!-- view, as text: the view the owner reads the change in and the number there, in the owner's words, or none -->
<!-- from, as text: handover where the ask comes off a handover line, so the owner reads it first, or none -->

Cloud boxes lock into a handover loop after a context clear, and push nothing for an hour or more. The box reports "level0 cleared; handover block ready", "handover pulled; no pending work", and "level0 handover pulled; ticket `clear` in hand", while `./RUNME.sh ticket pull` run by hand on the same branch hands out a real leaf. After the clear the box takes the handover or the `clear` ticket again in place of the leaf it held, or the clear lands on a turn boundary and the box ends its turn before it pulls. This ticket makes the pull after a clear hand back the held leaf in the same turn, and extends the dry probe over the whole cycle.

- gain: a box carries its leaf across a context clear and keeps pushing, so a group lands in hours, not after an hour of spin
- breaks: every long cloud run stalls at its first clear, and the group stands mid-step until a person pulls by hand
- done_when: after a clear, the next pull hands back the leaf the box held before the handover, in the same turn, decided by a test beside the change
- done_when: a second handover with no new commit is refused, and the refusal tells the box to continue its leaf and not to end the turn, decided by a test beside the change
- done_when: the handover ticket and the `clear` ticket are never handed out as work, decided by a test beside the change
- done_when: the dry probe `src/scripts/probe-clear.js` runs the full cycle handover, clear, pull, continue, commit, and passes
- done_when: `./RUNME.sh check` passes
- view: none
- from: none

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

The cause: the bridge server left, and with it `readsNext` in `src/bridge/handover.js`. That step turned the `clear` hold into `read-handover` and dropped `.se/.runtime/due.json` at the clear. The Go door answers the clear at the Stop (`holdsForHandover` in `src/modules/hooks/stops.go`) and ports neither step. After the clear the box still holds `clear`, so its pull answers `clear stands in your hand. End the turn now`, the box ends the turn, and the Stop answers another clear. Where the `clear` hold goes some other way, `due.json` still stands, so the next hand-out hands `handover` again. The second handover finds no new commit, and `localWorkFault` tells the box to end the turn.

The fix, in four parts:

1. Hooks. The Stop that answers the clear sets a `ReadNext` mark. `Door.marks` in `src/modules/hooks/marks.go` rewrites each ephemeral `clear` hold into `read-handover`, keeping its hand and its taken stamp, and drops `due.json`. This ports `readsNext` onto the door that answers the Stop.
2. Pull, the read. A `read-handover` pass in `ephemeralPull` drops `due.json` itself, then goes `onward`. So the hand-out after the clear hands a leaf, in the same pull answer, whatever the hook did.
3. Pull, the second handover. `localWorkFault` splits. Work origin lacks still refuses and keeps `handover` in hand, because a push fixes it. A tip equal to the last handover tip refuses the handover and its clear: the pull drops the `handover` hold, says to continue the leaf in this turn, and hands the leaf, skipping the due check for that one hand-out. `due.json` stays, so the first hand-out after the next commit hands over again.
4. Pull, the todo. `workingTodo` reads `handover`, `clear` and `read-handover` as no todo, so a plan naming the clear's tickets holds no pull back.

What I weigh: the pull hands `handover` only once the ticket in hand stands done, or once its next leaf needs another hand. So no hold crosses the clear, and the leaf the box held is the leaf the queue hands it next, the one the manual pull showed. I add no resume field, because the queue already answers that leaf.

The JS mirror under `src/scripts` stays as it stands, because the live pull runs in Go and no live road reaches `src/scripts/pull.js`.

The dry probe `src/scripts/probe-clear.js` goes on past the clear: it pulls `read-handover`, passes it, reads a real leaf in the same answer, makes a commit, and checks that no second clear runs.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/modules/hooks/stops.go holdsForHandover, which sets the mark
- src/modules/hooks/hooks.go Door.Hook, which calls Door.marks
- src/pull/pull.go Pull, which calls ephemeralPull and workingTodo
- src/pull/pull_ephemeral.go ephemeralPull, which calls localWorkFault and onward
- src/pull/pull_writes.go onward, which calls handOut
- src/pull/pull_hand.go handOut, which calls dueHandOut
- src/scripts/probe-dry.js session, which calls clearRun
- src/scripts/probe-dry.js readsDry, which calls clearHeld

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/modules/hooks/clear_test.go TestTheClearAtTheStopHandsTheReadAndDropsTheDueMark
- src/pull/pull_clear_test.go TestAfterTheClearThePullHandsTheLeafInTheSameAnswer
- src/pull/pull_clear_test.go TestASecondHandoverWithNoCommitHandsTheLeafBack
- src/pull/pull_clear_test.go TestTheClearsTicketsHoldNoPullBackAsATodo
- test/level0/probe-dry.test.js, the clear check reading the cycle past the clear

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/modules/hooks/marks.go
- src/modules/hooks/stops.go
- src/modules/hooks/clear_test.go
- src/pull/pull_ephemeral.go
- src/pull/pull_hand.go
- src/pull/pull_holds.go
- src/pull/pull_clear_test.go
- src/scripts/probe-clear.js
- test/level0/probe-dry.test.js

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- I opened handover.js, guidance.js, stops.go, marks.go, stopfacts.go, hooks.go, pull.go, pull_hand.go, pull_writes.go, pull_holds.go, pull_ephemeral.go, probe-clear.js and probe-dry.js, and checked each claim there
- the callers come off a search for each changed function across src
- each done_when line names its test in the tests list, and the check line names ./RUNME.sh check

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
