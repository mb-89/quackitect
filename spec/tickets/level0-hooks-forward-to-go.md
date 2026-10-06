---
kind: [[ticket]]
state: open
step: gate
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
    hash_before: 668da7c973445974e6e4c0443f892dbd72aafda7
    hash_after: 668da7c973445974e6e4c0443f892dbd72aafda7
    inputs:
      - name: ask
        hash: 447757a42396b889
        size: 610
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box fb4ccb7cacc7 · claude-code-remote
    hash_before: 874ad006f6fca0a9863b8e719579f887a2767800
    hash_after: 874ad006f6fca0a9863b8e719579f887a2767800
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/modules/hooks fails
    inputs:
      - name: design/draft
        hash: 0a94dea3fed559cf
        size: 7272
    def: 08e16d07b0de477c
  - step: design/draft
    hand: box fb4ccb7cacc7 · claude-code-remote
    hash_before: f324afeb35937d52f8be51e7cc46045203b27041
    hash_after: f324afeb35937d52f8be51e7cc46045203b27041
    inputs:
      - name: ask
        hash: 447757a42396b889
        size: 610
    def: c01ae0f2ace0cecb
  - step: design/tests-red
    hand: box fb4ccb7cacc7 · claude-code-remote
    hash_before: c8af34dec9e0b80ddfe6872e3de0d7c86dc08115
    hash_after: c8af34dec9e0b80ddfe6872e3de0d7c86dc08115
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/modules/hooks fails
    inputs:
      - name: design/draft
        hash: d5c38a694506234e
        size: 7730
    def: 08e16d07b0de477c
group: javascript-leaves
---

# Ask

The level zero hooks hold no logic Go can hold. Each hands its event to the hooks door, a verb or the index, and the dead road to the old server leaves.

The hook module keeps the plugin libraries loaded, and a rule changes in two languages.

- `git grep -n "\.\./lib/" -- .claude/skills/level0/hooks` answers nothing
- `git grep -n "/event" -- .claude/skills/level0/hooks src/stub` answers nothing
- `go test ./src/modules/hooks/...` passes a test of the spawn tag, the reply probe row and the session file, each through the hooks door
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

