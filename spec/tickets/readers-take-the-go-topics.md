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
group: read-topics-switch-over
record:
  - step: design/draft
    hand: box d856f55387d6 · claude-code-remote
    hash_before: f9a44ed6933a199f4a3522febbcc72da82727d57
    hash_after: f9a44ed6933a199f4a3522febbcc72da82727d57
    inputs:
      - name: ask
        hash: 1e27277f7647141a
        size: 231
    def: 71651f49796eeda4
  - step: design/tests-red
    hand: box d856f55387d6 · claude-code-remote
    hash_before: 11f16cd7d97b7e45f8ad014e77123b002b9dc094
    hash_after: 11f16cd7d97b7e45f8ad014e77123b002b9dc094
    answered:
      - name: tests
        exit: 1
        said: assertion, 7 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: 9de9b5cda8ead242
        size: 4603
    def: 08e16d07b0de477c
  - step: gate
    hand: box d856f55387d6 · claude-code-remote · helper-3
    hash_before: cac9e155c6e4652a161aa67a1dcf583ee95f4315
    hash_after: cac9e155c6e4652a161aa67a1dcf583ee95f4315
    inputs:
      - name: design/draft
        hash: 9de9b5cda8ead242
        size: 4603
      - name: design/tests-red
        hash: a71a921ad58c8fb8
        size: 701
    def: dc4904ab364efa10
  - step: implement/change
    hand: box d856f55387d6 · claude-code-remote
    hash_before: 8d8c2716f539e1c5efaa44c22794f35a2812b02b
    hash_after: 8d8c2716f539e1c5efaa44c22794f35a2812b02b
    answered:
      - name: lint
        exit: 0
        said: "spec/tickets/vale-ls-windows-trial.md:41:1: Sentence: A sentence holds 25 words. Cut this one in two."
    def: f150b8c0dc20fe45
---

# Ask

Each key of the phase moves to `new`, and every reader takes the Go topic.

The readers then agree by construction. One commit per key rolls one back.

- a case reads each key's readers off the Go topic
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

Five keys move from shadow to new in spec/config/level0.json: migration.config, migration.log, migration.guidance, migration.prose, migration.check. One helper, topicOf in src/scripts/quack-topic.js, runs `quack <topic>` under the method root over the caller's own doors (proc.run, files, join) and returns the parsed JSON, or null where the binary stands missing, exits non-zero or prints what no reader takes. Each reader asks its key; where it reads new, the reader takes the answer off topicOf and drops its own path, and where topicOf answers null the reader falls back to the old path for this ticket, since the-js-twins-leave then removes that fallback with the twins. config: readConfig in src/scripts/cli-check.js builds its rows from `quack config` (key, value literal, layer), and the write path stays on settings.write. log: logVerb in src/scripts/log-verb.js filters the rows `quack log` prints instead of rowsIn. guidance: readsFor callers in src/scripts/guidance-verb.js (stepNotes) and src/scripts/pull-hand.js (handed) take the notes off `quack guidance`, keyed leaf as <process>:<path>. prose: readsProse in src/bridge/prose.js and readsText in src/bridge/findings.js take the kept findings off `quack prose` (wink still finds, and the Go vetoes replace withoutFalsePast, withoutFalseLength and withoutFalseOutside). check: no reader of a check/ name stands, because the module's names hold empty lists until phase 7 moves the rules in; the key moves to new and nothing reads it, and the JavaScript check twins under src/scripts stay as the only rules, so the group's done line reads over the twins whose Go side answers (config, log, guidance, prose). Weighed: leaving the check twins for phase 7 against deleting them, which would empty the check verb; the Go names answer nothing yet. Weighed: a hard error on a missing binary against the fallback; the fallback keeps this commit safe on a box whose binary lags, and the second ticket makes the error hard. Assumed: the quack binary stands under the method root on every box the check runs on, as the shadow already assumes. One commit per key rolls one back, so the change lands as one commit a key, and the tracked key moves last in each.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/scripts/cli.js: the config case calls readConfig
- src/scripts/cli-check.js: readConfig calls settings.all and configShadow
- src/scripts/log-verb.js: logVerb calls rowsIn and shadowLog
- src/scripts/guidance-verb.js: stepNotes calls readsFor and shadowLeaf
- src/scripts/pull-hand.js: handed calls readsFor, shadowLeaf and shadowNeeds
- src/bridge/prose.js: readsProse calls the three withoutFalse vetoes and shadowDraft
- src/bridge/bash.js: the reading of a command calls readsProse
- src/bridge/write.js: the write door calls readsProse
- src/bridge/answer-read.js: the answer reader calls readsProse
- src/bridge/findings.js: readsText calls withoutFalsePast, and shadowOver runs the past veto shadow
- spec/config/level0.json: the five migration keys
- spec/config/level0.schema.json: the enum of each key
- src/quack/config_test.go: the shared-key list names the five keys

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- test/level0/topic-readers.test.js: topicOf answers the parsed JSON of a run, and null on a missing binary, a non-zero exit and broken JSON
- test/level0/topic-readers.test.js: readConfig prints the rows quack config answers where migration.config reads new
- test/level0/topic-readers.test.js: logVerb prints the rows quack log answers, narrowed by its flags, where migration.log reads new
- test/level0/topic-readers.test.js: stepNotes and handed take the notes off quack guidance where migration.guidance reads new
- test/level0/topic-readers.test.js: readsProse keeps what quack prose keeps where migration.prose reads new
- test/level0/topic-readers.test.js: every reader falls back on the old path where topicOf answers null
- test/level0/topic-readers.test.js: spec/config/level0.json reads new for the five keys

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first draft

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every file, function and verb the approach names stands opened: cli-check.js readConfig and configShadow, log-verb.js logVerb, guidance-verb.js stepNotes, pull-hand.js handed, prose.js readsProse, findings.js readsText and shadowDoorsOf, the five shadow files, src/quack config.go log.go prose.go, src/modules/check/check.go
- the callers list names the readers and the three doors calling readsProse, found by a search for each name
- every done_when line names its test: the readers case reads each key's readers off the Go topic in topic-readers.test.js, and ./RUNME.sh check decides the exit

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test test/level0/topic-readers.test.js

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

