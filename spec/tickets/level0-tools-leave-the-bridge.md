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
    hash_before: ca70b6cd3b91d4d91bfb89be6d248c46e6522e7d
    hash_after: 487fa18ad2938528a302f54d7046aed0803ca39f
    inputs:
      - name: ask
        hash: 21eb9ef6b92405e7
        size: 654
      - name: [[spec/tickets/the-bridge-server-leaves]]
        hash: f6037bc7affa843e
        size: 247
    def: 7883b3d10633c780
depends_on: ["tools-keep-their-own-names", "log-report-stop-in-go", "plan-writes-off-go", "prose-tools-answer-in-go", "edit-tools-answer-in-go", "find-and-wait-in-go", "review-spawns-off-the-door", "describe-answers-off-the-door", "grep-glob-answer-off-index"]
---

# Ask

The level zero tools answer off the Go side, so the bridge serves no tool.

The `TOOLS` table in `src/bridge/server.js` serves every `mcp__level0__` tool, and `stepOf` in the cage hands each such call back to the bridge. So the server stays, and [[spec/tickets/the-bridge-server-leaves]] waits.

- every tool the bridge's `TOOLS` table names answers off the Go side, in a case of `src/quack`. `go test ./src/quack/...` decides it
- `stepOf` in `.claude/skills/level0/hooks/cage.js` hands no call to the bridge, in a case of `test/level0/cage.test.js`. `node --test test/level0/cage.test.js` decides it
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

This ticket closes the tools port once nine children move each tool to the Go side. `Action` in src/q/tool/tool.go resolves an `index_` name alone, and the bridge's TOOLS table also answers Grep and Glob. So the port splits by tool family, and the names child lands first.

1. tools-keep-their-own-names: an action answers under the tool name the agent calls.
2. log-report-stop-answer-in-go, plan-writes-off-go, prose-tools-answer-in-go, edit-tools-answer-in-go and find-and-wait-in-go: each family answers off the Go side, and drops its entries from the bridge.
3. review-spawns-off-the-door, after the spawn port, and describe-answers-off-the-door: the review and describe events.
4. grep-glob-answer-off-index: Grep and Glob off the index.
5. This ticket then drops `served` and the bridge branch from `stepOf` in cage.js, the bridge's read path and repost from level0.js, the read tools pull-tool.js registers, and the TOOLS table with its register answer from server.js.

The tool registration moves to the Go tool list, which the hook already registers through `se-index tools`. What I weigh: each family lands while the bridge serves the rest, since a Go result answers before `stepOf` reaches the bridge. I assume the new cage stays off until every child lands.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- .claude/skills/level0/hooks/cage.js: stepOf
- .claude/skills/level0/hooks/level0.js: door, seen, reads, spoke
- .claude/skills/level0/hooks/pull-tool.js: register
- src/bridge/server.js: TOOLS, onToolCall, decide, opensSession

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- test/level0/cage.test.js: stepOf hands no call to the bridge
- src/quack/tools_test.go: every tool the bridge listed stands in the index's tool list

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- .claude/skills/level0/hooks/cage.js
- .claude/skills/level0/hooks/level0.js
- .claude/skills/level0/hooks/pull-tool.js
- src/bridge/server.js
- test/level0/cage.test.js
- src/quack/tools_test.go, new

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the helper opened server.js, cage.js, level0.js, pull-tool.js, tool.go and tools.go, and I checked Action and the TOOLS table myself
- the callers list names what this ticket touches, and the nine children carry the rest
- the first done line meets the tool list case, the second the cage case, and the third the check

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

The tool describe event and the agent answered event read the bridge's tool and review state, so this port answers both off the door too. The split of [[spec/tickets/the-brief-leaves-the-bridge]] leaves them here.
