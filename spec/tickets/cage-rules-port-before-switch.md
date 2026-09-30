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
group: go-cage-switches-over
step: gate
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box d889b5fde3d5 · claude-code-remote
    hash_before: 9aef028935cf6fae3c5e4fc4439fa2128b7b54da
    hash_after: e331f9c4f269b3669d8270e95e6766ae14fa7392
    inputs:
      - name: ask
        hash: 69047d049588488a
        size: 690
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box d889b5fde3d5 · claude-code-remote
    hash_before: e04a360d40ca7174f7f45e3cc311e24ed1e69b2a
    hash_after: e04a360d40ca7174f7f45e3cc311e24ed1e69b2a
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/modules/hooks fails
    inputs:
      - name: design/draft
        hash: a6919ba809d8b0d3
        size: 2872
      - name: [[spec/tickets/cage-command-rules-port]]
        hash: fd1c2c01a882ff54
        size: 15233
      - name: [[spec/tickets/cage-commit-guards-port]]
        hash: 4536259914e8c404
        size: 8642
      - name: [[spec/tickets/cage-write-door-port]]
        hash: 7858a72eba21e4b3
        size: 8768
      - name: [[spec/tickets/cage-call-holds-port]]
        hash: adef77bd3e029bd1
        size: 8807
      - name: [[spec/tickets/cage-stop-rules-port]]
        hash: 1e365cc5550c2588
        size: 8582
    def: 08e16d07b0de477c
---

# Ask

The cage rules port into the `hooks` IO module one at a time, each through the replay harness, until the shadow names no mismatch. Then the cage key can move to `new` and keep every refusal the bridge makes.

The cage shadow runs with no rule ported, so the new path passes every call the bridge refuses. A switch before the port lets through every call the cage refuses today.

- each ported rule meets a recorded log under `test/replay/cage`, and its `.shadow.jsonl` loses the rows that rule decides. `go test ./...` from the root decides it
- `./RUNME.sh log --kind shadow` names no refusal over a session recorded after the last port
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

The port splits into five children in this group, one a rule family, each small enough to review whole, off the inventory of src/bridge/server.js DOORS and TOOLS:

- [[spec/tickets/cage-command-rules-port]]: the ticket door, the command findings, the git write door, the version and bless guards. It lands the tree reader the door needs, the root, the config and the todo in hand, as fields of hooks.Outside, so the rest wait on it
- [[spec/tickets/cage-commit-guards-port]]: the private and tested deltas, the todo on a push, the desk and trunk guards, the commit voice
- [[spec/tickets/cage-write-door-port]]: a write naming no ticket, and every onWrite rule
- [[spec/tickets/cage-call-holds-port]]: the holds before a tool door runs, and the helper tier
- [[spec/tickets/cage-stop-rules-port]]: the handover due, the unanswered prompt, the stop reasons

Each child ports its rules into Door.Hook one at a time, each through a recorded log under test/replay/cage whose golden shadow loses the rows the rule decides. The rewrites the bridge answers as event or after read as pass on both sides, so none of them ports here.

This ticket holds the whole: a recorded session log, test/replay/cage/every-refusal.jsonl, carrying one call of each refusal the bridge makes, with an empty golden shadow. It stands red until the last child lands. Its accept then reads ./RUNME.sh log --kind shadow over a live session recorded after the last port.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/quack/main.go: the index wiring calling hooks.New and Listen
- src/modules/hooks/hooks.go: Door.serves and Replay calling Door.Hook
- src/modules/hooks/cage.go: Door.ReplayLog calling Door.Hook
- src/bridge/cage-shadow.js: shadowsCage posting to the door
- src/quack/hooks_test.go and src/quack/hook_test.go: the wiring cases calling hooks.New

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- test/replay/cage/every-refusal.jsonl with an empty every-refusal.shadow.jsonl: TestReplayLogAnswersEveryRecordedLog/every-refusal.jsonl in src/modules/hooks/cage_test.go
- each child adds its own log under test/replay/cage and its table case, named on its own ticket

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first draft

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- test/replay/cage/every-refusal.jsonl
- test/replay/cage/every-refusal.shadow.jsonl
- spec/tickets/cage-command-rules-port.md
- spec/tickets/cage-commit-guards-port.md
- spec/tickets/cage-write-door-port.md
- spec/tickets/cage-call-holds-port.md
- spec/tickets/cage-stop-rules-port.md

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- opened server.js DOORS, TOOLS and answersEvent, cage.go OldDecisionOf, NewDecisionOf and ReplayLog, cage_test.go TestReplayLogAnswersEveryRecordedLog, hooks.go Hook and calls, and each claim holds there
- the callers list names every caller of Door.Hook and hooks.New, and the bridge post
- done_when line one meets the every-refusal replay and each child log, line two the accept reading the live shadow, line three the check

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test src/modules/hooks

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/modules/hooks/cage_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

test/replay/cage/every-refusal.jsonl carries one call of each refusal the live shadow met, a Write naming no ticket, and a helper held in the foreground. Its golden shadow stands empty, so TestReplayLogAnswersEveryRecordedLog reads it red until the command, write and hold children land.

What surprised me: the live evidence ran with a todo in hand, and one replay tree holds one plan, so the ticket row names no ticket in place of one outside the hand. The shared command table covers the todo case.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- done_when line one meets the every-refusal replay, red. Line two is a checkpoint the accept answers off ./RUNME.sh log --kind shadow over a live session. Line three is the check
- the replay reaches the store through qtest and the tree through the root the rows name, which the command child builds from the shared table

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
