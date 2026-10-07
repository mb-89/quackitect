---
kind: [[ticket]]
state: closed
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
group: javascript-leaves
depends_on: ["git-hooks-run-in-go", "probes-leave-node", "extension-imports-stay-inside"]
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box fb4ccb7cacc7 · claude-code-remote
    hash_before: aeaf471ca9ffc6b84145aa3f8344a78c1c56849c
    hash_after: aeaf471ca9ffc6b84145aa3f8344a78c1c56849c
    inputs:
      - name: ask
        hash: 4bd97f6aec4aa1b6
        size: 454
    def: c01ae0f2ace0cecb
  - step: design/tests-red
    hand: box fb4ccb7cacc7 · claude-code-remote
    hash_before: 6906f6b579e44f9dea7b3feb8e79d3f8240b9063
    hash_after: 6906f6b579e44f9dea7b3feb8e79d3f8240b9063
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/quack fails
    inputs:
      - name: design/draft
        hash: 619a2ce107374093
        size: 13619
    def: 08e16d07b0de477c
  - step: gate
    hand: box fb4ccb7cacc7 · claude-code-remote · helper-4
    hash_before: 3f555e2a91662afd36fd5507f4ff3397ee243fea
    hash_after: 3f555e2a91662afd36fd5507f4ff3397ee243fea
    inputs:
      - name: design/draft
        hash: 619a2ce107374093
        size: 13619
      - name: design/tests-red
        hash: c4466ee89d0179fe
        size: 1191
    def: dc4904ab364efa10
  - step: implement/change
    hand: box b1ba21c2e626 · claude-code-remote
    hash_before: 81ada76d60b4ade1fa2eb744c65f802232f41b77
    hash_after: 31df1c2c74dddb316756a8ed51fb6b53a373358d
    answered:
      - name: lint
        exit: 0
        said: ""
    def: f150b8c0dc20fe45
  - step: implement/tests-green
    hand: box b1ba21c2e626 · claude-code-remote
    hash_before: 688fbd249e8fb513e0609f899d54f17094c95378
    hash_after: 688fbd249e8fb513e0609f899d54f17094c95378
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "    2.5  test/contract/vale-fix.test.js a contraction is written out, and the line keeps its case"
    inputs:
      - name: design/tests-red
        hash: c4466ee89d0179fe
        size: 1191
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

`src/bridge` leaves the tree with its tests. Its findings reader and its config reader take their Go homes, and every other file already has a Go twin.

A library no process runs keeps its tests and its twins, and a rule changes in two places.

- `git ls-files src/bridge` answers nothing
- `go test ./src/modules/check/... ./src/config/...` passes a test of the findings rows and the slice config the bridge read
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

