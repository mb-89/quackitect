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
step: design/draft
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box d889b5fde3d5 · claude-code-remote
    hash_before: 16b225d1a1261d72ca3045aa28df5e534045d132
    hash_after: 16b225d1a1261d72ca3045aa28df5e534045d132
    inputs:
      - name: ask
        hash: 36e18c6742eba22f
        size: 908
      - name: [[spec/tickets/cage-rules-port-before-switch]]
        hash: ea4590246f526ac6
        size: 11644
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box d889b5fde3d5 · claude-code-remote
    hash_before: a02ca1a202a39f59cdff316d73a8c9dbaf6483df
    hash_after: a02ca1a202a39f59cdff316d73a8c9dbaf6483df
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/modules/hooks fails
    inputs:
      - name: design/draft
        hash: c0ed900e8f123b44
        size: 4175
    def: 08e16d07b0de477c
  - step: design/draft
    hand: the engine
    stale: [[spec/tickets/cage-rules-port-before-switch]]
---

# Ask

The `hooks` IO module refuses every Bash and PowerShell command the bridge's command rules refuse, with the same reason. The rules:

- the ticket door, with the todo in hand
- the findings of `.claude/skills/level0/lib/bash.js`
- the git write door
- the version guard
- the bless guard

The switch then keeps the four command refusals [[spec/tickets/cage-rules-port-before-switch]] names off the live shadow.

Without it, the cage key moving to `new` lets through every command the bridge refuses today. A raw git write, a shell write and a landing past a failing gate all pass.

- each rule meets a recorded log under `test/replay/cage`, and its `.shadow.jsonl` holds no row that rule decides. `go test ./src/modules/hooks/...` decides it
- each rule's refusal text reads as the bridge's text for the same command, in a table case of `src/modules/hooks`
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

The command door ports into a new Go package, src/modules/hooks/command, and Door.Hook calls it on a Bash or PowerShell call before any action runs.

1. The package ports the parse and the rules, one file a library:
- tokens.go: tokensOf, baseName, clean, the breaks, shells and readers, off lib/tokens.js and lib/shell-values.js
- findings.go: partsOf, wordsIn, afterGit, writesAPath, landingsAfterGates, freeOfTicket and Findings, off lib/bash.js
- reads.go: branchIn, addsIn, commitIn, skipsTheHook and testIn, off lib/commit-reads.js and lib/bash-test.js
- scripts.go: scriptWrites and scriptsIn, off lib/scripted.js, and pulled.go off lib/pulled.js
- gitwrites.go: the git write rows, off lib/git-writes.js
- guards.go: the bless guard off src/bridge/bless.js, and the version guard off lib/trunk.js
- ticket.go: TicketFault and InHand, off src/engine/named.js
- refuse.go: RefusedCommand, off refusedCommand in lib/refuse.js

2. hooks.Outside gains Root, Config and Git. Config reads names.words and the cloud flag, and Git runs a read the pull rule needs. Each takes a fake in the cases, and src/quack/main.go wires the real ones.

3. Door.Hook runs the checks in the bridge's order: the ticket door, the bless guard, the command rules, the version guard, then the git write door. The commit guards and the commit voice slot in later, under cage-commit-guards-port. PowerShell meets the ticket door alone, as onPowerShell does. The first refusal answers a result effect carrying its text, which NewDecisionOf reads as refuse.

4. One case table, test/replay/cage/command-cases.json, holds a command, its description, the todo in hand and the refusal text. A JS case runs onBash over it, and a Go case runs the door over it. So the two texts cannot drift apart.

5. A recorded log, test/replay/cage/command-rules.jsonl, carries one hook row a rule with the bridge's answer. Its golden shadow loses a row with each rule ported, and stands empty at the end.

The rewrites the bridge answers, markedPush and onDescribe, read as pass on both sides, so they port with the hook module's switch.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/modules/hooks/hooks.go: Door.Hook, which gains the command door before calls
- src/modules/hooks/hooks.go: Door.serves and Replay, calling Door.Hook
- src/modules/hooks/cage.go: Door.ReplayLog, calling Door.Hook
- src/quack/main.go: listensHooks, which fills the new Outside fields
- src/quack/hooks_test.go and src/quack/hook_test.go: the wiring cases calling hooks.New
- src/modules/hooks/hooks_test.go and cage_test.go: doorOver, calling hooks.New

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/modules/hooks/command/tokens_test.go: TestTokensOfSplitsOperatorsAndQuotes
- src/modules/hooks/command/findings_test.go: TestFindingsAnswerTheSharedCases
- src/modules/hooks/command/ticket_test.go: TestTicketFaultReadsTheHand
- src/modules/hooks/command_test.go: TestTheDoorRefusesWhatTheBridgeRefuses, over command-cases.json
- test/level0/command-cases.test.js: the bridge answers every shared case
- test/replay/cage/command-rules.jsonl and its shadow, through TestReplayLogAnswersEveryRecordedLog

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first draft

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/modules/hooks/command/tokens.go
- src/modules/hooks/command/findings.go
- src/modules/hooks/command/reads.go
- src/modules/hooks/command/scripts.go
- src/modules/hooks/command/pulled.go
- src/modules/hooks/command/gitwrites.go
- src/modules/hooks/command/guards.go
- src/modules/hooks/command/ticket.go
- src/modules/hooks/command/refuse.go
- src/modules/hooks/command/*_test.go
- src/modules/hooks/hooks.go
- src/modules/hooks/command_test.go
- src/quack/main.go
- test/replay/cage/command-cases.json
- test/replay/cage/command-rules.jsonl
- test/replay/cage/command-rules.shadow.jsonl
- test/level0/command-cases.test.js

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- opened lib/bash.js, lib/refuse.js, lib/git-writes.js, src/engine/named.js, src/bridge/bless.js, src/bridge/bash.js onBash and onPowerShell, hooks.go Hook and main.go listensHooks, and each claim holds there
- the callers list names every caller of Door.Hook and hooks.New
- done_when line one meets command-rules.jsonl, line two the shared case table on both sides, line three the check

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test src/modules/hooks

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/modules/hooks/command_test.go
- src/modules/hooks/cage_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The shared table, test/replay/cage/command-cases.json, holds the bridge's own answers to 35 commands, and test/level0/command-cases.test.js keeps the bridge on it, green. The Go door passes every command today, so TestTheDoorRefusesWhatTheBridgeRefuses fails on each refusal, and the replay of command-rules.jsonl reads each refusal apart from its empty golden.

What surprised me:
- a script under .se meets the command rules on its own text, so the generator builds each guarded word from parts, and prints the table for the patch tool to land
- the git push case met the trunk guard before the git write door, so it left the table for cage-commit-guards-port, and git stash stands in its place
- the name cap reads spec/config/level0.json, so the table's tree carries it, and the Go door reads the same layers
- the recorded log leaves out the two todo cases, since one replay tree holds one plan, and its deny holds the rule's name alone, which the replay reads as its decision
- the replay of the recorded log needs the tree the table names, so the implement gives doorOver a root built from it

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- done_when line one meets TestReplayLogAnswersEveryRecordedLog over command-rules.jsonl, red; line two meets TestTheDoorRefusesWhatTheBridgeRefuses, red; line three is the check the implement answers
- the door's fakes: the tree is a temp folder built off the table, the store is qtest, and every process the bridge runs answers empty on the JS side

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
