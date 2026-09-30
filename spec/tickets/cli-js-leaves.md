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
group: quack-verbs-switch-over
depends_on: ["agents-call-quack-directly"]
record:
  - step: design/draft
    hand: box d85989c4d4d5 · claude-code-remote
    hash_before: 9975b2726c344971398f6cac5af0b9aca56414db
    hash_after: 9975b2726c344971398f6cac5af0b9aca56414db
    inputs:
      - name: ask
        hash: 3ee6509b247fc56f
        size: 193
    def: 71651f49796eeda4
  - step: design/tests-red
    hand: box d85989c4d4d5 · claude-code-remote
    hash_before: bbc8a9f98841e6efbe0e66084bfac8c4fe55110b
    hash_after: bbc8a9f98841e6efbe0e66084bfac8c4fe55110b
    answered:
      - name: tests
        exit: 1
        said: assertion, 5 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: c4355428f77acdd7
        size: 4472
    def: 08e16d07b0de477c
  - step: gate
    hand: box d85a88bc0dd4 · claude-code-remote
    hash_before: 2f9b96cc77d4796d33668dc8a4f43312f432d328
    hash_after: 2f9b96cc77d4796d33668dc8a4f43312f432d328
    inputs:
      - name: design/draft
        hash: c4355428f77acdd7
        size: 4472
      - name: design/tests-red
        hash: 30e9911a371b1eed
        size: 752
    def: dc4904ab364efa10
  - step: implement/change
    hand: box d8888f6242d7 · claude-code-remote
    hash_before: d3f41bba1ee9519587921f04a49c08d42628c0b9
    hash_after: b97cb182cd86baf4027df8f4c0fe42e00c5a8192
    answered:
      - name: lint
        exit: 0
        said: "spec/tickets/index-reads-loaded-projections.md:296:153: Characters: The character / stands outside the set a paragraph a"
    def: f150b8c0dc20fe45
---

# Ask

`src/scripts/cli.js` and its dispatch leave the tree, with their cases.

Two roads to a verb drift apart again.

- `git ls-files src/scripts/cli.js` answers nothing
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

Go holds the one verb table, and each verb's JavaScript body runs as a program of its own until its port lands.

1. The table. `src/modules/verbs/tree.go` holds `Commands`, every verb in help order with its usage line, the topic verbs among them. `TreeVerbs` reads as `Commands` less the topics. `quack help`, and `quack verb` meeting no verb, print the usage off `Commands`, as `cli.js` prints it today.
2. The programs. `src/scripts/verbs/<verb>.js` holds one program a verb, each a few lines over a shared runner, `src/scripts/verb-run.js`. The runner reads the words past the verb, guards its main, and exits drained, as the foot of `cli.js` does. The bodies `cli.js` holds move by topic: the check, test and tally helpers to `src/scripts/check-verb.js`, theVehicle and theStub to `src/scripts/vehicle-verb.js`, mint, mintFields and drawing to `src/scripts/mint-verb.js`, renameHere to `src/scripts/rename.js`, and serveBridge to `src/scripts/serve.js`.
3. The road. `quack verb <scripts> <verb> ...` runs `node <scripts>/verbs/<verb>.js ...` where no twin answers. The shadow branch of `src/quack/verbs.go` and its log row leave, since the slice stands at new. The node module in `src/quack/twins.go` runs the same program. `RUNME.sh` hands the binary `src/scripts`, and names install.sh where no binary stands. `install.sh` runs the tools program.
4. The spawns. `verbArgv` in `verb-run.js` answers the argv of a verb program, and every JavaScript spawn of `cli.js` calls it: commit-verb.js, work-merge.js, work-review.js, bridge review.js and engine retro mint.js. The hook's pull-tool.js and the extension's lens.js import their own folder alone, so each spells the programs folder again with a comment naming the owner. `placesVerb` in `src/tui/work/workplaces.go` names the branch program.
4. The cage. `VERB_ROOTS` in `lib/bash.js` reads a verb program path as a verb root, naming its verb off the file name, so the ticket-free and landing rules keep reading `node src/scripts/verbs/branch.js done`.
5. The cases. Each test importing a body off `cli.js` imports it off its new file. Each test reading the `verbs` export or the source reads the programs folder, or the file the body moved to.

