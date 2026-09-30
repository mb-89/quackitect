---
kind: [[ticket]]
state: open
step: gate
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
group: go-cage-switches-over
depends_on: [cage-rules-port-before-switch, cage-write-door-port, cage-call-holds-port, cage-hold-drops-port, cage-commit-guards-port, cage-stop-rules-port]
record:
  - step: design/draft
    hand: box d889b5fde3d5 · claude-code-remote
    hash_before: 9614cdea0be1af1c3f377c9c1a4117af04bc2fde
    hash_after: 1abc4435616d9d79e7e6b95313425478d01d5998
    inputs:
      - name: ask
        hash: 2e1097fa7d39ff56
        size: 535
      - name: [[spec/rationales/the-cage-refuses-while-down]]
        hash: e54c50d8ed5defb6
        size: 1649
      - name: [[spec/tickets/the-hook-log-loses-lines]]
        hash: 810c4e970082b08d
        size: 2110
    def: 71651f49796eeda4
  - step: design/draft
    hand: the engine
    stale: [[spec/tickets/the-hook-log-loses-lines]]
  - step: design/draft
    hand: box d88b829f8cd8 · claude-code-remote
    hash_before: 34577aa8ab311b777f1fa21d5fede99efcc3ac94
    hash_after: 34577aa8ab311b777f1fa21d5fede99efcc3ac94
    inputs:
      - name: ask
        hash: 2e1097fa7d39ff56
        size: 535
      - name: [[spec/rationales/the-cage-refuses-while-down]]
        hash: e54c50d8ed5defb6
        size: 1649
      - name: [[spec/tickets/the-hook-log-loses-lines]]
        hash: e12c15cf9e654d97
        size: 791
    def: 71651f49796eeda4
  - step: design/tests-red
    hand: box d88f0683f2d7 · claude-code-remote
    hash_before: 9629736b844117b21ddea962a14ad4ee84f4cb56
    hash_after: 9629736b844117b21ddea962a14ad4ee84f4cb56
    answered:
      - name: tests
        exit: 1
        said: assertion, 2 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: c6867e111a3b6fba
        size: 2908
    def: 08e16d07b0de477c
---

# Ask

`migration/config/slices/cage` moves to `new`. While the index stands down, the cage refuses, and the refusal names the alarm. [[spec/rationales/the-cage-refuses-while-down]] names the chapters this rewrites.

A fault then shows on the first call, and gets fixed early.

- a case stops the fake index, and reads a refusal naming `session/alarms`
- a case lets the index fall while another writer appends to the session log, and reads every row kept. [[spec/tickets/the-hook-log-loses-lines]] shows the loss
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

The hook module answers off the hooks IO module once migration.cage reads new, and refuses a guarded call while that module stands down. The key moves last, after every port child in the group closes and the cage shadow reads clean, which depends_on holds.

1. Under new, ask in .claude/skills/level0/hooks/level0.js posts {event, e, session, root, fill} to POST /hook on the port and token .se/.runtime/hooks.json names, and maps the effects in order: pass hands e on, event hands the changed event on, after merges its blocks, result answers the call, block holds the Stop. Under old and shadow the post goes to the bridge as today.
2. Down means no standing file, a post the port refuses, or index/health carrying a lease past its term. The hook module then runs quack start once through $.process.run, and posts again.
3. Still down, a guarded call gets a deny naming session/alarms, the alarm it reads there where the index answered last, and the command that clears it. A guarded call is every tool.call outside Read, Grep, Glob and the index tools, whose calls keep the dead line. Every other event passes, per spec/rationales/the-cage-refuses-while-down.
4. wrote appends its row through $.process.run with a node append, and keeps the read and write back only where the host offers no process, so a row another writer appends stays.
5. src/bridge/cage-shadow.js posts nothing under new, since the hook module posts itself.
6. spec/config/level0.json moves migration.cage to new, and the chapters the rationale lists name the refusal in place of the pass.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/bridge/server.js: the tool.call road calling shadowsCage
- src/bridge/cage-shadow.js: shadowsCage
- .claude/skills/level0/hooks/level0.js: seen, ask, fell, down, starts, probes and clears, each calling ask or wrote
- .claude/skills/level0/hooks/level0.js: wrote
- spec/config/level0.json: migration.cage, read by asksText in src/bridge/config.js and the config verb

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- test/level0/bridgehead.test.js: a stopped hooks door refuses a guarded call and names session/alarms
- test/level0/bridgehead.test.js: a read passes while the hooks door stands down
- test/level0/bridgehead.test.js: a row another writer appends while the index falls stays in the session log
- test/level0/cage-shadow.test.js: under new the bridge posts no shadow
- ./RUNME.sh check exits 0, for the third done_when line

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- the stale mark: cage-rules-port-before-switch closed as an umbrella before its children, so depends_on now names each port child as well

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- opened level0.js seen, ask, fell, down, wrote, cage-shadow.js, server.js line 516, lease.go AlarmsName and the rationale, and each claim holds there
- the callers list names every caller of ask, wrote and shadowsCage, and the one reader of the key
- done_when line one meets the first test, line two the third, and line three the check

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test test/level0/bridgehead.test.js

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- test/level0/bridgehead.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The refusal case stands red on its own assertion: today the hook passes every call while no server answers, so the call reaches the harness and no line names session/alarms. The raced row case stands red too. The hook reads the session log, another writer appends, and the hook writes the log back over that row.

The read case and the shadow case pass today, and they hold the edges of the change: a read passes while the door stands down, and the bridge posts no shadow under new.

The surprise: the hook module reads no config today, so the cage key reaches it through spec/config/level0.json on the hand disk, beside the standing file the hooks door writes.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the first done line meets the refusal case, the second the raced row case, and the third the check at tests-green
- the doors the tests reach have fakes: the fake disk, a process fake that appends where the hook runs a node append, and an http fake whose every post falls

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

**The order.** This ticket waits on [[spec/tickets/cage-rules-port-before-switch]]. Its ask moves the cage key to `new`, and the Go door refuses nothing the bridge refuses until the rules port. The ticket `shadow-evidence-5-6` on the branch `claude/shadow-evidence-5-6` names the refusals the door passes. Weighed: the switch first leaves the cage open, and the port first costs this ticket a wait alone.
