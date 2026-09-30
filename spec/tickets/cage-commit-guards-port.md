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
step: implement/tests-green
depends_on: [cage-command-rules-port]
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box d88b829f8cd8 · claude-code-remote
    hash_before: 3e10455b46288bfa0f979d5c5080d5aee95e9c04
    hash_after: 3e10455b46288bfa0f979d5c5080d5aee95e9c04
    inputs:
      - name: ask
        hash: 7c90d003597ffeb3
        size: 821
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box d88b829f8cd8 · claude-code-remote
    hash_before: 17b3699dba8609d3c006db434a1a575b3d4beb01
    hash_after: 17b3699dba8609d3c006db434a1a575b3d4beb01
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/modules/hooks fails
    inputs:
      - name: design/draft
        hash: b282b0ed5f9e778a
        size: 6138
    def: 08e16d07b0de477c
  - step: gate
    hand: box d88d1fd844dd · claude-code-remote
    hash_before: 11a211911d0a640de4c1ff6c37ceb9faf0966daf
    hash_after: 11a211911d0a640de4c1ff6c37ceb9faf0966daf
    inputs:
      - name: design/draft
        hash: b282b0ed5f9e778a
        size: 6138
      - name: design/tests-red
        hash: 93f0d9ba7da441c5
        size: 2105
    def: dc4904ab364efa10
  - step: implement/change
    hand: box d88d1fd844dd · claude-code-remote
    hash_before: 46a2b1e85dc5e0f22a722417784b32edd3d3a39a
    hash_after: 664a3dcdd0c9fc11f67207734d517e2e486c3c53
    answered:
      - name: lint
        exit: 0
        said: "src/modules/hooks/command/trunk.go:166:54: MagicNumber: 64 carries a meaning here. Name it in the constants block at the"
    def: f150b8c0dc20fe45
---

# Ask

The `hooks` IO module refuses every commit and push the bridge's guards refuse, with the same reason. The guards:

- the private delta, off `.claude/skills/level0/lib/private.js`
- the tested delta, off `.claude/skills/level0/lib/tested.js`
- the todo tag on a push
- the desk guard and the trunk guard, with the check's stamp
- the commit message's voice

Without it, the cage key moving to `new` lets a commit carry a private line or an untested module. A push onto the trunk passes too.

- each guard meets a recorded log under `test/replay/cage`, and its `.shadow.jsonl` holds no row that guard decides. `go test ./src/modules/hooks/...` decides it
- each guard's refusal text reads as the bridge's text for the same command, in a table case of `src/modules/hooks`
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

The port keeps the bridge's order in `src/bridge/bash.js` `onBash`: the ticket door, the bless guard, the command rules with the voice refusals, the private delta, the tested delta, the todo tag on a push, the desk guard, the trunk guard, the version guard, then the git write door. `Door.commands` in `src/modules/hooks/hooks.go` runs the new guards between the command rules and the version guard.

Pure reads land in the `command` package, one file a guard, each ported line for line from its lib module with the refusal text alike:

- `command/private.go`: `addedIn`, `shapesIn`, `boxNamesIn`, `noteTextIn`, `privateIn` and `RefusedDelta`, off `lib/private.js` and `lib/refuse.js`
- `command/tested.go`: `hunksIn`, `movedWhole`, `carriedIn`, `UntestedIn` and `RefusedTest`, off `lib/tested.js`
- `command/todo.go`: `isTagged`, `reaches`, `TaggedIn` and `RefusedTodo`, off `lib/todo.js`
- `command/trunk.go`: `TouchesGit`, `LandsOnTrunk`, the desk refusal off `lib/cloud.js`, the red battery text and `throughTheVerb`, off `lib/trunk.js` and `src/bridge/bash.js`
- `command/voice.go`: the split of kept findings into refusals and form, off `lib/warnings.js` `refusesIn`

