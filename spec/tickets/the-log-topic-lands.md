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
group: read-topics-land-in-shadow
record:
  - step: design/draft
    hand: box d81edba2a3d5 · claude-code-remote
    hash_before: 3b194abbad44baad78f7d8130cf7643fa1fc26ab
    hash_after: 3b194abbad44baad78f7d8130cf7643fa1fc26ab
    inputs:
      - name: ask
        hash: ff79964a04aa4033
        size: 289
    def: 71651f49796eeda4
  - step: design/tests-red
    hand: box d81edba2a3d5 · claude-code-remote
    hash_before: 7fae7dca5f6c784c370a4bdf3731dc18e39122e5
    hash_after: 7fae7dca5f6c784c370a4bdf3731dc18e39122e5
    answered:
      - name: tests
        exit: 1
        said: assertion, 3 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: fdf5bd20b28244f6
        size: 3409
    def: 08e16d07b0de477c
  - step: gate
    hand: box d84d03dd63d7 · claude-code-remote
    hash_before: cef089f05632fbbd75b8718eec39f05e747e661b
    hash_after: cef089f05632fbbd75b8718eec39f05e747e661b
    inputs:
      - name: design/draft
        hash: fdf5bd20b28244f6
        size: 3409
      - name: design/tests-red
        hash: 6ab122a4f31cfc75
        size: 1046
    def: dc4904ab364efa10
  - step: implement/change
    hand: box d84d03dd63d7 · claude-code-remote
    hash_before: 2c4693ee523692c08b2dadafbfea5c98888507dc
    hash_after: 2c4693ee523692c08b2dadafbfea5c98888507dc
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
    def: f150b8c0dc20fe45
---

# Ask

The `log/` topic holds the session rows and the level ladder once.

Three readers of a row stand today, and the ladder stands twice.

- `go test ./...` from the root passes
- a golden file holds the rows the old readers and the new one read off one session log
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

A new module src/modules/log holds the log topic, and the three readers keep answering beside it until the switch. The ladder stands once in the module: debug, info, warn, error and fatal, with an unknown or empty level reading as info, the rule rank in .claude/skills/level0/lib/log.js and Rank in src/tui/log/record.go each hold today. The module answers it under log/ladder. The rows come off the session log file. The watch in src/modules/files/watch.go skips a dot folder under .se unless its named map holds it, so .se/.log joins that map beside .se/.runtime. The module projects files/.se/.log/session.jsonl through a line codec into log/rows: one row a line, with its stamp, its level off the ladder, its kind (the door where no kind stands), its said, its text, every other field, and a line that reads as no JSON standing as a broken row at error, the rule ParseRecord holds. quack log prints the rows as JSON. Where migration.log reads shadow, the log verb (src/scripts/log-verb.js) runs quack log once and writes one shadow row per row the two read apart, through the log door, which ./RUNME.sh log --kind shadow names. It leaves the rows it writes itself out of the compare, so no shadow row breeds another. A golden file src/quack/testdata/log.golden.json holds, over one fixture session log src/quack/testdata/session.jsonl, the rows each reader reads: the module, ParseRecord, rowOf and asRow in lib/log.js, and rowOf in src/extension/lib/rows.js, each a section its own test writes and holds. The fixture carries a plain row, a row with extra fields, a door row with no kind, a row at an unknown level, a reply keeping its lines and a broken line. Weighed: log/rows as a fold over session/ waits on the hooks module, and the file stands today. Assumed: the watch reading the session log costs one commit a row, which the fold pays later anyway.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/modules/files/watch.go the named map, which gains .se/.log
- src/quack/main.go the modules map, which gains log, and the verb dispatch, which gains log
- spec/wiring.yaml the log instance and its files wire
- src/scripts/log-verb.js the log verb, which gains the shadow call
- src/modules/migration/migration.go LogKey, which the shadow reads

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/modules/log/log_test.go TestTheLadderRanksAnUnknownLevelAsInfo
- src/modules/log/log_test.go TestARowCarriesItsFieldsOffTheLine
- src/modules/log/log_test.go TestABrokenLineStandsAsARowAtError
- src/modules/files/watch_test.go TestTheWatchMirrorsTheSessionLog
- src/quack/log_test.go TestLogGoldenHoldsTheModule
- src/tui/log/golden_test.go TestLogGoldenHoldsParseRecord
- test/level0/log-golden.test.js the golden holds the rows lib/log.js and the extension read
- test/level0/log-shadow.test.js a row read apart writes one shadow row
- test/level0/log-shadow.test.js a shadow row leaves the compare

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first draft, no earlier review

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

opened lib/log.js rowOf, rank, asRow and LEVELS, record.go ParseRecord and Rank, the extension's rows.js, the model's log/rows section, watch.go's skipped and named maps, and shadow.go, and checked each claim there
the callers list names every place the topic joins: the watch, the wiring, quack and the log verb
go test ./... passes: the module, watch and golden Go tests; the golden holds every reader's rows off one log: the Go and node golden tests; check exits 0: ./RUNME.sh check

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test src/modules/log src/modules/files src/tui/log src/quack test/level0/log-golden.test.js test/level0/log-shadow.test.js

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/modules/log/log_test.go
- src/modules/files/named_test.go
- src/quack/log_test.go
- src/tui/log/golden_test.go
- test/level0/log-golden.test.js
- test/level0/log-shadow.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

ParseRecord already reads the fixture, so its golden case stands red on the missing golden file alone, and the -update run turns it green. The named map admits a JSON file alone, so the session log needs its folder to carry its own extension. The fixture carries a reply with its lines, and the extension's rowOf prints it across two lines, which the golden shows at the merge.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

every done_when line meets a red test: go test over the module, the watch, quack and the TUI, the golden in the Go and node golden cases, and the check at tests-green
the module cases seed the session port through qtest, and the shadow cases fake the quack process, the settings, the files and the log

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- log-shadow-wiring-gets-tests: test/level0/log-shadow.test.js calls logShadow alone, so the log verb in src/scripts/log-verb.js can drop the call while every case passes; add a case that runs the verb over fake doors and reads the shadow row off the fake log
- log-shadow-reads-unfiltered-rows: the log verb narrows its rows by span, level, kind and count, and quack log answers every row, so the shadow compares the rows before any filter, else each row a filter drops reads apart

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh lint src/modules/log src/modules/files/watch.go src/quack/log.go src/scripts/log-shadow.js src/scripts/log-verb.js src/scripts/log-golden.js src/scripts/cli-check.js

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

The change touches the log module, the watch, quack log, the log verb, its shadow and golden, and the wiring the draft names, and nothing past them.
The module cases seed the session port through qtest, and the shadow and wiring cases meet fake proc, settings, files and log.
The headers of src/modules/log/log.go and src/scripts/log-shadow.js name the approach.
The ladder stands once, in src/modules/log/log.go.

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