Weighed and refused: one JavaScript dispatcher under a new name, since it keeps the second table the ask removes; and a Go port of every verb, which phases 5 to 10 carry. Assumed: the quack binary stands wherever a verb runs, since install.sh builds it before any verb.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- RUNME.sh: the verb road and its no-binary fallback
- src/scripts/install.sh: the tools run at its foot
- src/quack/verbs.go: verbRoad, verbs, roadOf and oldDoor
- src/quack/twins.go: nodeAccept
- src/quack/main.go: the help verbs in cliVerbs, through cli.go
- src/tui/work/workplaces.go: placesVerb
- src/scripts/commit-verb.js: the test and check spawns
- src/scripts/work-merge.js: the check --errors spawn
- src/scripts/work-review.js: the check spawn
- src/bridge/review.js: the branch review spawn
- src/engine/retro/mint.js: the argv it mints through
- .claude/skills/level0/hooks/pull-tool.js: CLI_SCRIPT
- src/extension/lib/lens.js: CLI
- .claude/skills/level0/lib/bash.js: VERB_ROOTS, read by freeVerbIn and landingOf
- test/level0 and test/contract: every case importing verbs, testArgv, serveBridge, exitsDrained, renameHere, mintFields or theVehicle off cli.js, or reading its source

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- test/contract/cli-leaves.test.js: cli.js stands nowhere, and no source under src, test or .claude imports or spawns it
- test/contract/cli-leaves.test.js: every verb Go's table lists stands as a program under src/scripts/verbs, and no program stands past the table
- src/quack/verbs_test.go: a verb with no twin runs its program under the scripts folder
- src/quack/verbs_test.go: help and an unknown verb print the usage off Commands
- src/modules/verbs/tree_test.go: TreeVerbs reads as Commands less the topics
- test/level0/verb-run.test.js: verbArgv answers node, the program and the words
- test/level0/bash.test.js: a verb program path reads as a verb root

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first draft

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every file and function named stands opened: cli.js whole, verbs.go, twins.go, workplaces.go, RUNME.sh, install.sh, each spawn site and VERB_ROOTS
- the callers come off a grep for cli.js over the tree, less the tickets and the rationales
- each done_when line names its decider: cli-leaves.test.js for the file, and ./RUNME.sh check for the rest

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- test/contract/cli-leaves.test.js
- test/level0/verb-line.test.js
- test/level0/verb-run.test.js
- src/modules/verbs/tree_test.go
- src/quack/programs_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Each new test fails on its own assertion. cli.js stands, sources name it, and no program folder stands. A verb program reads as no verb root, verbArgv answers nothing, and Commands lists nothing. The usage reads empty. Surprise: the bash test stood at the file ceiling, so the verb cases moved to a file of their own first.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each done_when line meets a red test: cli-leaves.test.js decides the file, and ./RUNME.sh check decides the rest
- the contract test drives the real disk door, and the Go cases touch no outside

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

pass with findings
- cli-callers-the-draft-misses: the callers list leaves out every site naming cli.js past the spawns: the NoUndo strings and comments in src/modules/verbs/verbs.go, the heads of src/modules/verbs/ticket.go, vehicle.go and tree.go, the comments in src/quack/verbs.go and twins.go, src/modules/queue/places.go, src/scripts/cli-stamp.js and .claude/skills/level0/lib/index-tools.js; the contract case no source names cli.js holds each, and the builder rewrites each in place to name the program or verb-run.js

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

- the change touches the files the draft and the gate finding name, and past them the cloud guard in copilot-runtime.js, which read the branch verb as words and now reads its program too, and four design notes naming cli.js as live
- the programs reach the outside through cli-doors.js as cli.js did, and every test the change touches runs over the fakes it ran over before
- each new file opens on a header naming [[spec/tickets/cli-js-leaves]], the approach it implements
- the verb table stands once, in Commands in src/modules/verbs/tree.go; TreeVerbs reads it less the topics, the JavaScript holds no usage line, and the lens and the hook each spell the programs folder with a comment naming VERBS in verb-run.js as its owner

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