IO stays in the `hooks` module, in a new `commits.go`. It reads git through `Outside.Git`, the tree through `disk{root}`, and the check's stamp at `.se/.runtime/check.json`. It reads the held tests off the holds folder `src/scripts/guidance-hand.js` `heldTests` walks. `Settings` gains `User` and `Home`, which `commandSettings` in `src/quack/command.go` fills off the process environment. A new `Outside.Voice` takes a commit message and answers the findings Vale and `src/prose` keep. `listensHooks` in `src/quack/main.go` wires it to run Vale over the message as `level0-commit.md` and pass the findings through `prose.Kept`. A door with no Voice reads no voice, as a door with no Git reads no git.

The evidence follows the road the call-holds port took:

- `test/replay/cage/commit-guards-cases.json` holds a tree, and per case the git answers keyed by the joined arguments, the kept voice findings, and the bridge's decision and text
- `test/level0/commit-guards-cases.test.js` drives `onBash` over a `fakeProc` taught those git answers and a Vale fake answering those findings, so a drift in the bridge reads there first
- `.se/scripts/commit-guards-log.mjs` prints one recorded log a guard off the bridge's own answers, with a `<name>.box.json` carrying settings, `git` and `voice`
- `cage_test.go` `boxOf` reads `git` and `voice` off the box file into `Outside.Git` and `Outside.Voice`, so the replay meets each guard with an empty golden shadow

One commit a guard, each with its Go test, its cases and its log, then the wiring commit.

What I weigh: a Voice function beside Git keeps Vale and the wink twin out of the module, and the case table decides the refusal text alike. The cost is that the table fakes Vale's output, so a Vale rule change reads in neither test. The prose slice owns that drift, and `./RUNME.sh check` still runs the real Vale over the tree. The warn-on-form context and `markedPush` fall outside the ask, since neither refuses a call.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/modules/hooks/hooks.go: Door.refuses calls Door.commands
- src/modules/hooks/hooks.go: Door.Hook calls Door.refuses
- src/quack/main.go: listensHooks builds hooks.Outside
- src/quack/command.go: commandSettings builds hooks.Settings
- src/modules/hooks/cage_test.go: boxOf builds Settings for the replay
- src/modules/hooks/cage_test.go: TestReplayLogAnswersEveryRecordedLog builds the replay door
- src/quack/hook_test.go: builds hooks.Outside
- src/quack/hooks_test.go: builds hooks.Outside

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/modules/hooks/command/private_test.go: TestPrivateInReadsTheBridgesThreeChecks
- src/modules/hooks/command/tested_test.go: TestUntestedInReadsTheBridgesDelta
- src/modules/hooks/command/todo_test.go: TestTaggedInReadsTheTodoTag
- src/modules/hooks/command/trunk_test.go: TestLandsOnTrunkReadsTheBridgesLanding
- src/modules/hooks/command/voice_test.go: TestTheVoiceSplitsRefusalsFromForm
- src/modules/hooks/commits_test.go: TestTheCommitGuardsRefuseWhatTheBridgeRefuses
- src/modules/hooks/cage_test.go: TestReplayLogAnswersEveryRecordedLog, over the new logs
- test/level0/commit-guards-cases.test.js: the bridge answers the shared commit case

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first draft

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/modules/hooks/hooks.go
- src/modules/hooks/commits.go
- src/modules/hooks/commits_test.go
- src/modules/hooks/cage_test.go
- src/modules/hooks/command/private.go
- src/modules/hooks/command/private_test.go
- src/modules/hooks/command/tested.go
- src/modules/hooks/command/tested_test.go
- src/modules/hooks/command/todo.go
- src/modules/hooks/command/todo_test.go
- src/modules/hooks/command/trunk.go
- src/modules/hooks/command/trunk_test.go
- src/modules/hooks/command/voice.go
- src/modules/hooks/command/voice_test.go
- src/quack/main.go
- src/quack/command.go
- test/replay/cage/commit-guards-cases.json
- test/level0/commit-guards-cases.test.js
- test/replay/cage/private-delta.jsonl, .box.json, .shadow.jsonl
- test/replay/cage/tested-delta.jsonl, .box.json, .shadow.jsonl
- test/replay/cage/todo-push.jsonl, .box.json, .shadow.jsonl
- test/replay/cage/desk-trunk.jsonl, .box.json, .shadow.jsonl
- test/replay/cage/commit-voice.jsonl, .box.json, .shadow.jsonl

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

