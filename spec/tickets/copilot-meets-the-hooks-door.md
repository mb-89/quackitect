---
kind: [[ticket]]
state: open
step: implement/tests-green
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
group: go-cage-lands-in-shadow
depends_on: ["the-hooks-door-lands", "the-mcp-module-lands"]
record:
  - step: design/draft
    hand: box d85490c97110e · claude-code-remote
    hash_before: 0bfb55460e29787cc07c811062040be8288ba2cf
    hash_after: 0bfb55460e29787cc07c811062040be8288ba2cf
    inputs:
      - name: ask
        hash: 0d0e968145a856df
        size: 319
    def: 71651f49796eeda4
  - step: design/tests-red
    hand: box d85490c97110e · claude-code-remote
    hash_before: 0e52362b7000993174941a5ead5bbac9a9025e3c
    hash_after: 0e52362b7000993174941a5ead5bbac9a9025e3c
    answered:
      - name: tests
        exit: 1
        said: assertion, 2 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: bd17b44aea6f7261
        size: 2767
    def: 08e16d07b0de477c
  - step: gate
    hand: box d85490c97110e · claude-code-remote · helper-3
    hash_before: a2b8aece880898c88ce9a16951160fa70f087ae9
    hash_after: a2b8aece880898c88ce9a16951160fa70f087ae9
    inputs:
      - name: design/draft
        hash: bd17b44aea6f7261
        size: 2767
      - name: design/tests-red
        hash: a83cb8e7d18bb295
        size: 994
    def: dc4904ab364efa10
  - step: implement/change
    hand: box d85490c97110e · claude-code-remote
    hash_before: de9891281c8b48474497901c5b83d193206b83eb
    hash_after: de9891281c8b48474497901c5b83d193206b83eb
    answered:
      - name: lint
        exit: 0
        said: "src/quack/main.go:147:21: MagicNumber: 3 carries a meaning here. Name it in the constants block at the top of this file,"
    def: f150b8c0dc20fe45
---

# Ask

Copilot reaches the `hooks` IO module, through MCP and `quack hook <event>`, in shadow against `copilot-runtime.js`.

Copilot then meets the same rules as Claude, from one copy.

- `go test ./...` from the root passes
- `./RUNME.sh log --kind shadow` names each decision the two disagree on
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

Copilot reaches the hooks door through a hook verb on the quack binary, and the door compares live.

1. `se-index hook <event>`, in src/quack/hook.go, reads Copilot's hook input off stdin, with `old` beside it. It maps the Copilot event onto the protocol: PreToolUse to tool.call, PostToolUse to classic.PostToolUse, Stop to classic.Stop, and the rest to classic.<name>. It posts event, harness copilot, the session and e to the hooks door off hooks.json, behind its token, and prints the answer. A missing file or a dead port prints nothing and exits 0, so the old path stands.
2. The hooks door gains `Shadow` on its Outside. Where a post carries `old` and Shadow stands, Hook reads OldDecisionOf and NewDecisionOf, and hands a mismatch to Shadow as a shadow row naming the harness. src/quack/main.go wires Shadow to ShadowTo over the session log, so the Claude bridge's live posts compare too.
3. src/scripts/copilot.js, after handle, runs the hook verb where migration.cage reads shadow. Its stdin carries the input and old as {result}, the shape OldDecisionOf reads. It ignores the verb's answer and failure, within the time left.
4. MCP: the mcp module serves every action as a tool. Copilot's own config names that server once the port stands fixed, which rides with go-cage-switches-over.

I assume the Copilot result {deny, block} reads as the bridge's result does, since OldDecisionOf reads both keys alike.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/quack/main.go listensHooks: hooks.Outside takes Shadow
- src/quack/cli.go cliVerbs: names hook
- src/modules/hooks/cage.go ShadowRowOf: a live row carries the harness and no line
- src/modules/hooks/hooks.go Hook: compares a post carrying old
- src/modules/hooks/hooks_test.go doorOver: builds the Outside
- src/quack/hooks_test.go TestTheWiringBindsTheHooksEventsAndTheSessionFolds: builds the Outside
- src/scripts/copilot.js hook mode: runs the verb in shadow

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/quack/hook_test.go TestAHookPostMapsCopilotOntoTheProtocol
- src/quack/hook_test.go TestAHookWithNoDoorPrintsNothing
- src/modules/hooks/cage_test.go TestALivePostDecidedApartWritesAShadowRow
- src/modules/hooks/cage_test.go TestALivePostDecidedAlikeWritesNothing
- test/level0/copilot-shadow.test.js copilot in shadow runs the hook verb with its own answer as old

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first draft

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every file the approach names stands opened: copilot.js, copilot.js under lib, copilot-runtime.js, cage.go, hooks.go, cage-shadow.js, config.js, cli.go, main.go and install.sh, which builds se-index off src/quack
- the callers list names every builder of hooks.Outside and every reader of ShadowRowOf, found by grep
- go test names the Go cases, the log line names the live shadow case, and the check stands as a command

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test src/quack/hook_test.go src/modules/hooks/cage_test.go test/level0/copilot-shadow.test.js

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/quack/hook_test.go
- src/modules/hooks/cage_test.go
- test/level0/copilot-shadow.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Every new case fails on its own assertion over the stubs: the live compare writes no row, the post reads empty, the verb prints nothing, and the script runs no verb. The two cases that pass on the stubs, a post decided alike and a verb with no door, pin the quiet side of the shadow, which the stubs already hold. The door's Outside reaches a same-package test through its from field, so the live cases need no second builder.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- go test meets the Go cases, the live shadow case meets the log line, since the row it writes is the row log --kind shadow reads, and the check stands as a command
- the doors the tests reach: the process door through fakeProc, the disk through fakeDisk, and the loopback listen, which the reach case drives for real

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- copilot-config-names-mcp: the ask routes Copilot through MCP, and the draft hands Copilot's MCP config to go-cage-switches-over, whose ask names no Copilot config, so the MCP half lands nowhere; name the mcp module's server in the config Copilot reads, in shadow, or write that line into the ask of go-cage-switches-over
- copilot-shadow-carries-method: asksText in src/bridge/config.js joins box.method for the tracked file, and neither the it in test/level0/copilot-shadow.test.js nor the it in src/scripts/copilot.js carries method, so shadowsHook throws before it reads migration.cage; give both a method of root

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh lint src/quack/hook.go src/quack/main.go src/modules/hooks/hooks.go src/modules/hooks/cage.go src/scripts/copilot-shadow.js src/scripts/copilot.js

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches the files the draft names, and none past them
- the doors the change reaches have fakes: the process door through fakeProc, the disk through fakeDisk, and the hooks listen, which the reach case drives for real
- the head of src/quack/hook.go and of src/scripts/copilot-shadow.js names the approach, and each function links the ticket
- every fact stands once: the session log path in sessionLog, the standing file in hooks.StandingFile, the decision words in cage.go

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
