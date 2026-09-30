---
kind: [[ticket]]
state: open
step: design/tests-red
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
group: tui-shell-switches-over
record:
  - step: design/draft
    hand: box d889b5fc6cd8 · claude-code-remote
    hash_before: 559950a8fa50a4ed33a7c39e86a35bc710810963
    hash_after: 2fda61bb40d775d2172c4006fc2eabb5f3ddba0e
    inputs:
      - name: ask
        hash: 55e3dcccd4ae2c25
        size: 276
    def: 71651f49796eeda4
  - step: design/tests-red
    hand: box d889b5fc6cd8 · claude-code-remote
    hash_before: 42849f666ee11cead27a8022d0c7e3bd93e35691
    hash_after: 42849f666ee11cead27a8022d0c7e3bd93e35691
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/tui fails
    inputs:
      - name: design/draft
        hash: daedefef3b76c374
        size: 3003
      - name: [[spec/tickets/v1-watch-streams-changes]]
        hash: 713ca59bcb9fe911
        size: 12950
      - name: [[spec/tickets/the-work-tab-reads-v1]]
        hash: cd951631732229fe
        size: 8612
      - name: [[spec/tickets/the-work-keys-call-actions]]
        hash: a3a12f8afbc43705
        size: 8428
      - name: [[spec/tickets/the-log-tab-reads-v1]]
        hash: edbcb9b1a3bb9473
        size: 8311
    def: 08e16d07b0de477c
  - step: design/tests-red
    hand: the engine
    stale: [[spec/tickets/v1-watch-streams-changes]]
  - step: design/tests-red
    hand: box d889b5fc6cd8 · claude-code-remote
    hash_before: c13f4c4346052c910c307ea4432747dd5d10c44f
    hash_after: c13f4c4346052c910c307ea4432747dd5d10c44f
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/tui fails
    inputs:
      - name: design/draft
        hash: daedefef3b76c374
        size: 3003
      - name: [[spec/tickets/v1-watch-streams-changes]]
        hash: 77ef4c68b5d9831f
        size: 13429
      - name: [[spec/tickets/the-work-tab-reads-v1]]
        hash: cd951631732229fe
        size: 8612
      - name: [[spec/tickets/the-work-keys-call-actions]]
        hash: a3a12f8afbc43705
        size: 8428
      - name: [[spec/tickets/the-log-tab-reads-v1]]
        hash: edbcb9b1a3bb9473
        size: 8311
    def: 08e16d07b0de477c
  - step: design/tests-red
    hand: the engine
    stale: "[[spec/tickets/v1-watch-streams-changes]], [[spec/tickets/the-work-tab-reads-v1]]"
  - step: design/tests-red
    hand: box d889b5fc6cd8 · claude-code-remote
    hash_before: 623152c81bc1a7e24526166c1e860f357e0f277e
    hash_after: 623152c81bc1a7e24526166c1e860f357e0f277e
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/tui fails
    inputs:
      - name: design/draft
        hash: daedefef3b76c374
        size: 3003
      - name: [[spec/tickets/v1-watch-streams-changes]]
        hash: 814d41b71fd1d41e
        size: 13774
      - name: [[spec/tickets/the-work-tab-reads-v1]]
        hash: 7343295707d8c3c4
        size: 13099
      - name: [[spec/tickets/the-work-keys-call-actions]]
        hash: a3a12f8afbc43705
        size: 8428
      - name: [[spec/tickets/the-log-tab-reads-v1]]
        hash: edbcb9b1a3bb9473
        size: 8311
    def: 08e16d07b0de477c
  - step: design/tests-red
    hand: the engine
    stale: [[spec/tickets/the-log-tab-reads-v1]]
  - step: design/tests-red
    hand: box d889b5fc6cd8 · claude-code-remote
    hash_before: e8919e321c70b7f3ac70aac4ffe9466af0410dcd
    hash_after: e8919e321c70b7f3ac70aac4ffe9466af0410dcd
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/tui fails
    inputs:
      - name: design/draft
        hash: daedefef3b76c374
        size: 3003
      - name: [[spec/tickets/v1-watch-streams-changes]]
        hash: 814d41b71fd1d41e
        size: 13774
      - name: [[spec/tickets/the-work-tab-reads-v1]]
        hash: 7343295707d8c3c4
        size: 13099
      - name: [[spec/tickets/the-work-keys-call-actions]]
        hash: a3a12f8afbc43705
        size: 8428
      - name: [[spec/tickets/the-log-tab-reads-v1]]
        hash: 0d7bd743bbc7dc89
        size: 11159
    def: 08e16d07b0de477c
  - step: design/tests-red
    hand: the engine
    stale: [[spec/tickets/the-log-tab-reads-v1]]
  - step: design/tests-red
    hand: box d889b5fc6cd8 · claude-code-remote
    hash_before: d4b7cd57888119250e3e81e4319f8e7e1015ae54
    hash_after: d4b7cd57888119250e3e81e4319f8e7e1015ae54
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/tui fails
    inputs:
      - name: design/draft
        hash: daedefef3b76c374
        size: 3003
      - name: [[spec/tickets/v1-watch-streams-changes]]
        hash: 814d41b71fd1d41e
        size: 13774
      - name: [[spec/tickets/the-work-tab-reads-v1]]
        hash: 7343295707d8c3c4
        size: 13099
      - name: [[spec/tickets/the-work-keys-call-actions]]
        hash: a3a12f8afbc43705
        size: 8428
      - name: [[spec/tickets/the-log-tab-reads-v1]]
        hash: 651e262af2241535
        size: 12121
    def: 08e16d07b0de477c
  - step: design/tests-red
    hand: the engine
    stale: "[[spec/tickets/the-work-tab-reads-v1]], [[spec/tickets/the-work-keys-call-actions]], [[spec/tickets/the-log-tab-reads-v1]]"
