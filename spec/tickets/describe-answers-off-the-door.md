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
step: implement/change
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box d89335a442109 · claude-code-remote
    hash_before: 64eccaa6617ea1230ee52eeca9692f4cb0363e03
    hash_after: 64eccaa6617ea1230ee52eeca9692f4cb0363e03
    inputs:
      - name: ask
        hash: 4ecabed2a10455d5
        size: 406
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box d89335a442109 · claude-code-remote
    hash_before: 67594e830bec2137987f0ea9ac15a6c9fe971184
    hash_after: 67594e830bec2137987f0ea9ac15a6c9fe971184
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/modules/hooks fails
    inputs:
      - name: design/draft
        hash: 93c57888817cc59e
        size: 2505
    def: 08e16d07b0de477c
  - step: gate
    hand: box d894eee95148f · claude-code-remote
    hash_before: 5968e1c87b16b7b7b5fc9b04706b942b58dd7b47
    hash_after: 5968e1c87b16b7b7b5fc9b04706b942b58dd7b47
    inputs:
      - name: design/draft
        hash: 93c57888817cc59e
        size: 2505
      - name: design/tests-red
        hash: 1337bb662cc08e0a
        size: 785
    def: dc4904ab364efa10
---

# Ask

The hooks door answers the tool describe event with the verb line the bridge adds to the Bash tool.

`onDescribe` in the bridge writes that line alone. An agent reads no verb in the tool's description once the bridge leaves.

- a tool describe of Bash answers the verb line, in a case of `src/modules/hooks`. `go test ./src/modules/hooks/...` decides it
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

The door answers a describe of Bash with the verb line, off the tool names the store lists, as `onDescribe` in src/bridge/bash.js answers it.

1. A new src/modules/hooks/describe.go ports `VERBS`, `TOOL_VERBS`, `toolOf` and `verbLine` from .claude/skills/level0/lib/verb-line.js. It reads the tool names off the store through `tool.NameOf`, so the line names what the index lists, where the bridge ran the binary for the same list.
2. `Door.Hook` in hooks.go answers a `tool.describe` naming Bash with an after effect named `description`, where no other effect answers. Any other tool passes.
3. `stepOf` in .claude/skills/level0/hooks/cage.js maps a named after on `tool.describe` to `{ answer: { after: { [name]: text } } }`, the shape the bridge's describe answer takes.
4. A case table, test/replay/cage/verb-line-cases.json, holds `verbLine` over a few tool lists. A case in test/level0/verb-line.test.js writes it off the JavaScript, and the Go case reads it, so the two lines stay one.

The bridge keeps its describe door until the-brief-leaves-the-bridge flips the doors. What I weigh: the store lists the same tools the binary prints, so the Go line reads them in place. I assume a describe reaches the door with the tool's name under `tool`, as the bridge reads it.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/modules/hooks/hooks.go: Door.Hook, at a tool describe
- src/modules/hooks/describe.go, new: the verb line
- .claude/skills/level0/hooks/cage.js: stepOf, which maps a named after on a describe
- src/bridge/bash.js: onDescribe, which the flip retires

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/modules/hooks/describe_test.go: TestADescribeOfBashAnswersTheVerbLine
- src/modules/hooks/describe_test.go: TestADescribeOfAnotherToolPasses
- test/level0/verb-line.test.js: the verb line matches its case table
- test/level0/cage.test.js: a named after on a describe answers the description

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/modules/hooks/describe.go, new
- src/modules/hooks/describe_test.go, new
- src/modules/hooks/hooks.go
- .claude/skills/level0/hooks/cage.js
- test/level0/cage.test.js
- test/level0/verb-line.test.js
- test/replay/cage/verb-line-cases.json, new

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- opened onDescribe in bash.js, verbLine and toolOf in verb-line.js, indexToolsOf, stepOf in cage.js and Door.Hook, and each claim holds there
- the callers list names the door, the new file, the cage step and the bridge door the flip retires
- the first done line meets the two describe cases, and the second the check at tests-green

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test src/modules/hooks/describe_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/modules/hooks/describe_test.go
- test/level0/cage.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The Bash case reds on both rows of the table: the door answers pass to a describe. The cage case reds too, since stepOf turns a named after into a heading line where the describe wants an object. The JavaScript pin passes, so the table holds the line the bridge gives today.

What surprises me: the other-tool case passes already, since the door answers nothing to a describe. It guards the change against naming a description on every tool.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the first done line meets the Bash case and the cage case, and the second the check at tests-green
- the Go cases build their own store through qtest, and reach no door past it

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept

The approach answers the ask: the door answers a describe of Bash with the verb line, and `stepOf` maps the named after to the describe shape the bridge takes today. Checked at src/bridge/bash.js onDescribe, src/bridge/server.js, verb-line.js, cage.js stepOf and hooks.go Door.Hook, and each claim holds. The first done_when line meets the red Bash case in describe_test.go and the red cage case, and the check decides the second at tests-green.

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
