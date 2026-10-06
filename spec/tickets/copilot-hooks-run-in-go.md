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
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box fb4ccb7cacc7 · claude-code-remote
    hash_before: 4930cd6c20df5c82052011e358a3f91a0c382940
    hash_after: 4930cd6c20df5c82052011e358a3f91a0c382940
    inputs:
      - name: ask
        hash: e1dd042af4ef6bcc
        size: 765
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box fb4ccb7cacc7 · claude-code-remote
    hash_before: 428dc104b45b1432a432eb6a52acb4dcde7531b3
    hash_after: 428dc104b45b1432a432eb6a52acb4dcde7531b3
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/quack fails
    inputs:
      - name: design/draft
        hash: 517c62490a836544
        size: 5375
    def: 08e16d07b0de477c
  - step: design/draft
    hand: box fb4ccb7cacc7 · claude-code-remote
    hash_before: 5170d177e2a878ea2f45eed17d946c9d93c994f9
    hash_after: 5170d177e2a878ea2f45eed17d946c9d93c994f9
    inputs:
      - name: ask
        hash: e1dd042af4ef6bcc
        size: 765
    def: c01ae0f2ace0cecb
group: javascript-leaves
---

# Ask

The Copilot hooks answer from the Go engine, and the dispatch mode leaves. That mode loads the whole JavaScript work cluster, so the cluster can leave after it.

`src/scripts/copilot.js` keeps the work, pull and ticket scripts loaded, and none of them leave.

- `git ls-files src/scripts/copilot.js src/scripts/copilot-door.js .claude/skills/level0/lib/copilot.js .claude/skills/level0/lib/copilot-dispatch.js .claude/skills/level0/lib/copilot-setup.js src/doors/session.js src/doors/fake/session.js` answers nothing
- `git grep -n "src/scripts/copilot" -- .github src/quack src/modules` answers nothing
- `go test ./src/modules/hooks/... ./src/quack/...` passes a test of each Copilot event's answer through `se-index hook`
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

