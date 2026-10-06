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
group: engine-verbs-hold
step: design/tests-red
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box 57a5a484096e · claude-code-remote
    hash_before: b9167ed13d35a4a97c2c5412de6101aeb1286617
    hash_after: b9167ed13d35a4a97c2c5412de6101aeb1286617
    inputs:
      - name: ask
        hash: 9f3104d696453518
        size: 518
    def: 7883b3d10633c780
---

# Ask

A new ticket and a tracked key each land through one verb, so no hand clones front matter or edits JSON with a script.

Hands clone tickets with sed and edit the tracked config with scripts, and the clones carry stray fields the door then refuses.

- `go test ./src/quack/` passes a case where `mint ticket` takes the gain, breaks and done_when as fields.
- `go test ./src/quack/` passes a case where `./RUNME.sh config <key> <value> --tracked` writes the key in `spec/config/level0.json`.
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

Two verbs each take one flag more.

Mint: a new function askFlags in src/quack/verb_mint.go splits the words before fieldsIn runs. It reads the process the --process word names through pull.ProcessAt, and takes every --<name>=value word whose slug matches a name under the process's ask (gain, breaks, done_when, view, from). A list field such as done_when takes the flag once a line, so --done_when may repeat. The rest of the words go to fieldsIn as today, so a stray field still comes back refused. After withRoute, mintVerb writes fields[askField] off the ask fields through a new pull.AskOf(ask []any, said map[string][]string) in src/pull/process.go. AskOf writes each text field as a paragraph and each list field as '- ' lines, in the order the process names them. retroMintAskOf in src/quack/retro_mint.go then delegates to pull.AskOf, so one function owns the ask's layout. A mint naming both --Ask and an ask field comes back refused with exitUsage, naming the two roads. The --from=handover road keeps its place: HandedOver wraps the composed ask.

Config: configVerb in src/quack/verb_config.go reads a --tracked word among the flags it drops today. configWrites takes the layer path as an argument: config.Tracked with --tracked, config.Local otherwise. The write keeps settingAt and orderedAt, so the comment member and key order stand. The printed line and the log row name the layer the write lands in. The usage line under the row list names --tracked beside the local write.

The config case asserts the tracked file changes and the local file stays absent, since the verb drops a --tracked word today and writes the local layer. The mint case seeds a process carrying gain, breaks and done_when.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

src/quack/verb_mint.go init (register mint)
src/quack/retro_mint.go retroMintOne (runs mint ticket, then retroMintAskOf)
src/quack/retro_new.go retroNewVerb (runs mint ticket --process)
src/scripts/probe-clear.js mint ticket call
src/quack/retro_mint_test.go TestRetroMintAskReadsAsTheChapterAndLandsWhereTheMintLeavesItEmpty (calls retroMintAskOf)
src/quack/verb_config.go init (register config)
src/quack/verb_config.go configVerb (calls configWrites)
src/modules/config/keys.go actions config/set (runs node run config key value)

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

src/quack/verb_mint_test.go TestMintVerb/a_ticket_takes_the_gain_the_breaks_and_the_done_when_as_fields
src/quack/verb_mint_test.go TestMintVerb/a_ticket_naming_the_Ask_and_an_ask_field_comes_back_refused
src/pull/process_test.go TestAskOfWritesEachFieldInRouteOrder
src/quack/verb_config_test.go TestConfigWritesTheTrackedLayerWithTracked

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

src/quack/verb_mint.go
src/quack/verb_mint_test.go
src/pull/process.go
src/pull/process_test.go
src/quack/retro_mint.go
src/quack/verb_config.go
src/quack/verb_config_test.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

Opened verb_mint.go (mintVerb, fieldsIn, withRoute), pull/process.go (ProcessAt, AskRows, HandedOver), retro_mint.go (retroMintAskOf, retroMintOne), verb_config.go (configVerb, configWrites), config/keys.go actions, and spec/processes/standard.yaml's ask names.
Callers came from a grep for mintVerb, the mint verb word, retroMintAskOf, configWrites and the config verb word across src.
The mint done_when line meets TestMintVerb's new gain/breaks/done_when case under go test ./src/quack/; the config line meets TestConfigWritesTheTrackedLayerWithTracked under the same command; ./RUNME.sh check stands as its own command.

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->

<!-- the form is list -->

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

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
