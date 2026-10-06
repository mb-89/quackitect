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
group: javascript-leaves
step: gate
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box fb4ccb7cacc7 · claude-code-remote
    hash_before: 972187cb8b814a4c9915bd5a0460d9d27e1487da
    hash_after: 972187cb8b814a4c9915bd5a0460d9d27e1487da
    inputs:
      - name: ask
        hash: ac3cdcab2c35b53e
        size: 459
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box fb4ccb7cacc7 · claude-code-remote
    hash_before: ec844437150606cfebb7ffa1beada8f9a800ef16
    hash_after: ec844437150606cfebb7ffa1beada8f9a800ef16
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/quack fails
    inputs:
      - name: design/draft
        hash: a43bfbbf5a92e9eb
        size: 4413
    def: 08e16d07b0de477c
---

# Ask

The probes answer from Go, and the cold probe's path list names no script, so the handover and plan libraries stop loading for one constant.

`probe-clear.js` keeps `src/bridge/handover.js` and the pull cluster loaded for one string.

- `git ls-files 'src/scripts/probe-*.js'` answers nothing
- `git grep -n "src/scripts" -- src/quack/commit.go src/quack/probe_verb.go` answers nothing
- `./RUNME.sh probe dry` exits 0
- `./RUNME.sh check` exits 0

none

none

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

1. A new file, src/quack/probe_dry.go, holds probeDry(d, argv). Under --working it reads the working delta with `git diff HEAD --binary --no-renames`, untrimmed, porting deltaOf.
2. It stands the fresh box with coldTree, which the cold probe already uses. It runs `se-index standing` in the clone, as START in hooks/start.js does.
3. It reads the door's address off hooks.StandingFile. It posts each event to the door with the bearer token, through a new post door on boxDoors.
4. It raises session.start, prompt.submit, prompt.context, classic.MessageDisplay with the canary, tool.call Read, tool.call Bash, then classic.Stop. A rows effect gets an agent.spoke post carrying the held transcript.
5. readsDry runs its eight checks off the effects the door answers and the clone's session log: door, rules, prompt, tools, guard, canary, quiet, clear.
6. The clear road moves from probe-clear.js into the same file. It passes where the door's clear effect carries hooks.ResumePrompt and both turn ends answer one clear.
7. stops.go exports resumePrompt as ResumePrompt, so Go owns that string. handover.js stays loaded through src/bridge/guidance.js until its own child removes it.
8. probe_verb.go loses dryEntry. coldPath and coldIn move from commit.go into probe_cold.go, and the list drops probe-cold.js.
9. The three probe scripts and their three tests go. cli-check.js drops the deltaOf export, and check-server.test.js drops its deltaOf case.
Weighed: a kept node entry keeps in-process cover of the JavaScript forwarder, and keeps a probe in Node against the ask. Posting to the door costs that cover. hooks.test.js, cage.test.js and the cold probe still read the real module.
Assumed: level0-hooks-forward-to-go cuts the plugin to a forwarder, so the door holds every decision the dry checks read.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/quack/check.go: level0Runs, runs probe dry --working
- src/quack/probe_verb.go: probeVerb, case dry calls probeDry
- src/quack/commit.go: lands, calls coldIn
- src/quack/probe_cold.go: coldTree, coldPort, coldLines, tail, which the dry probe reuses
- src/modules/hooks/stops.go: holdsForHandover, reads resumePrompt
- src/quack/boxdoors.go: realBoxDoors, gains the post door
- src/quack/box_doors_test.go: fakeBoxDoors, gains a fake post
- src/scripts/cli-check.js: re-exports deltaOf
- test/level0/check-server.test.js: the deltaOf case
- src/bridge/guidance.js: the last loader of handover.js

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/quack/probe_dry_test.go: TestTheDryProbeStandsTheDoorAndPostsEveryEventToIt
- src/quack/probe_dry_test.go: TestAWholeDryRunPassesEveryCheck
- src/quack/probe_dry_test.go: TestEveryDryCheckFailsOnItsOwnRoad
- src/quack/probe_dry_test.go: TestTheDryProbeAnswersARowsAskBackWithTheTranscript
- src/quack/probe_dry_test.go: TestTheClearPassesOnTheResumePromptAndFailsOtherwise
- src/quack/probe_dry_test.go: TestTheDryProbeRaisesTheStopBeforeTheTurnsCompletion
- src/quack/probe_dry_test.go: TestTheProbeMintsItsGroupUnderTheClonesRoot
- src/quack/probe_dry_test.go: TestTheWorkingDeltaReadsTheDiffUntrimmed
- src/quack/probe_cold_test.go: TestTheColdPathTakesTheHooksFolderAndTheNamedFiles
- src/quack/probe_cold_test.go: TestAPathElsewhereSitsOffTheColdPath
- src/quack/probe_cold_test.go: TestTheColdPathNamesNoScriptOfItsOwn

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/scripts/probe-clear.js
- src/scripts/probe-cold.js
- src/scripts/probe-dry.js
- test/level0/probe-clear.test.js
- test/level0/probe-cold.test.js
- test/level0/probe-dry.test.js
- src/scripts/cli-check.js
- test/level0/check-server.test.js
- src/quack/probe_dry.go
- src/quack/probe_dry_test.go
- src/quack/probe_verb.go
- src/quack/probe_verb_test.go
- src/quack/probe_cold.go
- src/quack/probe_cold_test.go
- src/quack/commit.go
- src/quack/boxdoors.go
- src/quack/box_doors_test.go
- src/modules/hooks/stops.go
- spec/design_output/level0.md

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- a helper opened the three scripts, the probe, commit, check, boxdoors and stops Go files, cage.js, level0.js and start.js, and I checked resumePrompt, coldIn, StandingFile, the check's probe call and deltaOf there
- the callers come off a git grep for dryEntry, probeDry, coldIn, deltaOf, RESUME, resumePrompt and the three script names
- ls-files and the src/scripts grep run at tests-red as checkpoints, TestTheDryProbeStandsTheDoorAndPostsEveryEventToIt and a live probe dry decide line three, and a live check decides line four

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test src/quack/probe_dry_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/quack/probe_dry_test.go
- src/quack/probe_cold_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Eight dry probe cases and the cold path case naming no script fail on their own assertion. The two cold path cases for standing behaviour pass, since coldIn already stands in commit.go.

The tests fix the post door's signature and the shape of the session record, which the draft leaves open. The tools check reads the index's tool listing, where the JavaScript probe counted the plugin's tools in process.

The stub holds no probeDry yet, because probe_verb.go still holds the one handing off to Node. The resume prompt now takes one exported name, and the clear case in stops_test.go asserts it.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- lines one and two stand as checkpoints at implement, the door case decides line three before a live probe dry, and a live check decides line four
- the process runs, the post, the disk and the clock each reach the tests through a fake door

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