every file and function named stands opened: src/bridge/bash.js onBash and each guard, lib/private.js privateNow and privateIn, lib/tested.js untestedIn, lib/todo.js, lib/trunk.js landsOnTrunk and touchesGit, lib/cloud.js onDesk and deskRefusal, lib/warnings.js refusesIn, lib/refuse.js refusedDelta, hooks.go Door.commands and Outside, cage_test.go boxOf and the replay test, command_test.go, src/quack/command.go and main.go listensHooks
the callers list names every builder of Outside and Settings and every caller of Door.commands, found by grep over src
each done_when line names its test: the replay line TestReplayLogAnswersEveryRecordedLog, the refusal text line TestTheCommitGuardsRefuseWhatTheBridgeRefuses with its JS twin, and the check line ./RUNME.sh check

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test src/modules/hooks

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/modules/hooks/commits_test.go
- src/modules/hooks/cage_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The Go table test `TestTheCommitGuardsRefuseWhatTheBridgeRefuses` stands red on its own assertion in every case a guard decides. The cases the git write door answers stand green, and so does the pass. The bridge twin `test/level0/commit-guards-cases.test.js` passes every case, since the table holds the bridge's own answers.

The surprise: the replay compares decision words alone. The Go door's git write door already refuses every plain `git commit` and `git push`, and every one behind `sudo`, `env` or `time`, so a log of those reads alike before the port. A probe of the Go door found the shapes it passes: `sh -c`, `bash -c`, `xargs` and `sudo -u`. The desk, trunk and todo logs carry those shapes, and their replays stand red. The private, tested and voice guards read only a bare `git commit`, which the git write door refuses on both sides. So their logs read alike before and after the port, and the table test alone tells their text apart.

The table masks the address, the phone number and the home path it carries, and both twins unmask them on load. Otherwise the private delta refuses the table's own commit.

The scaffold adds `Settings.User`, `Settings.Home` and `Outside.Voice` with no behaviour, so the red test builds and fails on its assertion rather than on the build.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

each done_when line meets a failing test: the replay line meets TestReplayLogAnswersEveryRecordedLog over desk-guard, todo-push and trunk-guard, red now, while the private, tested and voice logs read alike on both sides as the seen field says; the refusal text line meets TestTheCommitGuardsRefuseWhatTheBridgeRefuses, red in each guard case; the check line stands a checkpoint the implement step answers with ./RUNME.sh check
every door the tests reach has a fake: git through taughtGit, the voice through taughtVoice, the tree through treeOf under t.TempDir, and the index through q/qtest in doorOver; the bridge twin takes fakeDisk, fakeProc and a Vale fake

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept
- the approach answers the ask: Door.commands runs the private delta, the tested delta, the todo tag, the desk guard and the trunk guard between the command rules and the version guard, in onBash's order, and each guard ports off the lib module the ask names (heldTests, privateIn, untestedIn and refusesIn stand where the draft says)
- done_when two meets TestTheCommitGuardsRefuseWhatTheBridgeRefuses over commit-guards-cases.json, red in each guard case; done_when three is the check the implement answers
- fix in place: private-delta.jsonl, tested-delta.jsonl and commit-voice.jsonl carry only a bare git commit, which the git write door refuses on both sides, so the replay decides none of those three guards; the implement adds an sh -c or xargs shape to each log, so the replay goes red before the guard and clean after it
- weighed: the case table fakes Vale's output, so a Vale rule change reads in neither test; the prose slice owns that drift and ./RUNME.sh check runs the real Vale, so it stays

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

the change touches the files the draft's size names, plus src/quack/commit_voice_test.go, which tests commitVoice, and no file the ask leaves out
every door the change reaches has a fake: git through Outside.Git and taughtGit, the voice through Outside.Voice and taughtVoice, the tree through disk under t.TempDir
a comment names the approach above each new file and function, linking spec/tickets/cage-commit-guards-port
every fact stands in one place: the lib modules own the refusal texts, and the case table holds them for both twins; the folder names carry a comment naming their owner

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