1. level0.js becomes the forwarder. It posts every event to the door hooks.json names, with the bearer token.
2. The old road leaves: ask, posted, url, opens, repoints, alive, caged, spawns, besides, spoke, missingLine, holdsStop, probes, wrote.
3. configOf leaves, since migration.go admits the cage key as new alone, and no Go code serves /event.
4. The forwarder keeps the stepOf effect mapping, merged, the clear holder and the stream reader, which the engine reaches from JavaScript alone.
5. The door's Hook gains writesSession on session.start, probes for the probe.reply row, and readsTranscript.
6. session.go writes the id and the harness. A post naming no id writes nothing.
7. probe.go owns ReplyMarker, ReplyEvent and slim, and probe_reply.go points at them.
8. spawn.go puts the spawn tag ahead of the prompt. A spawn the hook makes itself carries no tag.
9. Go owns the event list, and keeps fill on tool.call and classic.Stop alone.
10. The forwarder posts the newest transcript rows, cut to role, id, text and a results flag, and Go picks.
11. Where a post fails, the forwarder runs `se-index verb src/scripts hook down <event>` once and hands its answer on.
12. hook_down.go holds the cloud guard, the standing start, the start reasons, the cage block and the fall line.
13. Where no binary stands on a cloud box, the forwarder runs install.sh, then the down word.
14. pull-tool.js drops the index tool intercept, since the door already answers index tools.
15. pull-tool.js registers what `se-index tools` and `ticket pull --spec` print.
16. cage.js, start.js, clear.js, shape.js and transcript.js go. serve.js takes START and reasonOf until its own child removes it.
17. The stub bridgehead drops its /event probe and always runs the standing, which starts a door where none answers.
Weighed: raw transcript rows break the body cap, so the forwarder keeps the field cut, and Go keeps the selection.
Weighed: a box with neither binary nor sh runs uncaged and says so, against a second copy of the guard in JavaScript.
Assumed: copilot-hooks-run-in-go and probes-leave-node land first and remove copilot-door.js, probe-dry.js and copilot.test.js, the scripts still importing cage.js.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/modules/hooks/hooks.go: Door.Hook
- src/modules/hooks/spawn.go: Door.spawned
- src/modules/hooks/marks.go: handIn, reads the session file
- src/pull/pull_holds.go: reads the session file
- src/branches/hand.go: reads the session file
- src/quack/probe_reply.go: readsReply
- src/quack/probe_cold.go: hookRan and bridgeheadRow
- src/quack/hook_verb.go: hookVerb, gains the down word
- src/quack/serve_verb.go: serveDetachedStart, which the down word reuses
- src/quack/ticket_pull.go: Pulling, gains --spec and a JSON tool answer
- .claude/skills/level0/hooks/pull-tool.js: register
- src/stub/.claude/skills/level0/hooks/bridgehead.js: starts
- src/scripts/serve.js: startOf and servesHere
- src/scripts/copilot-door.js and probe-dry.js: import cage.js, and leave first under their own children
- test/level0/copilot.test.js: imports refusedText from cage.js, and leaves under copilot-hooks-run-in-go
- test/level0: hooks, cage, caged-door, door-spawn, door-clear, read-tools, hand, level1, bridgehead, serve, clear, shape, start, start-constants, transcript and vale-rows tests
- test/contract/tree.test.js: the session file copy case

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/modules/hooks/spawn_test.go: TestASpawnCarriesTheHandsTagOffTheSessionFile
- src/modules/hooks/spawn_test.go: TestASpawnTheHookMakesItselfCarriesNoTag
- src/modules/hooks/probe_test.go: TestTheFirstCallAfterAMarkedPromptWritesTheReplyProbeRow
- src/modules/hooks/probe_test.go: TestAPromptWithNoMarkerAndAHelpersCallWriteNoProbeRow
- src/modules/hooks/session_test.go: TestTheSessionStartWritesTheSessionFile
- src/modules/hooks/session_test.go: TestASessionStartNamingNoIdWritesNoSessionFile
- src/modules/hooks/transcript_test.go: TestAPromptTakesTheNewestRowAsItsBefore
- src/modules/hooks/transcript_test.go: TestASpokePostTakesTheLastTextsAndTheStepText
- src/modules/hooks/hooks_test.go: TestTheDoorWritesNoEventOutsideItsList
- src/modules/hooks/hooks_test.go: TestTheFillRidesTheMainAgentsCallAndStopAlone
- src/quack/hook_down_test.go: TestTheDownWordStartsTheIndexOnACloudBoxAlone
- src/quack/hook_down_test.go: TestTheDownWordAnswersTheDoorOnceItStands
- src/quack/hook_down_test.go: TestTheDownWordRefusesAGuardedCallWhileTheDoorStandsDown
- src/quack/hook_down_test.go: TestTheDownWordHandsThePromptContextTheCageBlock
- src/quack/hook_down_test.go: TestEveryStartCodeReadsAsALevelAndAReason
- src/quack/hook_down_test.go: TestTheSessionStartFallSaysNothingToThePerson
- src/pull/pull_test.go: TestThePullToolAnswersItsSpawnApart
- src/pull/pull_test.go: TestThePullSpecTakesTheFourVerdicts
- src/quack/hooks_folder_test.go: TestTheLevelZeroHooksImportNoLibrary
- src/quack/hooks_folder_test.go: TestNoHookOrStubPostsTheOldServer
- test/level0/caged-door.test.js: a door down runs the down word and hands its answer on
- test/level0/caged-door.test.js: a cloud box with no binary installs, then runs the down word
- test/level0/bridgehead.test.js: the attach always runs the standing

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first: no review has read this draft, and the send-back came from the process change, which adds the config key line to the checklist

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- .claude/skills/level0/hooks/level0.js
- .claude/skills/level0/hooks/pull-tool.js
- .claude/skills/level0/hooks/hooks.json
- .claude/skills/level0/hooks/cage.js
- .claude/skills/level0/hooks/start.js
- .claude/skills/level0/hooks/clear.js
- .claude/skills/level0/hooks/shape.js
- .claude/skills/level0/hooks/transcript.js
- src/stub/.claude/skills/level0/hooks/bridgehead.js
- src/modules/hooks/hooks.go
- src/modules/hooks/hooks_test.go
- src/modules/hooks/spawn.go
- src/modules/hooks/spawn_test.go
- src/modules/hooks/session.go
- src/modules/hooks/session_test.go
- src/modules/hooks/probe.go
- src/modules/hooks/probe_test.go
- src/modules/hooks/transcript.go
- src/modules/hooks/transcript_test.go
- src/quack/probe_reply.go
- src/quack/hook_verb.go
- src/quack/hook_down.go
- src/quack/hook_down_test.go
- src/quack/hooks_folder_test.go
- src/pull/pull.go
- src/pull/pull_test.go
- src/scripts/serve.js
- test/level0/cage.test.js
- test/level0/caged-door.test.js
- test/level0/door-spawn.test.js
- test/level0/door-clear.test.js
- test/level0/read-tools.test.js
- test/level0/hand.test.js
- test/level0/level1.test.js
- test/level0/pull-spawn-hook.test.js
- test/level0/bridgehead.test.js
- test/level0/serve.test.js
- test/level0/hooks.test.js
- test/level0/vale-rows.test.js
- test/contract/tree.test.js
- test/level0/start.test.js
- test/level0/start-constants.test.js
- test/level0/start-road.test.js
- test/level0/transcript.test.js
- test/level0/shape.test.js
- test/level0/clear.test.js
- test/level0/reply-hook.test.js
- test/level0/besides.test.js
- test/level0/rewritten-event.test.js
- test/level0/index-tools.test.js
- test/contract/cloud-start.test.js
- spec/design_output/level0.md

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- I reopened the hook files, migration.go, hook_down.go and the Go door files on this commit, and checked the lib imports, the /event road, the cage key and configOf there
- the callers come off a git grep on each hook file, each lib import, the session file, Pulling and /event, rerun after the sync, which moved boot.js out and copilot.test.js in
- the two hooks_folder_test.go cases decide the grep lines, the spawn, probe and session cases the go test line, the dry probe's whole run line four, and a live check line five
- the approach adds no config key: it drops the cage key read from level0.js, and the down word and --spec ride the verb's arguments

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test src/modules/hooks/session_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/modules/hooks/spawn_test.go
- src/modules/hooks/probe_test.go
- src/modules/hooks/session_test.go
- src/modules/hooks/transcript_test.go
- src/modules/hooks/hooks_test.go
- src/quack/hook_down_test.go
- src/quack/hooks_folder_test.go
- src/pull/pull_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The twenty Go cases the redraft names still fail on their own assertion, against the stubs the first red pass left. The redraft changed no test, since the send-back came from the process alone.

- Every down word case prints an empty answer, and the start reasons read empty for every code.
- The two folder cases fail on the git grep, which still finds the lib imports and the /event road.
- The two pull cases read an empty spawn answer and an empty spec.
- The same package runs fail Copilot and probe cases, which belong to copilot-hooks-run-in-go and probes-leave-node.
- The three JavaScript cases land at implement, beside the forwarder they test.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the two folder cases fail on the two grep lines, the spawn, probe and session cases on the go test line, the dry probe's whole run answers line four, and a live check line five
- the disk, the post, the process runs and the clock reach the tests as fakes, and the folder cases read the tree through git alone

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
