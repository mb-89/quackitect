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
step: design/tests-red
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box d891eb165fd6 · claude-code-remote
    hash_before: 3d3d0e58ff85ff7ec3f38fd20c422a6808989d72
    hash_after: 3d3d0e58ff85ff7ec3f38fd20c422a6808989d72
    inputs:
      - name: ask
        hash: 3633fde9011c41cd
        size: 831
      - name: [[spec/tickets/the-brief-leaves-the-bridge]]
        hash: 19bd52b73471bf7a
        size: 735
    def: 7883b3d10633c780
---

# Ask

The hooks door answers the brief and keeps the canary debt, so a session reads its tools block and canary with no bridge.

`onPromptContext` in `src/bridge/guidance.js` builds the brief, and `layerRides` and `owesCanary` ride the bridge's `onToolCall` alone. Under `new` a call reaches the Go door, so the debt goes unwatched, and [[spec/tickets/the-brief-leaves-the-bridge]] waits.

- a prompt context after a session start answers the canary block, in a case of `src/modules/hooks`. `go test ./src/modules/hooks/...` decides it
- an open debt rides the next call, and the canary line pays it, in a case of `src/modules/hooks`
- the Go and the JavaScript counts read one case table, in `test/level0/brief-cases.test.js`. `node --test test/level0/brief-cases.test.js` decides it
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

A brief fold keeps the debt, a pure package builds the text, and the door answers the text as named after effects.

1. A pure package `src/modules/hooks/brief` ports `countsOf`, `canary` and `canaryText` in `.claude/skills/level0/lib/guidance.js`. It also ports the tools block off `.se/.runtime/tools.json` and the tier line off `Settings.Helpers`, as `blocksOf` and `toolsText` in `src/bridge/guidance.js` build them. It reads the top notes under both roots, as `inherits` does.
2. A fold `brief/<id>` in `src/modules/hooks/brief.go` ports `sessionHere`, `paid`, `onTurnComplete`, `owesCanary` and `onSessionCompact`. It keeps what the session has read, whether the debt stands open, and what paid it. `Door.writes` stamps the canary sentence on each event, as it stamps `held` and `stopped`, so the fold stays pure.
3. `Effect` gains `Name`. A prompt context answers one after effect a block, with the block's name. A tool call answers the layer on the first call where no prompt context read, and the debt's line while the debt stands open.
4. `stepOf` in cage.js hands an after on the prompt context back as named blocks, the shape level0.js reads.
5. The handover block reads and removes the handover file through the door's own disk, as the marks port does.

The bridge keeps its brief until the-brief-leaves-the-bridge flips the doors, so this port lands alone. What I weigh: a shared case table holds the Go counts to the JavaScript counts, since both read one set of notes. I assume the dead index line drops out, because the door answers only while the index stands.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/modules/hooks/hooks.go: Registers, which gains the brief fold
- src/modules/hooks/hooks.go: Door.writes, which stamps the canary sentence
- src/modules/hooks/hooks.go: Door.Hook, which answers the blocks
- src/modules/hooks/hooks.go: Effect, which gains Name
- src/modules/hooks/cage.go: ReplayLog and shadows, which read Effect
- .claude/skills/level0/hooks/cage.js: stepOf
- .claude/skills/level0/hooks/level0.js: door, which reads stepOf

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/modules/hooks/brief_test.go: TestAPromptContextAfterAStartAnswersTheCanary
- src/modules/hooks/brief_test.go: TestAnOpenDebtRidesTheNextCall
- src/modules/hooks/brief_test.go: TestTheCanaryLinePaysTheDebt
- src/modules/hooks/brief_test.go: TestACompactionOpensTheDebtAgain
- src/modules/hooks/brief/brief_test.go: TestTheCountsMatchTheCaseTable
- test/level0/brief-cases.test.js: the JavaScript counts match the case table
- test/level0/cage.test.js: an after on the prompt context answers as named blocks

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/modules/hooks/brief/brief.go, new
- src/modules/hooks/brief/brief_test.go, new
- src/modules/hooks/brief.go, new
- src/modules/hooks/brief_test.go, new
- src/modules/hooks/hooks.go
- .claude/skills/level0/hooks/cage.js
- test/level0/cage.test.js
- test/replay/cage/brief-cases.json, new
- test/level0/brief-cases.test.js, new

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the helper opened guidance.js in both places, server.js, cage.js, level0.js and hooks.go, and I checked the canary and counts exports myself
- the callers list names every reader of Effect, the fold list and stepOf
- the first done line meets the prompt context case, the second the debt cases, the third the shared table, and the fourth the check

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
