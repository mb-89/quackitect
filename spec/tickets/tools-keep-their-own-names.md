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
step: implement/tests-green
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box d891eb165fd6 · claude-code-remote
    hash_before: a5538f7d2957995ef68e2bf54247e0bf08f47397
    hash_after: a5538f7d2957995ef68e2bf54247e0bf08f47397
    inputs:
      - name: ask
        hash: 8b99734c935f88bf
        size: 575
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box d891eb165fd6 · claude-code-remote
    hash_before: f134f21bdcd3905c4415bc879e12e507d6ac1804
    hash_after: f134f21bdcd3905c4415bc879e12e507d6ac1804
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/q/tool fails
    inputs:
      - name: design/draft
        hash: 021163b00bbb23b4
        size: 2284
    def: 08e16d07b0de477c
  - step: gate
    hand: box d89335a442109 · claude-code-remote
    hash_before: 22bee429c20980490d112164d204f7991e415277
    hash_after: 22bee429c20980490d112164d204f7991e415277
    inputs:
      - name: design/draft
        hash: 021163b00bbb23b4
        size: 2284
      - name: design/tests-red
        hash: c62c9216b2cdca11
        size: 842
    def: dc4904ab364efa10
  - step: implement/change
    hand: box d89335a442109 · claude-code-remote
    hash_before: 98430129083892e0543f78220760332a577f1586
    hash_after: 98430129083892e0543f78220760332a577f1586
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
    def: f150b8c0dc20fe45
---

# Ask

A Go action answers under the tool name the agent already calls, such as plan or patch, so a port changes no name the guidance quotes.

`Action` in `src/q/tool/tool.go` resolves an `index_` name alone. So a ported tool takes a new name, and every rule quoting the old one goes stale.

- the tool list names an action under its own tool name, in a case of `src/index`. `go test ./src/index/...` decides it
- `Action` resolves a level zero name to its action, in a case of `src/q/tool`. `go test ./src/q/tool/...` decides it
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

An action takes its own tool name as a registration option, and every surface reads the name off one function.

1. `q` gains `ToolName(name string) Option`, beside `Doc` in src/q/q.go. The registration keeps it, and `Presentation` in src/q/looks.go carries it as `Tool`.
2. `tool.NameOf(store, action)` in src/q/tool/tool.go answers the action's own tool name where it carries one, and `Name(action)` otherwise.
3. `tool.Action` drops the level zero server's prefix off the called name, then matches every action's `NameOf`. An `index_` name resolves as today.
4. The index's tool list in src/index/tools.go, the MCP module's list in src/modules/mcp/mcp.go and its call lookup read `NameOf`. The hooks door reaches `Action` alone, so it reads the new names with no change.
5. `isIndexTool` in .claude/skills/level0/lib/index-tools.js intercepts a listed name, not the prefix alone, so the hook sends a named tool to the index.

What I weigh: the names the guidance quotes stay, at the cost of a second naming path, and one function owns both. I assume no two actions claim one tool name. The tool list refuses a second claim at registration.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/q/q.go: the options, which gain ToolName
- src/q/looks.go: Presentation, which gains Tool
- src/q/tool/tool.go: Name, Action, and NameOf, new
- src/index/tools.go: door.servesTools
- src/modules/mcp/mcp.go: the tool list and the call lookup
- src/modules/hooks/hooks.go: Door.calls, which reads Action
- .claude/skills/level0/lib/index-tools.js: isIndexTool

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/index/tools_test.go: TestTheToolListNamesAnActionUnderItsOwnToolName
- src/q/tool/tool_test.go: TestActionResolvesALevelZeroNameToItsAction
- src/q/tool/tool_test.go: TestAnIndexNameResolvesAsBefore

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/q/q.go
- src/q/looks.go
- src/q/tool/tool.go
- src/q/tool/tool_test.go
- src/index/tools.go
- src/index/tools_test.go
- src/modules/mcp/mcp.go
- .claude/skills/level0/lib/index-tools.js

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- opened tool.go, q.go, looks.go, tools.go, mcp.go, hooks.go and index-tools.js, and each claim holds there
- the callers list names every reader of Name and Action off a grep of the tree
- the first done line meets the tool list case, the second the Action cases, and the third the check

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test src/q/tool/tool_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/q/tool/tool_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The level zero case reds on its own assertion: `Action` refuses a name carrying the server's prefix, so the hooks door resolves no call the harness names that way.

The departure: a case naming the tool name option cannot compile before the option stands, and a compile error proves no red. So the tool list case and the own name case land at implement with the option, each watched red first by a stub answering the index name. What surprises me: the MCP module and the hooks door share `Action`, so the one fix reaches both.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the second done line meets the level zero case now, and the first meets the tool list case at implement, as the departure says
- the case reaches the store the package's fixture builds, and no door

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept

What I weigh: the approach answers the ask with one naming function, `NameOf`, which the tool list, the MCP list and `Action` all read. Every caller the draft names stands at the line it cites, and `hooks.go` reaches `Action` alone. The second done line reds on its own assertion in `TestActionResolvesALevelZeroNameToItsAction`. The first done line's case cannot compile before `ToolName` stands, so it lands at implement, watched red first by a stub, as the tests-red note says. What I assume: the implement step adds a case for `isIndexTool` beside the Go cases, since its checklist asks a fake of every door the change reaches.

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh lint src

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches src/q, src/q/tool, src/index and src/modules/mcp, each inside the draft's size. index-tools.js stays, since no action claims an own name yet
- the change reaches no door, and each case builds its own catalog through q
- each new function carries a pointer at spec/tickets/tools-keep-their-own-names
- the server's prefix stands once in Go as tool.Served, and NameOf alone answers a tool name

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
