---
kind: [[ticket]]
state: open
step: implement/change
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
    hand: box eabbd46a6a23 · claude-code-remote
    hash_before: c67f136b6c069fae8be59de68e3414ffa731c2ac
    hash_after: c67f136b6c069fae8be59de68e3414ffa731c2ac
    inputs:
      - name: ask
        hash: 5087e2972354c89a
        size: 1091
    def: c01ae0f2ace0cecb
  - step: design/tests-red
    hand: box eabbd46a6a23 · claude-code-remote
    hash_before: 104cd4382ed985a9fced58c23ccda0eea0ea00a9
    hash_after: 104cd4382ed985a9fced58c23ccda0eea0ea00a9
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/quack fails
    inputs:
      - name: design/draft
        hash: 44f026d026534d58
        size: 1925
    def: 08e16d07b0de477c
  - step: gate
    hand: box eabbd46a6a23 · claude-code-remote · helper-4
    hash_before: cffca6022d4d86c545747e6beb8327e5230023a2
    hash_after: cffca6022d4d86c545747e6beb8327e5230023a2
    inputs:
      - name: design/draft
        hash: 44f026d026534d58
        size: 1925
      - name: design/tests-red
        hash: d1dd9f88b5c81bd1
        size: 918
    def: dc4904ab364efa10
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
<!-- view, as text: the view the owner reads the change in and the number there, in the owner's words, or none -->
<!-- from, as text: handover where the ask comes off a handover line, so the owner reads it first, or none -->

gain: Level zero carries only what Claude Code lacks a standard road for, and the design note names the reason for each piece that stays. A reader sees why the tree departs from the standard plugin shape, and a maintainer drops a piece the day the standard catches up.

breaks: Leftover switches and boot hooks from before mods reached general availability outlive their need, and nobody knows which one is safe to drop.

done_when:
- a probe on a fresh clone, on Claude Code 2.1.287 or later, says whether `CLAUDE_CODE_ENABLE_FUNCTION_HOOKS` in `.claude/settings.json` is still needed; the env stays only where the probe needs it, and the probe's output stands under Discussion
- each SessionStart boot hook either goes, replaced by a standard mechanism, or stays with its reason in `spec/design_output/level0`
- `spec/design_output/level0` says why level zero stays a mod of function hooks over settings command hooks alone: the handover's self-clear runs `$.command.run('/clear')` then `$.prompt.submit`, and no settings hook does that
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

The settings already carry no switch, and the design note section What stays off the standard road already gives the reason for the function hooks over settings command hooks. Three gaps close here. First, the start verb in src/quack/verb_start.go still counts the plugin loaded only where the switch is set, so a desk session outside plan mode meets the start refusal although the manifest stands; the verb reads the manifest alone. Second, the boot hook row in that section gives the cloud install its reason and leaves out the desk road, where boot.js hands the hook input to the start verb; the row names both roads and why each stays: the client scans plugins before any hook of a mod runs, and a session loading no plugin has no mod hook to refuse it. Third, the cold probe runs a fresh clone of this commit on this box client with no switch, and its output goes under Discussion.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/scripts/boot.js asks, which runs the start verb on a desk session start
- src/quack/verb_start.go startVerb, registered as the start verb
- src/modules/hooks/start.go StartRefusal, which the start verb calls

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/quack/verb_start_test.go TestStartStopsADeskSessionWritingWithNoPlugin, whose case of a manifest with no switch flips to a pass, and whose cases set no switch

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/quack/verb_start.go
- src/quack/verb_start_test.go
- spec/design_output/level0.md
- spec/tickets/level0-drops-what-standard-replaces.md

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

I opened verb_start.go, start.go, boot.js, the settings and the design note section, and each claim stands there
the callers list names boot.js asks, startVerb and StartRefusal, the only readers of the switch past tests
the probe line meets the cold probe output, the boot hook line meets the design note row, the function hooks line meets the standing row, and the check line meets the check
the approach adds no config key

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test src/quack/verb_start_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/quack/verb_start_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The start verb prints its stop for a desk session in default mode where the manifest stands and no switch is set, so the case fails on its own assertion. The cold probe passes whole on a fresh clone with client 2.1.292 and no switch, which the Discussion carries. What surprises me: main dropped the switch from the settings while the start verb still read it, so every desk session outside plan mode met the start refusal.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the probe line meets the cold probe output under Discussion, the boot hook line and the function hooks line meet a checkpoint the gate answers off the design note, the start verb fix meets the flipped case, and the check line meets the check
the start test reaches the root, input, environment and disk through startFake, and the cold probe runs a real clone by design

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- boot-hook-names-desk-road: spec/design_output/level0.md section The boot hook still says that off a cloud box boot.js runs nothing, while src/scripts/boot.js asks hands the hook input to the start verb there; the implement step rewrites that sentence beside the row it already fixes in What the standard road leaves, so the note names both roads in one place and the row points at it

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

The cold probe, `./RUNME.sh probe cold`, clones the work branch fresh and runs client 2.1.292 headless once, with no `CLAUDE_CODE_ENABLE_FUNCTION_HOOKS` in its environment or in `.claude/settings.json`. The mod loads, so the switch stays nowhere. Its output, with the tool list cut to its first name:

    The install answers 0.
    PASS hook: bridge row, no index answered, so the bridgehead starts one
    PASS server: context row, 2 block(s) reach the session
    PASS rules: context row, level0-tools level0-canary
    PASS tools: mcp__level0__check_answer, ...
    PASS canary: the first text opens on it, once: level0 holds this session: 75 rules, 6 notes, the stop hook on.
    PASS quiet: no row says the server answers nothing past the rules