1. `.github/hooks/level0.json` runs `.se/.runtime/bin/se-index verb src/scripts hook <Event>` for SessionStart, PreToolUse, PostToolUse and Stop.
2. `copilotRunner` in `src/quack/copilotsetup.go` becomes that binary line, so the registrations write it.
3. The setup workflow swaps setup-node for setup-go off `go.mod`, and its last step runs `<runner> setup --cloud`.
4. `setupVerb` reads `--cloud`, and `setupCopilot` passes `cloud` to `copilotSetup` in place of `auto`.
5. `hookVerb` in `src/quack/hook_verb.go` routes the four Copilot words to `copilotHook`, beside pre-commit and pre-push.
6. `hookDoors` gains `copilot` (vscode or cloud), an `ask` door posting to the hooks door, and `log`.
7. The real `ask` reads `hooks.StandingFile`, posts to the door with the bearer token, and waits twenty seconds at most.
8. `src/modules/hooks/copilot.go` ports `eventOf`, `callsOf`, `postedAs`, `answers`, `replyOf` and `failureOf`.
9. `src/modules/hooks/down.go` ports `guarded`, `recovers`, `wordsOf` and `refusedText`, so a down door refuses a guarded call.
10. `src/modules/edits/mutations.go` ports `mutations` and `patchChanges`, which `callsOf` needs to post an edit as Write.
11. `copilotHook` reads the event JSON, posts each call, prints the reply, appends one `copilot` row, and exits zero.
12. A fault prints the `failureOf` reply and a stderr line, so a broken hook still denies.
13. The dispatch mode leaves with its files, since no Go caller, workflow or skill runs it.
14. The seven named files and four JavaScript tests leave, and `spec/design_output/copilot.md` drops the dispatch lines.
Weighed: posting to the running door, as the removed `src/quack/hook.go` did, against a door built in process without the index's store.
Assumed: Copilot runs a hook at the root under a POSIX shell, and a box lacking the binary fails as one lacking node did.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- .github/hooks/level0.json: the four hook commands
- .github/workflows/copilot-setup-steps.yml: the step preparing cloud hooks
- src/quack/copilotsetup.go: copilotRegistrations, through copilotRunner
- src/quack/setup_verb.go: setupVerb and setupCopilot
- src/quack/hook_verb.go: hookVerb
- src/scripts/copilot.js: the hook, setup and dispatch modes
- src/scripts/copilot-door.js: answers
- .claude/skills/level0/lib/copilot.js: eventOf, replyOf, failureOf, callsOf
- .claude/skills/level0/lib/copilot-dispatch.js: dispatch
- .claude/skills/level0/lib/copilot-setup.js: setup
- src/doors/session.js: session
- src/doors/fake/session.js: fakeSession
- spec/design_output/copilot.md: the lines naming copilot.js and dispatch
- test/contract/outside-in-doors.test.js: the lists naming copilot.js and session.js

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/quack/hook_verb_test.go: TestHookSessionStartAnswersTheDoorsAftersAsContext
- src/quack/hook_verb_test.go: TestHookPreToolUsePostsAShellCallAsBashAndAnswersTheDeny
- src/quack/hook_verb_test.go: TestHookPreToolUsePostsAnEditAsOneWrite
- src/quack/hook_verb_test.go: TestHookPreToolUseRefusesAGuardedCallWhileTheDoorStandsDown
- src/quack/hook_verb_test.go: TestHookPostToolUsePostsClassicAndAnswersNothing
- src/quack/hook_verb_test.go: TestHookStopAnswersTheDoorsBlock
- src/quack/hook_verb_test.go: TestHookStopRetryEndsWithoutClaimingDone
- src/quack/hook_verb_test.go: TestHookCloudTakesJSONStringArgumentsAndItsOwnEnvelope
- src/quack/hook_verb_test.go: TestHookAsksTheDoorTheStandingFileNames
- src/quack/hook_verb_test.go: TestCopilotScriptsLeave
- src/quack/hook_verb_test.go: TestCopilotHooksNameNoScript
- src/quack/setup_verb_test.go: TestTheSetupVerbWritesTheCloudMarkUnderCloud
- src/modules/hooks/copilot_test.go: TestCopilotReplyShapesEachSurface
- src/modules/hooks/copilot_test.go: TestCopilotEventKeepsTheLastToolName
- src/modules/hooks/down_test.go: TestRecoversPassesTheSavingCommandsAlone
- src/modules/edits/mutations_test.go: TestMutationsDecodeEachEditTool
- src/modules/edits/mutations_test.go: TestAPatchDecodesAddUpdateAndDelete

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first on this route: the standard process changed, and the ticket restarts at the draft. Main changed none of the files the approach names past `src/doors/fake/session.js`, which leaves with it.

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- .github/hooks/level0.json
- .github/workflows/copilot-setup-steps.yml
- src/quack/copilotsetup.go
- src/quack/copilotsetup_test.go
- src/quack/setup_verb.go
- src/quack/setup_verb_test.go
- src/quack/hook_verb.go
- src/quack/hook_verb_test.go
- src/modules/hooks/copilot.go
- src/modules/hooks/copilot_test.go
- src/modules/hooks/down.go
- src/modules/hooks/down_test.go
- src/modules/edits/mutations.go
- src/modules/edits/mutations_test.go
- spec/design_output/copilot.md
- spec/tickets/javascript-leaves.md
- src/scripts/copilot.js
- src/scripts/copilot-door.js
- .claude/skills/level0/lib/copilot.js
- .claude/skills/level0/lib/copilot-dispatch.js
- .claude/skills/level0/lib/copilot-setup.js
- src/doors/session.js
- src/doors/fake/session.js
- test/level0/copilot.test.js
- test/level0/copilot-dispatch.test.js
- test/level0/copilot-setup.test.js
- test/contract/session.test.js

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- on the merged tree I opened `copilotsetup.go`, `setup_verb.go`, `hook_verb.go`, `copilot.go`, `down.go`, `mutations.go` and the fake session, and checked `copilotRunner`, `setupCopilot` and `hookVerb` there
- the callers come off a git grep on each file name and the dispatch mode, across code, workflows and notes
- `TestCopilotScriptsLeave` decides line one, `TestCopilotHooksNameNoScript` line two, the hook cases line three, and a live check line four
- the approach adds no config key

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test src/quack/hook_verb_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/quack/hook_verb_test.go
- src/quack/setup_verb_test.go
- src/modules/hooks/copilot_test.go
- src/modules/hooks/down_test.go
- src/modules/edits/mutations_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

All seventeen tests the draft names fail on their own assertion, against stubs that return zero values.

- The retry fault comes from a failing log, since a down door never faults: it refuses a guarded call or lets it through.
- The real door's test runs the ask against a loopback test server, the one way to check the bearer token and the standing file.
- The test builds the script path from parts, or its own grep would keep it red.
- No Go port of the down door stood, so down.go ports it fresh.
- ReplyOf returns a map, so a reply of nothing and an empty object stay apart.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- TestCopilotScriptsLeave and TestCopilotHooksNameNoScript fail on lines one and two, the TestHook cases on line three, and a live check answers line four
- the hooks door, the log and the clock reach the tests as fakes, and the one real door case runs against a loopback test server

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