1. Every file under `src/bridge` leaves, with each test the group inventory gives this ticket.
2. `test/level0/hooks.test.js` leaves too, since `TestWholeAfterAppliesEachEdit` in `src/modules/hooks/write/door_test.go` holds it.
3. `vale-rows.test.js`, `lint-twins.test.js` and the contract `cli-read.test.js` leave, since each reads leaving code alone.
4. `lintVerb` in `src/quack/verb_lint.go` already answers the findings rows, so the findings reader has its Go home.
5. `GridHolds` stays held by `tree-extension.test.js`. `StopFolderIsData` loses its last runner, and `plugin-libs-leave` deletes its rule.
6. `cli-read.js` drops its node lint, which no road runs. It keeps `version`, `namesIn` and `show`.
7. `show` takes the body of `showOf`, so `cli-check.js` reads it unchanged.
8. `voiceOver`, `valeArgvOf`, `readsText` and `REFUSES` move into `src/scripts/quack-topic.js`, beside `keptOf`.
9. `pull-chapter.js`, `ticket-ask-lint.js` and `test/contract/process.test.js` import them from `quack-topic.js`.
10. `registeredPort` moves into `src/scripts/vehicle.js` beside `readRegister`, and `serve.js` imports it there.
11. `doorsHere` in `cli-doors.js` reads the slice names off the schema's `migration` block.
12. `cli-doors.js` drops its re-export of `OURS` and `PARKED`, which nothing imports.
13. `config-golden.js` drops the two bridge readers, and `readers.golden.json` drops their sections.
14. `config.Value`, `config.Where` and `config.Drop` in `src/config/config.go` answer what `config.js` answered.
15. `cage.test.js` drops its JavaScript layer case, which `spawn_test.go` reads over the same table.
16. `coldPath` in `src/quack/probe_cold.go` drops `src/bridge/guidance.js`, and its test drops the path.
17. A comment naming a bridge constant as an owner names the Go owner instead.
18. `lsp.md`, `pull.md`, `stop.md` and `migration.md` point at the Go owners in place of the bridge files.
19. New Go tests pin the walk, the exemption row, the closed ticket and the slice modes the bridge read.
Weighed: moving `findings.js` whole into `src/scripts` for the lint group, against cutting a node lint no road runs. The cut leaves no dead copy.
Assumed: the owner accepts edits to the lint group's `cli-read.js` and `process.test.js`, and the deletion of `vale-rows.test.js`.
Assumed: `level0-hooks-forward-to-go` lands first, and the `WAIT_CALL` comment in `level0.js` changes only where it still stands.
Assumed: the Go tests of the check and the config pass at once, since the twins stand. `TestTheColdPathNamesNoBridgeFile` stands red.
Weighed: the owner leaves the lint and Vale scripts to the lint-without-vale group. This ticket repoints their imports and drops the lint road nothing runs, and ports none of them.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/scripts/cli-doors.js: doorsHere, which reads SLICES off config.js
- src/scripts/cli-doors.js: the module's re-export of OURS and PARKED off findings.js
- src/scripts/cli-read.js: readingFor, findingsDoors, lint, walk and show, which read findings.js
- src/scripts/cli-check.js: tuiDoors, which reads namesIn and show off cli-read.js and it.slices
- src/scripts/quack-topic.js: readsNew, which reads it.slices
- src/scripts/config-golden.js: readersOf, which reads asksText and whereFrom off config.js
- test/level0/config-golden.js: the top-level writeGolden call
- src/quack/config_test.go: TestReadersGolden, which reads readers.golden.json
- src/scripts/pull-chapter.js: voiceFaults, which reads voiceOver
- src/scripts/ticket-ask-lint.js: askFaults, which reads voiceOver
- test/contract/process.test.js: the case a ticket minted off every route draws no finding, which reads REFUSES
- src/scripts/serve.js: portIn, which reads registeredPort off vehicle.js
- test/level0/serve.test.js: the portIn cases
- test/level0/check-server.test.js: the case reading doors.slices
- test/level0/cli-read.test.js: the cases on findingsDoors, lintFoundOf and lintRows
- test/level0/cage.test.js: the JavaScript layer matches the case table
- src/quack/commit.go: landingDoors.lands, which reads coldIn over coldPath
- src/quack/probe_cold_test.go: TestTheColdPathTakesTheHooksFolderAndTheNamedFiles
- test/contract/cli-doors.test.js: every case, which leaves with the bridge
- test/contract/cli-mint-callers.test.js: every case, which leaves with the bridge
- test/contract/cli-read.test.js: every case, which leaves with the bridge
- test/contract/lint-twins.test.js: every case, which leaves with the bridge
- test/contract/one-config.test.js: every case, which leaves with the bridge
- test/contract/one-reading.test.js: every case, which leaves with the bridge
- test/contract/stop-rules.test.js: every case, which leaves with the bridge
- test/contract/write-door-cases.test.js: every case, which leaves with the bridge
- test/level0/agent.test.js: every case, which leaves with the bridge
- test/level0/answer-door.test.js: every case, which leaves with the bridge
- test/level0/answer-origin.test.js: every case, which leaves with the bridge
- test/level0/answer-read.test.js: every case, which leaves with the bridge
- test/level0/answer.test.js: every case, which leaves with the bridge
- test/level0/apply-door.test.js: every case, which leaves with the bridge
- test/level0/ask-door.test.js: every case, which leaves with the bridge
- test/level0/bash-bless.test.js: every case, which leaves with the bridge
- test/level0/bash-commit.test.js: every case, which leaves with the bridge
- test/level0/bash-desk.test.js: every case, which leaves with the bridge
- test/level0/bash-engine.test.js: every case, which leaves with the bridge
- test/level0/bash-ticket.test.js: every case, which leaves with the bridge
- test/level0/binding.test.js: every case, which leaves with the bridge
- test/level0/brief-cases.test.js: every case, which leaves with the bridge
- test/level0/canary-debt.test.js: every case, which leaves with the bridge
- test/level0/cloud-ask.test.js: every case, which leaves with the bridge
- test/level0/code-door.test.js: every case, which leaves with the bridge
- test/level0/command-cases.test.js: every case, which leaves with the bridge
- test/level0/commit-guards-cases.test.js: every case, which leaves with the bridge
- test/level0/config-door.test.js: every case, which leaves with the bridge
- test/level0/context-handover.test.js: every case, which leaves with the bridge
- test/level0/findings.test.js: every case, which leaves with the bridge
- test/level0/grace-asks.test.js: every case, which leaves with the bridge
- test/level0/grace.test.js: every case, which leaves with the bridge
- test/level0/guidance.test.js: every case, which leaves with the bridge
- test/level0/hand-tools.test.js: every case, which leaves with the bridge
- test/level0/handover-door.test.js: every case, which leaves with the bridge
- test/level0/holds-leave.test.js: every case, which leaves with the bridge
- test/level0/hooks.test.js: every case, which leaves with the bridge
- test/level0/named.test.js: every case, which leaves with the bridge
- test/level0/note-answer.test.js: every case, which leaves with the bridge
- test/level0/one-reader.test.js: every case, which leaves with the bridge
- test/level0/outside-hand.test.js: every case, which leaves with the bridge
- test/level0/plan-queue.test.js: every case, which leaves with the bridge
- test/level0/plan.test.js: every case, which leaves with the bridge
- test/level0/projection.test.js: every case, which leaves with the bridge
- test/level0/prose.test.js: every case, which leaves with the bridge
- test/level0/pulled.test.js: every case, which leaves with the bridge
- test/level0/review-cases.test.js: every case, which leaves with the bridge
- test/level0/review-door.test.js: every case, which leaves with the bridge
- test/level0/search-door.test.js: every case, which leaves with the bridge
- test/level0/serve-port.test.js: every case, which leaves with the bridge
- test/level0/session-layer.test.js: every case, which leaves with the bridge
- test/level0/stop-binding.test.js: every case, which leaves with the bridge
- test/level0/stop-door.test.js: every case, which leaves with the bridge
- test/level0/stop-helper.test.js: every case, which leaves with the bridge
- test/level0/stop-hold.test.js: every case, which leaves with the bridge
- test/level0/style-top.test.js: every case, which leaves with the bridge
- test/level0/tools-door.test.js: every case, which leaves with the bridge
- test/level0/topic-readers.test.js: every case, which leaves with the bridge
- test/level0/trunk-door.test.js: every case, which leaves with the bridge
- test/level0/vale-rows.test.js: every case, which leaves with the bridge
- test/level0/vehicle.test.js: every case, which leaves with the bridge
- test/level0/wait.test.js: every case, which leaves with the bridge
- test/level0/write-bless.test.js: every case, which leaves with the bridge
- test/level0/write.test.js: every case, which leaves with the bridge

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/modules/check/textfaults_test.go: TestTheLintWalkPassesEveryParkedFolderAndADraft
- src/modules/check/textfaults_test.go: TestAnExemptionNamingNoReasonDrawsARowAndAReasonClearsIt
- src/modules/check/history_test.go: TestAClosedTicketKeepsNoRowButItsConflictMarker
- src/config/config_test.go: TestASliceModeReadsTheLocalLayerAgainAtEachAsk
- src/config/config_test.go: TestASliceModeNoFileSetsReadsTheSchemaDefault
- src/quack/probe_cold_test.go: TestTheColdPathNamesNoBridgeFile

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/scripts/cli-doors.js
- src/scripts/cli-read.js
- src/scripts/quack-topic.js
- src/scripts/pull-chapter.js
- src/scripts/ticket-ask-lint.js
- src/scripts/serve.js
- src/scripts/vehicle.js
- src/scripts/config-golden.js
- src/quack/testdata/readers.golden.json
- test/level0/cage.test.js
- test/level0/cli-read.test.js
- test/contract/process.test.js
- src/quack/probe_cold.go
- src/quack/probe_cold_test.go
- src/modules/check/textfaults.go
- src/modules/check/textfaults_test.go
- src/modules/check/history_test.go
- src/config/config.go
- src/config/config_test.go
- src/modules/lsp/tools.go
- src/quack/verb_fix.go
- src/quack/tui_verb.go
- src/quack/battery.go
- src/quack/probe_reply.go
- src/modules/hooks/brief.go
- src/modules/hooks/stops.go
- .claude/skills/level0/hooks/level0.js
- spec/design_output/lsp.md
- spec/design_output/pull.md
- spec/design_output/stop.md
- spec/design_output/migration.md
- src/bridge/agent.js
- src/bridge/answer-read.js
- src/bridge/answer.js
- src/bridge/apply.js
- src/bridge/ask.js
- src/bridge/bash.js
- src/bridge/binding.js
- src/bridge/bless.js
- src/bridge/cloud-ask.js
- src/bridge/code.js
- src/bridge/config.js
- src/bridge/findings.js
- src/bridge/grace.js
- src/bridge/guidance.js
- src/bridge/handover.js
- src/bridge/index-tools.js
- src/bridge/plan.js
- src/bridge/projection.js
- src/bridge/prose.js
- src/bridge/review.js
- src/bridge/search.js
- src/bridge/stop.js
- src/bridge/tools.js
- src/bridge/vale-rows.js
- src/bridge/vehicle.js
- src/bridge/wait.js
- src/bridge/write.js
- test/contract/cli-doors.test.js
- test/contract/cli-mint-callers.test.js
- test/contract/cli-read.test.js
- test/contract/lint-twins.test.js
- test/contract/one-config.test.js
- test/contract/one-reading.test.js
- test/contract/stop-rules.test.js
- test/contract/write-door-cases.test.js
- test/level0/agent.test.js
- test/level0/answer-door.test.js
- test/level0/answer-origin.test.js
- test/level0/answer-read.test.js
- test/level0/answer.test.js
- test/level0/apply-door.test.js
- test/level0/ask-door.test.js
- test/level0/bash-bless.test.js
- test/level0/bash-commit.test.js
- test/level0/bash-desk.test.js
- test/level0/bash-engine.test.js
- test/level0/bash-ticket.test.js
- test/level0/binding.test.js
- test/level0/brief-cases.test.js
- test/level0/canary-debt.test.js
- test/level0/cloud-ask.test.js
- test/level0/code-door.test.js
- test/level0/command-cases.test.js
- test/level0/commit-guards-cases.test.js
- test/level0/config-door.test.js
- test/level0/context-handover.test.js
- test/level0/findings.test.js
- test/level0/grace-asks.test.js
- test/level0/grace.test.js
- test/level0/guidance.test.js
- test/level0/hand-tools.test.js
- test/level0/handover-door.test.js
- test/level0/holds-leave.test.js
- test/level0/hooks.test.js
- test/level0/named.test.js
- test/level0/note-answer.test.js
- test/level0/one-reader.test.js
- test/level0/outside-hand.test.js
- test/level0/plan-queue.test.js
- test/level0/plan.test.js
- test/level0/projection.test.js
- test/level0/prose.test.js
- test/level0/pulled.test.js
- test/level0/review-cases.test.js
- test/level0/review-door.test.js
- test/level0/search-door.test.js
- test/level0/serve-port.test.js
- test/level0/session-layer.test.js
- test/level0/stop-binding.test.js
- test/level0/stop-door.test.js
- test/level0/stop-helper.test.js
- test/level0/stop-hold.test.js
- test/level0/style-top.test.js
- test/level0/tools-door.test.js
- test/level0/topic-readers.test.js
- test/level0/trunk-door.test.js
- test/level0/vale-rows.test.js
- test/level0/vehicle.test.js
- test/level0/wait.test.js
- test/level0/write-bless.test.js
- test/level0/write.test.js

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- Every file, function and verb named stands opened, and each claim stands checked there, the Go lint verb and the twins among them.
- The callers list names every importer git grep finds of each bridge file, and every caller of each moved or cut function.
- `git ls-files src/bridge` decides the first line, the six new Go tests the second, and `./RUNME.sh check` the third.
- The approach adds no config key, so no default file changes.

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/quack/probe_cold_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/quack/probe_cold_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The check and config cases pass at once, since their Go twins stand. `TestTheColdPathNamesNoBridgeFile` fails on its own assertion, because `coldPath` still names `src/bridge/guidance.js`.

