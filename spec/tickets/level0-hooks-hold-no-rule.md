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
        checklist: ["every file, function and verb the approach names stands opened, and each claim checked there", "the callers list names every caller of what the approach changes", "every done_when line names the test that decides it", "every config key the approach adds names each default file it lands in"]
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
process_hash: c671f20a6ae2a4a6
group: level-zero-becomes-a-typed-mod
depends_on: ["level0-hooks-move-to-typescript"]
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box 5090e9523847 · claude-code-remote
    hash_before: 320ccc21b73ed9c1728ecaa1e7c5aae01d93ea96
    hash_after: 320ccc21b73ed9c1728ecaa1e7c5aae01d93ea96
    inputs:
      - name: ask
        hash: 780972e44202b6f6
        size: 888
    def: c01ae0f2ace0cecb
  - step: design/tests-red
    hand: box 5090e9523847 · claude-code-remote
    hash_before: 5ab6815c7d9fdc5ec7cff63e1d50397ab10f493a
    hash_after: 5ab6815c7d9fdc5ec7cff63e1d50397ab10f493a
    answered:
      - name: tests
        exit: 1
        said: assertion, 5 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: cae73f308ee5debe
        size: 3833
    def: 08e16d07b0de477c
  - step: gate
    hand: box 5020756b3dd3 · claude-code-remote
    hash_before: 91e5eba70066a8abc5f12340c3ae2e0c112a1580
    hash_after: 91e5eba70066a8abc5f12340c3ae2e0c112a1580
    inputs:
      - name: design/draft
        hash: cae73f308ee5debe
        size: 3833
      - name: design/tests-red
        hash: 588124fc0ab64b08
        size: 1071
    def: dc4904ab364efa10
  - step: implement/change
    hand: box 5020756b3dd3 · claude-code-remote
    hash_before: 3a29744c31f0a8c8bd5bc30de678c81ef46fdfac
    hash_after: e8043fe24e7a2f969889b0e83f1c5934da640bf7
    answered:
      - name: lint
        exit: 0
        said: "test/level0/outside-hand.test.js:14:1: correctness/noUnusedVariables: This variable CLOUD is unused."
    def: f150b8c0dc20fe45
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
<!-- view, as text: the view the owner reads the change in and the number there, in the owner's words, or none -->
<!-- from, as text: handover where the ask comes off a handover line, so the owner reads it first, or none -->

gain: Each hook reads its event, hands the work to Go through the bridge server, an MCP tool, or `$.process.run` of a verb, and returns what Go answers. A rule then lives in Go alone, so it holds the same in a hook, a verb and the server, and the hook tests read plumbing alone.

breaks: Rules stay split between the TypeScript hooks and Go, so the two drift, and a hook test has to know a rule to test a door.

done_when:
- no file under `.claude/skills/level0/hooks/` decides a rule: the command words the cage reads, the shape merge and every other decision call Go, and each moved rule keeps its Go test
- the hook tests stub the Go door through `on` and read only what the hook passes and returns
- `./RUNME.sh check` exits 0

view: none

from: none

The javascript-leaves group ports `lib/` itself; this ticket moves only the decisions standing inside the hooks module and its glue.

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

Each decision left in the hooks moves to one Go owner, and the hook keeps the plumbing.

