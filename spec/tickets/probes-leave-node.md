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
  - step: design/draft
    hand: box fb4ccb7cacc7 · claude-code-remote
    hash_before: 4987c1bb38ad811d445dc6a7950bee0c5ea1bd71
    hash_after: 4987c1bb38ad811d445dc6a7950bee0c5ea1bd71
    inputs:
      - name: ask
        hash: ac3cdcab2c35b53e
        size: 459
    def: c01ae0f2ace0cecb
  - step: design/tests-red
    hand: box fb4ccb7cacc7 · claude-code-remote
    hash_before: a1384b230a8b6d8942c83ff28be59403eed8f73b
    hash_after: a1384b230a8b6d8942c83ff28be59403eed8f73b
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/quack fails
    inputs:
      - name: design/draft
        hash: 594bb7de87db1f20
        size: 6146
    def: 08e16d07b0de477c
  - step: gate
    hand: box fb4ccb7cacc7 · claude-code-remote · helper-6
    hash_before: d0a7d8a93d2d83ff9a9a93e507e42fe9ae97d1fe
    hash_after: d0a7d8a93d2d83ff9a9a93e507e42fe9ae97d1fe
    inputs:
      - name: design/draft
        hash: 594bb7de87db1f20
        size: 6146
      - name: design/tests-red
        hash: 4103cfc6fb205414
        size: 1027
    def: dc4904ab364efa10
  - step: implement/change
    hand: box fb4ccb7cacc7 · claude-code-remote
    hash_before: c5dd015afdbf46ea3b9e89954daa3b6df0922b38
    hash_after: c5dd015afdbf46ea3b9e89954daa3b6df0922b38
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
    def: f150b8c0dc20fe45
group: javascript-leaves
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

