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
    hand: box d891eb165fd6 · claude-code-remote
    hash_before: fb75d6cfa4a3f0490a76f5f5544a6fd440a06e39
    hash_after: fb75d6cfa4a3f0490a76f5f5544a6fd440a06e39
    inputs:
      - name: ask
        hash: e31e3e8fdb75c4ab
        size: 676
      - name: [[spec/tickets/the-brief-leaves-the-bridge]]
        hash: 19bd52b73471bf7a
        size: 735
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box d89335a442109 · claude-code-remote
    hash_before: 1ae6ff21c0bada5045000bdecef7727601b6ce19
    hash_after: 1ae6ff21c0bada5045000bdecef7727601b6ce19
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/modules/hooks fails
    inputs:
      - name: design/draft
        hash: d58e9210ca6b388b
        size: 2294
    def: 08e16d07b0de477c
depends_on: ["brief-answers-off-the-door", "prompt-answers-off-the-door"]
---

# Ask

The hooks door puts the helper layer into a spawned helper's prompt, so a helper reads its rules with no bridge.

`onAgentSpawn` in the bridge builds the layer through `forHelper`, `standingLayer` and `layersOf`. Without a port a helper runs with no rule once [[spec/tickets/the-brief-leaves-the-bridge]] flips the doors.

- an agent spawn answers an `event` effect carrying the helper layer, in a case of `src/modules/hooks`. `go test ./src/modules/hooks/...` decides it
- the Go layer and the JavaScript layer read one case table, in a case of `test/level0/cage.test.js`. `node --test test/level0/cage.test.js` decides it
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

The door answers an agent spawn with the spawn's own event, its prompt wrapped in the layer the spawn's kind reads, as `onAgentSpawn` in src/bridge/guidance.js does.

1. The brief package `src/modules/hooks/brief`, which brief-answers-off-the-door adds, gains the layer: `layersOf`, `standingLayer` and `forHelper` in .claude/skills/level0/lib/guidance.js, ported over the notes it already reads. A spawn naming no kind takes the helper layer, as `layerHere` does.
2. `Door.Hook` in hooks.go answers an agent spawn of the main agent with the event effect prompt-answers-off-the-door adds. The effect carries the spawn's fields with the wrapped prompt. A kind with no layer answers pass.
3. `stepOf` in cage.js already maps the event effect once the prompt port lands, so the cage needs no change here.
4. One case table holds the layer: the JavaScript builders write each row's layer, and the Go builder answers the same.

The bridge keeps its spawn door until the-brief-leaves-the-bridge flips the doors, so this lands alone. What I weigh: the layer and the brief read one set of notes, so one package owns both. I assume the spawn event carries the kind and the prompt as the bridge reads them.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/modules/hooks/hooks.go: Door.Hook, at an agent spawn
- src/modules/hooks/brief: the note reader, which gains the layer
- .claude/skills/level0/hooks/cage.js: stepOf, which maps the event effect
- src/bridge/guidance.js: onAgentSpawn, which the flip retires

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/modules/hooks/spawn_test.go: TestASpawnAnswersItsPromptWrappedInTheHelperLayer
- src/modules/hooks/spawn_test.go: TestASpawnOfAKindTakesThatKindsLayer
- test/level0/cage.test.js: the JavaScript layer matches the case table

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/modules/hooks/brief/layer.go, new
- src/modules/hooks/hooks.go
- src/modules/hooks/spawn_test.go, new
- test/replay/cage/layer-cases.json, new
- test/level0/cage.test.js

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- opened onAgentSpawn and layerHere in the bridge, and layersOf, standingLayer and forHelper in the lib, and each claim holds there
- the callers list names the door, the brief package, the cage's step and the bridge door the flip retires
- the first done line meets the spawn cases, the second the shared table, and the third the check

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test src/modules/hooks/spawn_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/modules/hooks/spawn_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The two Go cases red on their own assertion: the door answers pass to an agent spawn, where each row of layer-cases.json wants an event carrying the wrapped prompt. The JavaScript case in cage.test.js rebuilds every row with the lib's builders and passes, so the table holds what the bridge gives today.

What surprises me: stepOf already maps the event effect the prompt port added, so the cage needs no red case of its own here.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the first done line meets the two spawn cases, the second the table case in cage.test.js, and the third the check at tests-green
- the Go cases build a temp tree off each row and reach no door past the package's own fixtures

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