- The guard while the door stands down: a cage verb on the index binary reads the event and its input as JSON on stdin, and prints a deny with the refusal text where the call stays guarded. Guarded, recovers, wordsOf, commits, pushesWork, killsRuntime and refusedText move from cage.ts to src/modules/hooks/guard.go. The hook runs the verb through $.process.run on a tool.call while no door answers, since the binary stands while the server is down. A verb that answers nothing passes the call, and the fall line the session already meets says the cage stands down.
- The step: the door answers each post with a step beside its effects, built by StepOf in src/modules/hooks/step.go, so stepOf leaves cage.ts and the hook reads answer.step. A back post says so in the post, and the door asks back on the first post alone.
- The merge: the hook posts what next(e) answered and the adds to POST /merge on the door, and Merged in step.go answers the merged value. merged leaves shape.ts.
- The doored events: Standing in listen.go names them under events, and the hook reads the list off the standing file. With no standing file, the start road runs once and a tool.call meets the cage verb.
- The old door trim leaves: textsOf, rowOf, beforeIn, trimmed, before and readsRaw go, because every door now trims the raw rows (fold.go).
- The Copilot door reads the same Go pieces: answer.step and the cage verb.
- The stub bridgehead keeps its vehicle roads, since no binary stands before its clone, and the design note says so.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- .claude/skills/level0/hooks/level0.ts seen, door, doorAsk, doorSpawns, promptOf, trimmed, before, readsRaw
- .claude/skills/level0/hooks/cage.ts doors, stepOf, guarded, recovers, wordsOf, refusedText, postOf
- .claude/skills/level0/hooks/shape.ts merged
- .claude/skills/level0/hooks/transcript.ts textsOf, rowOf, beforeIn
- src/scripts/copilot-door.js answers
- src/modules/hooks/listen.go Listen and serves
- src/modules/hooks/hooks.go Door.Hook, Post and Answer
- test/level0/cage.test.js, shape.test.js, transcript.test.js, caged-door.test.js, door-clear.test.js, door-spawn.test.js, hooks.test.js, copilot.test.js

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/quack/verb_cage_test.go TestCageVerb
- src/modules/hooks/guard_test.go TestGuarded and TestRecovers, ported from test/level0/cage.test.js
- src/modules/hooks/step_test.go TestStepOf and TestMerged, ported from test/level0/cage.test.js and shape.test.js
- src/modules/hooks/listen_test.go TestStandingNamesEvents
- test/level0/caged-door.test.js the hook asks the cage verb while the door stands down, and reads the step the door answers

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first
- the gate of level0-hooks-move-to-typescript hands this ticket the stub bridgehead rules, and they stay in the stub because no binary stands before its clone

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- .claude/skills/level0/hooks/level0.ts
- .claude/skills/level0/hooks/cage.ts
- .claude/skills/level0/hooks/shape.ts
- .claude/skills/level0/hooks/transcript.ts
- src/scripts/copilot-door.js
- src/modules/hooks/guard.go
- src/modules/hooks/guard_test.go
- src/modules/hooks/step.go
- src/modules/hooks/step_test.go
- src/modules/hooks/listen.go
- src/modules/hooks/hooks.go
- src/quack/verb_cage.go
- src/quack/verb_cage_test.go
- the hook tests under test/level0 named in callers
- spec/design_output/level0.md

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

cage.ts, shape.ts, transcript.ts, level0.ts, copilot-door.js, listen.go and Door.Hook in hooks.go stand opened, and each named function stands there
the callers list names every importer of the hook files, from a search over src, test and the plugin
the first done_when line meets the Go tests above, the second the caged-door case, and the third ./RUNME.sh check
the approach adds no config key

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test src/modules/hooks/guard_test.go src/modules/hooks/step_test.go src/modules/hooks/listen_test.go src/quack/verb_cage_test.go test/level0/caged-door.test.js

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/modules/hooks/guard_test.go
- src/modules/hooks/step_test.go
- src/modules/hooks/listen_test.go
- src/quack/verb_cage_test.go
- test/level0/caged-door.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The Go tests port every guard, step and merge case from test/level0/cage.test.js and shape.test.js, and fail on stubs that return nothing. Five caged-door cases fail on the hook today: the cage verb, a pass the verb leaves, the step off the door, the merge post and the doored events. The merge body names said and adds, and the cage verb reads event and e on stdin when it runs.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

TestGuarded, TestRecovers, TestWordsOf, TestRefusedText, TestStepOf, TestMerged, TestStandingNamesEvents and TestCageVerb decide the first done_when line, the caged-door cases the second, and the check the third
the Go tests reach no door, and the caged-door cases fake the fetch, the disk and the process

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept
- the approach moves guard, step, merge and the doored events to one Go owner each, and the hooks keep plumbing: done_when line one
- guard_test.go, step_test.go, listen_test.go and verb_cage_test.go stand red on stubs and decide line one; caged-door.test.js stands red and decides line two; ./RUNME.sh check decides line three
- the main merge removes cage.test.js cases that drove the deleted guidance door, and the Go tests keep every moved rule

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh lint

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change touches the files the size list names, the hook tests the callers list names, and src/scripts/copilot.js, which hands the Copilot door its run
the cage verb meets a stub in caged-door.test.js and copilot.test.js, and the door post and merge meet a stub of http
each Go function and each hook function names level0-hooks-hold-no-rule beside its approach
the event list stands in Doored in listen.go, the step and the merge in step.go, and the design note points at them

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

The gate of [[spec/tickets/level0-hooks-move-to-typescript]] hands this ticket the rules the stub bridgehead holds: the vehicle roads, the home order and the clone, in `src/stub/.claude/skills/level0/hooks/bridgehead.ts`.
