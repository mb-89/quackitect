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
group: level-zero-smoke
step: gate
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box a694567529c5 · claude-code-remote
    hash_before: fb5e4eeffc38f2e329d3bbff1d61e517640f319f
    hash_after: fb5e4eeffc38f2e329d3bbff1d61e517640f319f
    inputs:
      - name: ask
        hash: 015d35ecc32e1941
        size: 508
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box a694567529c5 · claude-code-remote
    hash_before: b9f7e4c21686cf5c1793461d51997171ced44646
    hash_after: b9f7e4c21686cf5c1793461d51997171ced44646
    answered:
      - name: tests
        exit: 1
        said: assertion, 3 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: f921a3ccf020b7c5
        size: 2014
    def: 08e16d07b0de477c
---

# Ask

The dry probe runs at any revision, so the merge that breaks level zero shows in one call. Auto-merge stays the one road to main.

A hand writes a probe loop over merges each time main goes red, and a hand merge skips the road the owner asks for.

- `go test ./src/quack/` passes a case where `probe dry --at <rev>` runs the dry probe at that revision.
- `go test ./src/quack/` passes a case that reads a deny on the merge tool of the GitHub connector in `.claude/settings.json`.
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

Two parts. The probe at a revision: the Go probe verb reads --at <rev> on the dry road, resolves it with git rev-parse --verify <rev>^{commit} through its process door, refuses a revision git cannot resolve with one line and no node, and hands the entry --at <sha>. probeDry in src/scripts/probe-dry.js reads --at and hands it to coldTree in src/scripts/probe-cold.js, which checks the clone out at that commit before the install, and takes no working change beside it, since the two name different trees. One call then runs level zero at any merge on main. The guard on merges: .claude/settings.json denies mcp__github__merge_pull_request, so no session merges by hand and auto-merge stays the one road to main, and a Go case reads that deny off the tracked file, as config_test reads spec/wiring.yaml.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/quack/probe_verb.go probeVerb and probeDry
- src/quack/check.go level0Runs (hands no --at, unchanged)
- src/scripts/probe-dry.js probeDry and the verbMain entry
- src/scripts/probe-cold.js coldTree, called by probeDry and coldRun
- .claude/settings.json, read by the client

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/quack/probe_verb_test.go TestTheDryProbeRunsAtARevision
- src/quack/probe_verb_test.go TestTheDryProbeRefusesARevisionGitCannotResolve
- src/quack/settings_test.go TestTheSettingsDenyTheMergeTool
- test/level0/probe-dry.test.js the cold tree checks the clone out at the revision it names

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/quack/probe_verb.go
- src/quack/probe_verb_test.go
- src/quack/settings_test.go
- src/scripts/probe-dry.js
- src/scripts/probe-cold.js
- test/level0/probe-dry.test.js
- .claude/settings.json

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- probe_verb.go probeDry, probe-dry.js probeDry and entry, probe-cold.js coldTree and takesDelta, and .claude/settings.json stand opened
- grep finds coldTree called by probeDry and coldRun, and probeDry by probeVerb alone in Go
- the --at line meets the two probe_verb cases, the deny line meets settings_test, and the check line its own command

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/quack/probe_verb_test.go
- src/quack/settings_test.go
- test/level0/probe-dry.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Each case fails on its assertion: the verb hands --at to node unresolved and runs node on a revision git cannot read, the settings deny Artifact alone, and the cold tree never checks out a revision. The verb's pass-through already carried --at, so the Go half earns its keep by refusing a revision before a forty-second run starts.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the --at line meets the two probe_verb cases and the cold tree case, the deny line meets settings_test, and the check line waits for tests-green
- the verb cases run over fakeBoxDoors and the cold tree case over fakeDisk and fakeProc, and settings_test reads the tracked file as config_test reads spec/wiring.yaml

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
