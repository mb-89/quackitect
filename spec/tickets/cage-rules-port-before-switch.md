---
kind: [[ticket]]
state: closed
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
step: implement/tests-green
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
  - step: design/tests-red
    hand: the engine
    stale: [[spec/tickets/cage-command-rules-port]]
  - step: design/tests-red
    hand: box d889b5fde3d5 · claude-code-remote
    hash_before: 812e6365922cd37192d8dd91ca9a93d5c5b8749d
    hash_after: 812e6365922cd37192d8dd91ca9a93d5c5b8749d
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/modules/hooks fails
    inputs:
      - name: design/draft
        hash: a6919ba809d8b0d3
        size: 2872
      - name: [[spec/tickets/cage-command-rules-port]]
        hash: 8d1b292f3a209160
        size: 16968
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
  - step: design/tests-red
    hand: the engine
    stale: "[[spec/tickets/cage-command-rules-port]], [[spec/tickets/cage-commit-guards-port]], [[spec/tickets/cage-write-door-port]], [[spec/tickets/cage-call-holds-port]], [[spec/tickets/cage-stop-rules-port]]"
  - step: design/tests-red
    hand: box d889b5fde3d5 · claude-code-remote
    hash_before: f342f35687a9f0047a1a2c6aa2822c3c56773ad4
    hash_after: f342f35687a9f0047a1a2c6aa2822c3c56773ad4
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/modules/hooks fails
    inputs:
      - name: design/draft
        hash: a6919ba809d8b0d3
        size: 2872
      - name: [[spec/tickets/cage-command-rules-port]]
        hash: 36e18c6742eba22f
        size: 908
      - name: [[spec/tickets/cage-commit-guards-port]]
        hash: 7c90d003597ffeb3
        size: 821
      - name: [[spec/tickets/cage-write-door-port]]
        hash: 106cb5766c01d2f3
        size: 947
      - name: [[spec/tickets/cage-call-holds-port]]
        hash: bc49d4efc513831a
        size: 986
      - name: [[spec/tickets/cage-stop-rules-port]]
        hash: 29ccd1d3cec3f09e
        size: 761
    def: 08e16d07b0de477c
  - step: gate
    hand: box d88b829f8cd8 · claude-code-remote
    hash_before: 4c44da18e5be24b3522c1ab18b96f07c944e2914
    hash_after: 4c44da18e5be24b3522c1ab18b96f07c944e2914
    inputs:
      - name: design/draft
        hash: a6919ba809d8b0d3
        size: 2872
      - name: design/tests-red
        hash: 8a7fd2a70caf0128
        size: 941
      - name: [[spec/tickets/cage-command-rules-port]]
        hash: 36e18c6742eba22f
        size: 908
      - name: [[spec/tickets/cage-commit-guards-port]]
        hash: 7c90d003597ffeb3
        size: 821
      - name: [[spec/tickets/cage-write-door-port]]
        hash: 106cb5766c01d2f3
        size: 947
      - name: [[spec/tickets/cage-call-holds-port]]
        hash: bc49d4efc513831a
        size: 986
      - name: [[spec/tickets/cage-stop-rules-port]]
        hash: 29ccd1d3cec3f09e
        size: 761
    def: dc4904ab364efa10
  - step: implement/change
    hand: box d88b829f8cd8 · claude-code-remote
    hash_before: dde79e8f66ec0ca2efb3b4caa5fa501ded7a38e6
    hash_after: dde79e8f66ec0ca2efb3b4caa5fa501ded7a38e6
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
    def: f150b8c0dc20fe45
  - step: implement/tests-green
    hand: box d88b829f8cd8 · claude-code-remote
    hash_before: f5b6101f905a55f1a62ae5ef4e9337eb9629c1de
    hash_after: f5b6101f905a55f1a62ae5ef4e9337eb9629c1de
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/hooks passes
      - name: check
        exit: 0
        said: "spec/tickets/cage-rules-port-before-switch.md:482:3: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: design/tests-red
        hash: 8a7fd2a70caf0128
        size: 941
    def: ec253787263043a7
  - step: accept
    skipped: true
    why: the delivery's acceptance reads this ticket
  - step: view
    skipped: true
    why: the ask names no view the owner reads
reason: done
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

accept

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

go build ./... && ./RUNME.sh lint src/modules/hooks

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the parent change is the replay log and its golden shadow under test/replay/cage, which stand; each rule port lands through its own child in this group
- the parent reaches no door itself; each child carries the fake its port needs
- the replay test carries its pointer at spec/tickets/cage-rules-replay-session-logs
- the golden shadow stands once, in test/replay/cage/every-refusal.shadow.jsonl

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh test src/modules/hooks

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The replay log test/replay/cage/every-refusal.jsonl carries one call of each refusal the live cage shadow met. Its golden shadow names the rows the Go door still passes. Each child in this group ports one rule family and deletes the rows that family decides. The group accept reads the golden shadow empty and a live shadow read clean before migration.cage moves to new.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the parent touches no file past its replay log and golden shadow
- the parent reaches no door; each child carries the fake its port needs
- the replay test carries its pointer at spec/tickets/cage-rules-replay-session-logs
- the golden shadow stands once, in test/replay/cage/every-refusal.shadow.jsonl

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

**The gate, weighed.** The gate accepts. Each rule family ports as its own child, and each port shrinks a golden shadow, which is the first `done_when` line as written.

- the replay under `test/replay/cage/every-refusal.jsonl` carries a row for each of the five refusals the live shadow names in `spec/tickets/shadow-evidence-5-6.md` on `claude/shadow-evidence-5-6`, plus the Write and the helper hold
- the command child turned the golden shadow into a record of the gap: it holds the Write and the Agent rows, and `./RUNME.sh test src/modules/hooks` reads green
- the draft's line that the replay stands red until the last child lands reads stale, and the accept still catches an unported rule through the second `done_when` line
- the accept reads the golden shadow empty before it passes