depends_on: [the-work-tab-reads-v1, the-work-keys-call-actions, the-log-tab-reads-v1]
---

# Ask

`migration/config/slices/window` moves to `new`, and the window's own index client, its spawns and its own writes leave the tree.

The window stops computing a second copy of any value.

- `git grep -n 'branch list --json' src/tui` answers nothing
- `./RUNME.sh check` exits 0

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

The ask splits into four pieces, each small enough to read whole, and this ticket takes the last one. Each piece is a child of this group, minted and open.

- [[spec/tickets/v1-watch-streams-changes]]: the door answers `GET /v1/watch`, and the window gets its client. The JSON-RPC `changes` call is the window's only wake today, so the index client leaves only after this stands.
- [[spec/tickets/the-work-tab-reads-v1]]: the work tab reads `work/rows` and `work/open-tasks` off `/v1`, and wakes on the watch. `workindex.go`, `runVerb`, `startIndex`, `NodeAt` and the `branch.js list --json` spawn in `workplaces.go` leave, since `work/rows` carries the places, the cloud flag and the todos.
- [[spec/tickets/the-work-keys-call-actions]]: the keys post `work/place`, `tickets/flip-urgent`, `tickets/set-field` and `work/pull` to `/v1/actions`. The writes in `workplace.go` and `workedit.go` leave.
- [[spec/tickets/the-log-tab-reads-v1]]: the log tab reads `log/rows` off `/v1`. `tail.go` and its `fsnotify` watcher leave.

This ticket lands once the three before it close. `migration.window` in `spec/config/level0.json` reads `new`. The compares leave with the mode that runs them. `src/tui/work/shadow.go`, `src/tui/log/shadow.go` and `src/tui/frame/shadow.go` lose `Shadow`, `Check`, `Apart`, `BadgeApart` and `WriteShadow`, and `main.go` loses `windowMode` and the `Shadow` wiring. A draw function a piece moves onto the index path stays with that piece. The door keeps this ticket's front closed while it stands in hand, so its wait on the three rides here. The pull hands the pieces first by their own `depends_on`.

Weighed: one ticket over the whole cutover spares three reviews. It costs a diff across three packages and the door, which nobody reads whole. Assumed: `/v1/watch` belongs to this group, since the design names it and the window's switch lands only on it.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/tui/main.go newModelOver, which hands each tab its Shadow
- src/tui/main.go windowMode, which reads migration.window
- src/tui/work/work.go Tab.Update and Tab.takes, which call Tab.check
- src/tui/log/tab.go Tab, which calls Shadow.Check off its snapshot
- src/tui/window_test.go, which reads the mode and the shadows the window holds
- spec/config/level0.json migration.window, which the index and quack read

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/tui/window_test.go TestTheWindowHoldsNoCompare: the window builds every tab with no compare
- src/tui/window_test.go TestTheWindowModeReadsNew: migration.window reads new off the tracked config

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every file, function and verb the approach names stands opened on this branch: main.go, work.go, workplaces.go, workindex.go, door.go, log/tab.go, the three shadow.go files, registry/v1.go, index/actions.go and work/rows.go
- the callers list names every caller git grep finds of Shadow, WriteShadow, windowMode and migration.window
- each done_when line names its decider: git grep for the spawn string, and ./RUNME.sh check

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test src/tui/switched_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/tui/switched_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The tracked config reads `shadow` for the window, and `work.Tab` and `log.Tab` each hold a `Shadow`. Both cases fail on that. The surprise: the front of an open ticket stands closed to its hand, so this ticket's wait on the three pieces rides in its approach. The pull hands this ticket ahead of them, so its tests cover its own part alone. The grep line in its ask meets its test in [[spec/tickets/the-work-tab-reads-v1]], whose ask carries the same line.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the key line meets TestTheWindowModeReadsNew, and the compares leaving meet TestTheWindowHoldsNoCompare. The grep line meets the work tab piece's own done_when, and the check decides the last line
- the cases read the tracked config and the tab types alone, so no door is reached and none needs a fake

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
