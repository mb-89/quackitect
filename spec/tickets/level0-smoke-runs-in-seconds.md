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
step: implement/change
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box a694567529c5 · claude-code-remote
    hash_before: cb6508464eddc3f1e48615998f8a2845199dc9a8
    hash_after: cb6508464eddc3f1e48615998f8a2845199dc9a8
    inputs:
      - name: ask
        hash: 1ba74feccc7fa8db
        size: 625
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box a694567529c5 · claude-code-remote
    hash_before: 4b27f26c88d9ad96131a7f74219e9cdab3327b98
    hash_after: 4b27f26c88d9ad96131a7f74219e9cdab3327b98
    answered:
      - name: tests
        exit: 1
        said: assertion, 3 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: ef85745769ce3f78
        size: 2897
    def: 08e16d07b0de477c
  - step: gate
    hand: box a694567529c5 · claude-code-remote · helper-4
    hash_before: f0f07839366522944a2ec9983b26db67027071d8
    hash_after: f0f07839366522944a2ec9983b26db67027071d8
    inputs:
      - name: design/draft
        hash: ef85745769ce3f78
        size: 2897
      - name: design/tests-red
        hash: 54045218f4145c0f
        size: 966
    def: dc4904ab364efa10
---

# Ask

A pull request that breaks level zero turns red in seconds on Linux and Windows both, since a smoke runs level zero with the model faked against the tree as it stands.

The dry session clones a cold box and spends minutes, and a Windows box skips it, so a break on Windows lands green.

- `go test ./src/quack/` passes a case where `level0Runs` runs the smoke over the working tree with no clone, on Windows as on Linux.
- `node --test test/contract/check-workflow.test.js` passes a case where the check job auto-merge waits on runs on ubuntu-latest and windows-latest, so the smoke runs on both.
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

A smoke road joins the dry probe: probeSmoke in src/scripts/probe-dry.js stands the tree as it is with no install, and runs the same faked session without the clear road. It clones the working tree with git clone --shared, applies the working change as the dry probe does, and copies the root's built tools under .se/.runtime/bin into the clone through the disk door, so the start road finds the index and skips the install. The session runs as session() runs it, with the clear road held off by an option, and readsDry reads every check of DRY.checks past clear. A trial on this box runs the whole smoke in about six seconds, where the dry probe takes forty with its install and its clear road. The Go probe verb hands smoke to the same entry, as it hands dry, and level0Runs runs probe smoke --working on every platform, so the Windows job runs it too, and the check job auto-merge waits on carries it on both runners. The start road names the index binary with .exe where it stands, since a Windows box builds se-index.exe and the road reads it as missing and exits 9. The full dry probe stays a verb for a hand who wants the cold road.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/quack/check.go level0Runs
- src/quack/probe_verb.go probeVerb
- src/scripts/probe-dry.js probeDry and session
- src/scripts/probe-dry.js verbMain entry
- src/scripts/probe-dry.js readsDry
- src/scripts/probe-cold.js coldTree (read, unchanged)
- .claude/skills/level0/hooks/start.js START, run by .claude/skills/level0/hooks/level0.js startsOnce

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/quack/check_test.go TestCheckReads/level zero runs the smoke on the working tree, on Windows as on Linux
- src/quack/probe_verb_test.go TestProbeVerb smoke road hands its words to the entry
- test/level0/probe-dry.test.js the smoke stands the clone with the root's built tools and installs nothing
- test/level0/probe-dry.test.js the smoke reads every check but the clear
- test/level0/start-constants.test.js the start road takes the index binary with .exe where it stands
- test/contract/check-workflow.test.js stands as it is, holding the check job on ubuntu-latest and windows-latest

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/scripts/probe-dry.js
- test/level0/probe-dry.test.js
- src/quack/probe_verb.go
- src/quack/probe_verb_test.go
- src/quack/check.go
- src/quack/check_test.go
- .claude/skills/level0/hooks/start.js
- test/level0/start-constants.test.js

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- probe-dry.js, probe-cold.js coldTree, start.js START, level0.js startsOnce and caged, probe_verb.go and check.go stand opened, and a scratch run proved the clone with copied tools answers every check but clear in six seconds
- grep finds level0Runs in check.go alone, probeDry in probe_verb.go and probe-dry.js, and START in level0.js startsOnce
- the level0Runs line meets the check_test case, the workflow line meets check-workflow.test.js, and the check line its own command

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/quack/check_test.go
- src/quack/probe_verb_test.go
- test/level0/probe-dry.test.js
- test/level0/start-constants.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Every new case fails on its assertion: the check runs probe dry, the verb prints its usage for smoke, the stubbed smoke tree stands nothing, the stubbed check list still holds the clear, and the start road names no .exe. The red-going case of the check now keys on the smoke, so it stands red with them. A scratch run earlier showed the smoke over a shared clone answering every check but the clear in six seconds, where the dry probe takes forty.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the level0Runs line meets the check_test case over both platforms, the workflow line meets check-workflow.test.js as it stands, and the check line waits for tests-green
- the smoke tree case runs over fakeDisk and fakeProc, and the check and verb cases over their fakes, so no case reaches a disk, a process or a box

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept

The approach answers the ask. A smoke over a shared clone of the working tree, holding the root's built tools and the clear road held off, runs level zero with the model faked in seconds. level0Runs hands `probe smoke --working` on every platform, so the Windows runner of the check matrix runs it too.

A test decides every done_when line:
- the level0Runs line: check_test.go 'level zero runs the smoke on the working tree, on Windows as on Linux', red
- the workflow line: check-workflow.test.js already holds `os: [ubuntu-latest, windows-latest]` in check.yml, so it stands green with no change
- the check line: its own command, at tests-green

Fixed within the gate's diff: the case 'a part another verb owns runs that verb through the road' still wanted `probe dry --working`, so it now wants `probe smoke --working` and stands red with the rest of check_test.go.

Weighed: the ask says no clone, and the draft takes `git clone --shared` with the working change applied. That clone takes no copy and no install, which matches the owner's words: the tree as it stands, not a cold clone. The Windows case 'names the desk trial covering it' and the new smoke case can both hold: on Windows, level0Runs runs the smoke and names deskTrial for the live client. The implement step keeps both, as the handover says.

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

This ticket carries the tests-green step of [[spec/tickets/level0-claims-name-the-platform]], which closed `became` onto it. Its change landed, and its cases stand in `src/quack/check_test.go`. The package stays red only on the cases keyed on `probe smoke --working`, which this ticket's implement step turns green. So the tests-green here runs that package with those cases, and the accept here also reads that ask:

- `go test ./src/quack/` passes a case where `level0Runs` on Windows names the desk trial that covers it.
- the red line names the platform beside the tree going red.
- `./RUNME.sh check` exits 0.
