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
depends_on: ["level0-hooks-hold-no-rule"]
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box eabbd46a6a23 · claude-code-remote
    hash_before: 64d4538033df17782bae9f8691fb71261064b76d
    hash_after: 64d4538033df17782bae9f8691fb71261064b76d
    inputs:
      - name: ask
        hash: ad7e6f9195dc3f5a
        size: 1398
    def: c01ae0f2ace0cecb
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
<!-- view, as text: the view the owner reads the change in and the number there, in the owner's words, or none -->
<!-- from, as text: handover where the ask comes off a handover line, so the owner reads it first, or none -->

gain: The mod's tests run on `claude plugin test`, as `*.test.ts` files under `.claude/skills/level0/tests/` importing `claude-code/testing`. They raise events through the kit's own `$`, drive time through `mock.clock`, raise settings events through `$.classic`, and stub every door through `on`, so they test what the hooks do and nothing of how. The engine is Claude Code's own, so a test passing means a session behaves the same, and our harness faking Claude Code goes.

breaks: The hook tests keep a home-made engine that drifts from the real one, and the test lines keep outgrowing the code they cover.

done_when:
- `./RUNME.sh check` runs `claude plugin test .claude/skills/level0` and fails where it fails
- every test under `test/level0` that imports a file under `.claude/skills/level0/hooks/` is replaced by a `*.test.ts` through the hooks' interface, and deleted
- the helpers under `test/level0` faking the engine for the hooks are deleted, and no test imports them
- the lines of `.claude/skills/level0/tests/` stand at or under the lines of the code the hooks entry reaches, counted by a check part
- `./RUNME.sh check` exits 0

view: none

from: none

Tests under `test/level0` covering `lib/` files the hooks entry never reaches, and `src/` code, test no part of the mod. The javascript-leaves group retires them with the code it ports to Go, and this ticket leaves them standing.

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

The hook tests move onto the kit Claude Code ships. Each case raises an event on the kit engine and stubs every door beneath the plugin through on, answering value or deny. A probe test on this box shows the kit loads the real plugin, runs the cage road, and refuses an import past the plugin folder. Three test files under .claude/skills/level0/tests take the behaviors. door.test.ts covers a standing door: the hook post, the step answers, the merge post, the events the standing file leaves alone, the ask back on agent.spoke, the spawn and its back post, the clear at the turn completion or on the mock clock, and the step text on turn.said. down.test.ts covers a door standing down: the start road once with its span, the cage verb deny and pass, the fall line said once and again after a recovery, the quiet session start, and the log row through the log verb or the session file. pull.test.ts covers the pull tool: the tools it registers, the verb it runs, and the one spawn. A world.ts beside them holds the stubs the three share. The eleven test files under test/level0 that import a hook module go, with the inline fakes of the engine they carry. hooks.test.js keeps its boot cases, and reads STARTING off the line of level0.ts that sets it, since a kit test reaches no file past the plugin. A new check part, plugin-tests in src/quack/check.go, runs claude plugin test over the plugin and fails where it fails. It passes with a line where claude stands nowhere, as the plugin part does. Then it counts the lines of the files under tests against the lines of every file the hooks entry reaches, following relative imports from the modules hooks.json names, and fails where the tests run longer.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/quack/check.go partsOf, which names the new plugin-tests part
- src/quack/check_test.go the plugin-tests cases, which drive pluginTestsHold
- test/level0/hooks.test.js the boot hook span case, which reads STARTING

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- .claude/skills/level0/tests/door.test.ts the cases of a standing door
- .claude/skills/level0/tests/down.test.ts the cases of a door standing down
- .claude/skills/level0/tests/pull.test.ts the cases of the pull tool
- src/quack/check_test.go the plugin-tests part runs the kit over the plugin, and passes where claude stands nowhere
- src/quack/check_test.go the plugin-tests part fails where the tests run longer than the code the entry reaches

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/quack/check.go
- src/quack/check_test.go
- .claude/skills/level0/tests/door.test.ts
- .claude/skills/level0/tests/down.test.ts
- .claude/skills/level0/tests/pull.test.ts
- .claude/skills/level0/tests/world.ts
- test/level0/hooks.test.js
- test/level0/cage.test.js deleted
- test/level0/caged-door.test.js deleted
- test/level0/clear.test.js deleted
- test/level0/door-clear.test.js deleted
- test/level0/door-spawn.test.js deleted
- test/level0/index-tools.test.js deleted
- test/level0/level1.test.js deleted
- test/level0/pull-spawn-hook.test.js deleted
- test/level0/start-road.test.js deleted
- test/level0/transcript.test.js deleted
- spec/design_output/level0.md

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

I opened the hooks, hooks.json, each hook test and helper under test/level0, check.go partsOf and checkDoors, and the kit types, and a probe test ran the kit on the plugin
the callers list names partsOf, the check cases and the hooks.test.js span case, the only readers of what changes
the first line meets the plugin-tests case, the second and third meet the deleted files and a check part, the line count meets its plugin-tests case, and the last meets the check
the approach adds no config key

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