What surprises me:

- The config package holds no fake of its own.
- Its doors are plain functions, so its cases read a temp root through `rootWith`.
- No case reads the real tree.
- `TestTheColdPathTakesTheHooksFolderAndTheNamedFiles` named `src/bridge/guidance.js`.
- That case now drops the path, so it passes before and after the change.
- A `walkPasses` comment in `textfaults.go` still names `src/bridge/findings.js` as its owner.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- `git ls-files src/bridge` is a checkpoint the hand answers, and it lists the bridge files today. The six Go cases decide the second line, and `TestTheColdPathNamesNoBridgeFile` stands red. `./RUNME.sh check` exits 0 at tests-green.
- The check cases read a memory tree through `Texts`. The config cases read a temp root through `rootWith`, since the package's doors are plain functions. The cold path case reads `coldPath` alone.

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- lint-cut-on-group-ticket: The cli-read.js lint cut and the vale-rows.test.js deletion touch the lint group's scripts. Record both under Discussion on javascript-leaves for that group.
- stop-folder-keeps-runner: test/contract/tree.test.js still runs StopFolderIsData, so the rule keeps a runner. Name that case on plugin-libs-leave.

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

go build ./...

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- The change touches the files the draft names, and none past them; most named scripts stand gone already, so fewer change.
- No new door: the slice read goes through the disk door cli-doors.js already holds.
- Each comment past a deleted bridge owner now names the Go owner, and src/scripts/cli-doors.js names the ticket over slicesIn.
- REFUSES stands in quack-topic.js alone, and the walk and parked lists point at walkPasses and parkedFolders.

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh branch test src/quack/probe_cold_test.go

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The folder `src/bridge` leaves the tree, since no process ran it. The doors read the slice names off the schema migration block, so a new slice needs no list. `REFUSES` stands beside `keptOf` in `src/scripts/quack-topic.js`. The JS tests of bridge code leave with it, and the cases of live code in the vehicle and outside-hand tests stay. Each comment that named a bridge file as owner now names the Go owner.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- The change touches files the draft names, and no file past them.
- The slice read goes through the disk door `cli-doors.js` holds, which has its fake.
- The comment over `slicesIn` names this ticket.
- `REFUSES` stands in one file, and the Go lists point at `walkPasses` and `parkedFolders`.

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