test/level0/topic-readers.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Seven cases fail on their own assertion: the helper answers null, the readers stay on the old path, and the tracked keys read shadow. The old-path fallback case passes, as it should. The guidance case may need its fixture bent when the change lands, since notesSaid reads more than the fake carries.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every done_when line meets a test that fails: the readers case has one red case a reader, and the keys case reads the tracked file
- every door the tests reach has a fake: fakeDisk, fakeProc, fakeClock and fakeLog stand in for the tree, quack, the clock and the log

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

pass with findings
- readers-name-one-mode-source: the tests read the mode off it.slices, the approach names no such field and says each reader asks its key, and the itOf fixture also carries config.ask and the prose case plants migration.prose in the tracked file; readsNew in src/scripts/quack-topic.js takes one source, it.slices as the tests read it, and every reader asks readsNew alone
- handed-meets-its-own-case: the approach names a case for stepNotes and handed, and topic-readers.test.js holds none for handed in src/scripts/pull-hand.js; a case runs handed over the fake quack guidance answer
- read-text-meets-its-case: readsText in src/bridge/findings.js moves to quack prose per the approach, and no case in topic-readers.test.js decides it
- read-config-meets-its-case: the config case tests configRowsOf alone, and no case runs readConfig in src/scripts/cli-check.js with migration.config at new; a case runs readConfig and reads the rows quack config answers

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

- the change touches no file the ask leaves out: the readers, their doors, the five keys and the cases beside them; server.js and config.js in the bridge carry the modes a box holds
- every door the change reaches has a fake: fakeDisk, fakeProc, fakeClock and fakeLog stand under every case
- a comment names the approach the change implements: quack-topic.js opens on the topic helper, and each reader names the ticket beside its call
- every fact stands in one place: SLICES and slicesOf in the bridge config, quackAt and processNameOf in quack-topic.js, and the twins re-export them. One departure: the keys moved in one commit with the readers and not one commit a key, since the readers share one helper. The rollback is one revert of the five keys in spec/config/level0.json.

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

The prose slice has one more reader: `pastReads` in src/lsp/outside.go runs node for the past veto. It takes the Go past veto in src/prose once the slice reads new. [[spec/tickets/prose-checks-run-in-go]]

<!-- what anybody adds, at any time, on this ticket -->