1. `src/quack/probe_dry.go` holds `probeDry(d, argv)` and `probeSmoke(d, argv)`, both over one `probed` road. Under `--working` each reads the working delta with `git diff HEAD --binary --no-renames`, untrimmed, porting `deltaOf` as `workingDelta`.
2. The dry road stands the fresh box with `coldTree`, which the cold probe already uses. `coldBox` gains an `at` field, and `coldTree` checks the clone out with `git checkout --quiet --detach <at>` before the delta, porting `checksOut`. `probeVerb` keeps resolving the revision.
3. The smoke road stands its tree with a Go `smokeTree`: `git clone --quiet --shared`, the delta through `takesDelta`, the root's built tools under the runtime `bin` folder copied in past any name ending `.old`, and the pointer file naming the tree and the port. It installs nothing.
4. Each road runs `se-index standing` in the clone, as `START` in `hooks/start.js` does. It reads the door's address off `hooks.StandingFile`, and posts each event with the bearer token through a new post door on `boxDoors`.
5. The session raises `session.start`, `prompt.submit`, `prompt.context`, `classic.MessageDisplay` with the canary, `tool.call` Read, `tool.call` Bash, then `classic.Stop`. A rows effect gets an `agent.spoke` post carrying the held transcript.
6. `readsDry` runs its checks off the effects the door answers and the clone's session log: door, rules, prompt, tools, guard, canary, quiet, clear. The smoke reads every check but the clear, and its session skips the clear road.
7. The clear road moves from `probe-clear.js` into the same file. Its clone drops every `todo: true` park and commits that, mints its group, then commits the untag and points origin's branch at its tip. It passes where the door's clear effect carries `hooks.ResumePrompt` and both turn ends answer one clear. `stops.go` already exports `ResumePrompt`.
8. `leaves` removes the temp tree, and where the box still holds it, says `the temp tree stays at <path>` with the error, and the verdict stands.
9. `probe_verb.go` loses `dryEntry`, and the dry and smoke cases call the Go roads. `coldPath` and `coldIn` move from `commit.go` into `probe_cold.go`, and the list drops `probe-cold.js`.
10. The three probe scripts and their three tests go. `cli-check.js` drops the `deltaOf` export, and `check-server.test.js` drops its `deltaOf` case. `handover.js` stays loaded through `src/bridge/guidance.js` until its own child removes it.
Weighed: a kept node entry keeps in-process cover of the JavaScript forwarder, and keeps a probe in Node against the ask. Posting to the door costs that cover. `hooks.test.js`, `cage.test.js` and the cold probe still read the real module.
Assumed: `level0-hooks-forward-to-go` cuts the plugin to a forwarder, so the door holds every decision the dry checks read. The smoke stands in the check, so a red smoke reds the check, and the check decides it.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/quack/check.go: level0Runs, runs probe smoke --working
- src/quack/probe_verb.go: probeVerb, the dry and smoke cases, and the revision resolver
- src/quack/commit.go: lands, calls coldIn
- src/quack/probe_cold.go: coldTree, coldBox, coldPort, coldLines, tail, which both roads reuse
- src/quack/probe_cold.go: probeCold, builds a coldBox
- src/modules/hooks/stops.go: ResumePrompt, which the clear reads
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
- src/quack/probe_dry_test.go: TestTheSmokeStandsTheCloneWithTheRootsBuiltToolsAndInstallsNothing
- src/quack/probe_dry_test.go: TestTheSmokeReadsEveryCheckButTheClear
- src/quack/probe_dry_test.go: TestTheColdTreeChecksTheCloneOutAtTheRevisionItNames
- src/quack/probe_dry_test.go: TestATempTreeTheBoxStillHoldsStaysNamedAndTheVerdictStands
- src/quack/probe_dry_test.go: TestTheProbeDropsEveryParkInItsCloneAndCommitsIt

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first on this route: the standard process changed, and the ticket restarts at the draft, so the approach takes in what main gave the probe scripts since the last draft

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
- spec/design_output/level0.md

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- on the merged tree I opened `probe-dry.js`, `probe-clear.js`, `probe-cold.js`, `probe_verb.go`, `probe_cold.go`, `probe_dry.go`, `commit.go`, `check.go`, `stops.go` and `hooks.go`, and checked `dryEntry`, `atFlag`, `coldIn`, `coldBox`, `coldTree`, `StandingFile`, `ResumePrompt`, `deltaOf`, `smokeTree`, `checksOut`, `unparked` and `leaves` there
- the callers come off a git grep for `dryEntry`, `probeDry`, `coldIn`, `coldBox`, `deltaOf`, `ResumePrompt`, `probe smoke` and the three script names
- `ls-files` and the `src/scripts` grep run at tests-red as checkpoints, `TestTheDryProbeStandsTheDoorAndPostsEveryEventToIt` and a live `probe dry` decide line three, and a live check, which runs the smoke, decides line four
- the approach adds no config key

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/quack/probe_dry_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/quack/probe_dry_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The first round's eight cases still fail on the stubs, and five cases join them for what main gave the probe scripts. The smoke case stands the clone off the root's built tools. The revision case reads the checkout between the clone and the install. The held temp tree and the unpark cases each run over a door the case hands in. A surprise: `coldBox` carries no revision, though the JavaScript `coldTree` takes one, so the field lands here to let the revision case compile.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- `git ls-files` and the `src/scripts` grep stand as checkpoints the implement hand answers, `TestTheDryProbeStandsTheDoorAndPostsEveryEventToIt` fails for the live `probe dry` line, and the smoke and revision cases fail for the check line, which runs the smoke
- the cases reach the process, post and disk doors through `fakeBoxDoors`, a temp folder and a remove door the case hands in, so no case reaches a real process

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- probe-verb-drops-script-comments: the approach drops `dryEntry` from `src/quack/probe_verb.go`, but the comment over `atFlag` (`as AT in src/scripts/probe-dry.js reads it`) and the doc line over `probeDry` still name `src/scripts`, so the second done_when grep stays red until the implement hand rewrites both in place
- cold-comments-name-go-owner: `src/quack/probe_cold.go` says its numbers and the cold prompt stand `as probe-cold.js` and `COLD.prompt in src/scripts/probe-cold.js` name them, and the `coldPath` comment moving from `commit.go` says the script owns `COLD_PATH`; each points at a deleted file once the scripts go, so the implement hand rewrites them to name the Go owner

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh lint src/quack/probe_dry.go src/quack/probe_clear.go src/quack/probe_cold.go src/quack/commit.go src/quack/probe_verb.go src/quack/boxdoors.go src/quack/probe_verb_test.go src/quack/commit_test.go src/scripts/cli-check.js test/level0/check-server.test.js spec/design_output/level0.md

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches the files the size list names, plus probe_clear.go, which the clear road takes so probe_dry.go stays under the file ceiling, and commit_test.go, which drops a case probe_cold_test.go repeats
- the post door is real in boxdoors.go and fake in box_doors_test.go, and every other door the roads reach rides boxDoors with its fake
- each file header names the dry, smoke and clear roads the approach describes, and links the ticket
- coldPath and coldIn stand in probe_cold.go alone, and the level0 design note points at that file for the cold path

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
