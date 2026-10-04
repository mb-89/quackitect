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
group: config-verbs-run-in-go
step: gate
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box 6183eb94e809 · claude-code-remote
    hash_before: 6591e6d658a269bccdb387f6f74be4383a4115fd
    hash_after: 6591e6d658a269bccdb387f6f74be4383a4115fd
    inputs:
      - name: ask
        hash: 46dae2bca90f0fef
        size: 803
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box 6183eb94e809 · claude-code-remote
    hash_before: 5e685208c3582939d8cb9c0658c0a2fadd0a6c5c
    hash_after: 5e685208c3582939d8cb9c0658c0a2fadd0a6c5c
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/quack fails
    inputs:
      - name: design/draft
        hash: 5348ff22bc181506
        size: 4476
    def: 08e16d07b0de477c
---

# Ask

The verbs config, fix, project, rules, standing and doors run in Go, each registered in its own file under `src/quack`, and their JavaScript leaves the tree.

The config, the projection and the standing read the index in Go, so `cli-check.js` loses its last callers but the landing ones. Until it lands, these verbs start node, and `cli-check.js`, `cli-fix.js` and the projection stay in the tree.

- `go test ./src/quack ./src/modules/...` passes, with a case for every road the verbs' JavaScript tests cover
- `./RUNME.sh <verb>` reaches no node for each of config, fix, project, rules, standing and doors
- `ls src/scripts/verbs` names none of config, fix, project, rules, standing and doors
- a search of `src` names no importer of a JavaScript module this group deletes
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

Each verb registers its Go answer from its own file under src/quack, through register in src/quack/registry.go, so nodeAccept and the road hand it no node. Each file holds the verb and its doors as arguments, so a case hands in a temp root.

- config (verb_config.go): the rows come off configAt, which the config module resolves; a value prints as String(value) prints it in JavaScript, a string bare and every other literal as it stands. A key with no row exits 2 with the line readConfig prints. Two or more words write the key into .se/.runtime/config.json, coerced to the type the catalog declares, nested as nest and deeply in the level0 lib write it, and append the info row the log module reads, kind config, with the layer as detail. The faults line reads the declared type against the tracked file's literal, as faultsIn does.
- fix (verb_fix.go): the flags as fixFlags reads them; vale off the survey or the runtime bin as lsp toolAt finds it; up to five rounds of the calm then vale fix --apply over the paths, until the walk's stamp holds; then biome check --write. The calm sentence-cases each ShoutedLead span Vale names, as calmed in shout.js does.
- project (verb_project.go over a new package src/projection): the four shapes projections.json names, written as projection.js writes them, the stale targets removed. A golden case projects the tree into a temp root and reads every target byte for byte against the tree.
- rules (verb_rules.go): each yml of VoiceVale, VoiceShape and VoiceScript, its name padded to the rule column, then its message.
- doors (verb_doors.go): the doors under src/doors against the contract tests under test/contract.
- standing (verb_standing.go): brief.LayerFor over the layered roots with no kind, then the canary off brief.CountsOf and stop.enabled.

The JavaScript leaves: the six programs, cli-fix.js, shout.js, and readConfig, fix, calm, stamp, project, listRules and standing in cli-check.js. doorsHold, projectionsHold, projections, under and the projection lib stay, since the check program and the mint read them until their own groups port them. The programs test reads the programs folder, so a ported verb leaves it with its program.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/quack/verbs.go verbRoad, which hands a registered verb to its twin
- src/quack/twins.go nodeAccept, which answers a registered verb off goAnswer
- .claude/commands/se-config-*.md, which run ./RUNME.sh config <key> <value>
- src/scripts/check-verb.js, which keeps doorsHold and projectionsHold out of cli-check.js
- test/contract/verb-programs.test.js RUNS, which imports the six programs
- test/level0/fix.test.js, which imports fix and fixFlags
- test/level0/topic-readers.test.js, which imports readConfig
- test/contract/vale-fix.test.js, which imports calmed off shout.js

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/quack/verb_config_test.go TestConfigPrintsEveryRowAndItsLayer
- src/quack/verb_config_test.go TestConfigRefusesAKeyNoLayerAnswers
- src/quack/verb_config_test.go TestConfigWritesTheLocalLayerAndALogRow
- src/quack/verb_fix_test.go TestFixRefusesAnUnknownFlag
- src/quack/verb_fix_test.go TestFixCalmsAShoutedLead
- src/quack/verb_project_test.go TestProjectWritesTheTreeTargetsByteForByte
- src/quack/verb_rules_test.go TestRulesListsEveryStyleMessage
- src/quack/verb_doors_test.go TestDoorsNamesADoorWithNoContract
- src/quack/verb_standing_test.go TestStandingPrintsTheLayerAndTheCanary
- src/quack/registry_test.go TestTheConfigGroupRegistersEachVerb

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/quack/verb_config.go, verb_fix.go, verb_project.go, verb_rules.go, verb_doors.go, verb_standing.go and a test beside each
- src/projection/*.go
- src/scripts/verbs/config.js, fix.js, project.js, rules.js, standing.js, doors.js, deleted
- src/scripts/cli-fix.js and .claude/skills/level0/lib/shout.js, deleted
- src/scripts/cli-check.js
- test/level0/fix.test.js, deleted
- test/level0/topic-readers.test.js
- test/contract/vale-fix.test.js
- test/contract/verb-programs.test.js

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every file, function and verb the approach names stands opened: cli-check.js, cli-doors.js, config.js, shout.js, guidance.js, projection.js outline, registry.go, twins.go, verbs.go, brief.go, layer.go, lsp door.go
- the callers list names the road, the node module, the config commands, and every JS importer a grep of src and test finds
- each done_when line meets a test: the go cases, a road case per verb, ls of the programs folder, a grep, and the check

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/quack

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/quack/verb_config_test.go
- src/quack/verb_fix_test.go
- src/quack/verb_rules_test.go
- src/quack/verb_doors_test.go
- src/quack/verb_standing_test.go
- src/quack/registry_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Every case fails on its own assertion against stub verbs that answer exit 1 and print nothing, and the registry case finds no config. The registry case for an unregistered verb named config, so it now names words nothing registers. The project cases come from a helper porting the projection, and land red with their own commit.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every done_when line meets a test: the go cases per verb, the registry case for the road, and the ls, grep and check lines the implement step runs
- the doors the verbs reach ride in as arguments: the root, the clock, the environment and the tool runner, so no case touches the box past a temp root

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
