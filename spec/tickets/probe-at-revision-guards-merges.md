---
kind: [[ticket]]
state: closed
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
step: implement/tests-green
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
  - step: gate
    hand: box a694567529c5 · claude-code-remote · helper-4
    hash_before: 260bda669171cf2920ea954b9245f4c0db189266
    hash_after: 260bda669171cf2920ea954b9245f4c0db189266
    inputs:
      - name: design/draft
        hash: f921a3ccf020b7c5
        size: 2014
      - name: design/tests-red
        hash: 41e4c8078b0ef917
        size: 812
    def: dc4904ab364efa10
  - step: implement/change
    hand: box a694567529c5 · claude-code-remote
    hash_before: 463e5b005b5c494a502258adfd11812c99907869
    hash_after: 463e5b005b5c494a502258adfd11812c99907869
    answered:
      - name: lint
        exit: 0
        said: ""
    def: f150b8c0dc20fe45
  - step: implement/tests-green
    hand: box a694567529c5 · claude-code-remote
    hash_before: eecb76e5ea65b7a4df24a3173d57a04c92bd0cd8
    hash_after: eecb76e5ea65b7a4df24a3173d57a04c92bd0cd8
    answered:
      - name: tests
        exit: 0
        said: green, 14 test(s) pass in 1 file(s); green, src/quack passes
      - name: check
        exit: 0
        said: "   89.0  in all"
    inputs:
      - name: design/tests-red
        hash: 41e4c8078b0ef917
        size: 812
    def: ec253787263043a7
  - step: accept
    skipped: true
    why: the delivery's acceptance reads this ticket
  - step: view
    skipped: true
    why: the ask names no view the owner reads
reason: done
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

accept with points
- probe-at-stays-dry: the approach assumes the check runs `probe dry`, and level0Runs in src/quack/check.go now runs `probe smoke --working`, while probeVerb hands dry and smoke alike to the one Go probeDry and the entry picks probeSmoke on the smoke word. Resolve --at on the dry word alone, and refuse `smoke --at` and `--at` beside `--working` with one line, since smokeTree clones --shared and copies the root's built tools, which belong to another revision. A Go case decides each refusal. The four red cases fail on their own assertion at 260bda669, and TestTheSmokeProbeHandsItsRoadToTheEntry stays green beside them.
- merge-deny-every-connector: the deny names mcp__github__merge_pull_request alone, and this box also carries a second GitHub connector whose merge_pull_request tool sits under its own mcp__<uuid>__ prefix, and gh pr merge through Bash. Deny the merge tool under every GitHub connector the box loads, and leave enable_pr_auto_merge open, since the work skill turns auto-merge on through the connector. Unchecked: whether the client takes a glob in a deny rule.

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

cd src && CGO_ENABLED=0 go vet ./quack/

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change touches probe_verb.go, probe-cold.js, probe-dry.js and settings.json, which the size list names, and landed through probe-at-stays-dry and merge-deny-every-connector
the verb reaches git through the run door, whose fake its cases drive, and coldTree reaches git through it.proc, whose fake the cold tree case drives
resolvedAt, checksOut and the deny case carry comments linking this ticket
the flag stands once a language, and the merge roads once in .claude/settings.json

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh branch test src/quack/probe_verb_test.go src/quack/settings_test.go test/level0/probe-dry.test.js

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

probe dry --at <rev> now runs the dry probe at that commit. The Go verb resolves the revision through git, refuses one git cannot read before node starts, and the cold tree checks the clone out at the commit before the install. One call then runs level zero at any merge on main. The smoke and the working change refuse --at, since both stand on the tree as it is. The tracked settings deny the merge tool under every GitHub connector the box loads, and gh pr merge, and leave auto-merge open, so auto-merge stays the one road to main.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change touches the files the size list names
every door the change reaches runs through its fake in the cases
resolvedAt, checksOut and the deny case link this ticket
the flag and the merge roads each stand in one place

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
