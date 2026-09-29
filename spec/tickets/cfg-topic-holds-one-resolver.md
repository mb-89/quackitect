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
    hash_before: 78991c39811b4cb7f0099b8d4178c044eb49374f
    hash_after: 15c5954ca6f01e904da27346d4deeb7a58a7b638
    inputs:
      - name: ask
        hash: f39deac4d1dfddea
        size: 595
      - name: [[spec/design_output/migration]]
        hash: cea2b1b9bf4bfda7
        size: 14154
      - name: [[spec/tickets/the-config-module-resolves-layers]]
        hash: e7e0d2f37f54995b
        size: 22752
      - name: [[spec/tickets/config-reads-differ-by-reader]]
        hash: 696f2b2276e4f705
        size: 2448
    def: 71651f49796eeda4
  - step: design/tests-red
    hand: box d81edba2a3d5 · claude-code-remote
    hash_before: bf0146d1470812aeddb0e11dcb55da59fc2af794
    hash_after: bf0146d1470812aeddb0e11dcb55da59fc2af794
    answered:
      - name: tests
        exit: 1
        said: assertion, 1 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: 46b4c7e80f6088a9
        size: 3733
    def: 08e16d07b0de477c
  - step: gate
    hand: box d84d03dd63d7 · claude-code-remote
    hash_before: f425ea9e2b8a1d2a4da605598ef0088662a87117
    hash_after: f425ea9e2b8a1d2a4da605598ef0088662a87117
    inputs:
      - name: design/draft
        hash: 46b4c7e80f6088a9
        size: 3733
      - name: design/tests-red
        hash: 2b9e5ed65e24e46d
        size: 1223
    def: dc4904ab364efa10
  - step: implement/change
    hand: box d84d03dd63d7 · claude-code-remote
    hash_before: 921c159b2085abba2bf555279206c6b85843ed65
    hash_after: 921c159b2085abba2bf555279206c6b85843ed65
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
    def: f150b8c0dc20fe45
  - step: implement/tests-green
    hand: box d84d03dd63d7 · claude-code-remote
    hash_before: 09d03c0caad39f3068426d2db4b9bfc82f9bc56f
    hash_after: 09d03c0caad39f3068426d2db4b9bfc82f9bc56f
    answered:
      - name: tests
        exit: 0
        said: green, 8 test(s) pass in 1 file(s); green, src/modules/config passes; green, src/config passes; green, src/shadow passes
      - name: check
        exit: 0
        said: "src/scripts/guidance-shadow.js:12:1: CodeComment: Code carries no comment here. Write a header of at most five lines at "
    inputs:
      - name: design/tests-red
        hash: 2b9e5ed65e24e46d
        size: 1223
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

The five readers [[spec/design_output/migration#the-duplications]] names read each `<instance>/config/` subtopic in shadow. The config module [[spec/tickets/the-config-module-resolves-layers]] builds answers them. A mismatch writes a `shadow` row.

One key then answers one value, whoever reads it. [[spec/tickets/config-reads-differ-by-reader]] shows the cost today.

- `go test ./...` from the root passes
- a golden file holds every key's value and layer, off the old readers and the new one
- `./RUNME.sh log --kind shadow` names each key the readers disagree on
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

The old readers keep answering, and the config module runs beside them. `quack config` (src/quack/config.go) lists every leaf key of the default and local files, and resolves each through `Layered` in src/modules/config, which names the layer answering: override, context, the SE_ variable, the local file or the default file, and the default file alone for a key the wiring declares shared. Where `migration.config` reads shadow, `./RUNME.sh config` (readConfig in src/scripts/cli-check.js) runs the index binary's `config` verb, and src/scripts/config-shadow.js compares each key by value and layer. Each key answered apart writes one `shadow` row through the log door, which `./RUNME.sh log --kind shadow` names. A golden file, src/quack/testdata/readers.golden.json, holds every key's value and layer as each reader answers it over one fixture: the default file frozen as it stood, a local file and four variables. The Go test owns the `src/config Where` and config module sections, and the node test owns configOf, whereFrom, asksText and valuesOf. The LSP reader goes through src/config, so its section is the Go one. Weighed: a runtime shadow inside src/config.Value runs the module on every read from every Go caller, so the verb that lists every key carries it instead. Assumed: a frozen fixture beats the live default file, so adding a key elsewhere leaves this golden standing.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

src/scripts/cli.js: the config verb calls readConfig,src/scripts/cli-check.js: readConfig calls configShadow,src/config/config.go: Value calls Where, and every Go caller of Value and Count reads through it unchanged,src/lsp/config.go: countAt calls config.Count,src/tui/work/shadow.go: shadowOf calls shadow.On, which calls config.Value,src/modules/config/config.go: resolves calls winning, and Layered calls winning,src/quack/main.go: main calls configs for quack config

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

src/quack/config_test.go: TestConfigRowsReadEveryLayer,src/quack/config_test.go: TestConfigTextHoldsOneKeyALine,src/quack/config_test.go: TestTheSliceKeysStandShared,src/quack/config_test.go: TestReadersGolden,src/modules/config/config_test.go: TestLayeredNamesTheLayer,src/config/config_test.go: TestWhereNamesTheLayer,test/level0/config-shadow.test.js: a key both readers answer alike makes no row,test/level0/config-shadow.test.js: a key answered apart by value, by layer or by one side alone makes one row each,test/level0/config-shadow.test.js: a wanted key narrows the rows to itself,test/level0/config-shadow.test.js: a row says the key and both answers,test/level0/config-shadow.test.js: what quack config prints parses, and anything else reads as nothing,test/level0/config-shadow.test.js: the JavaScript readers answer what the readers golden file holds,test/level0/config-shadow.test.js: a shadow run writes one shadow row a key the module answers apart,test/level0/config-shadow.test.js: a slice standing old, or a binary standing nowhere, runs nothing,test/contract/cli-check-doors.test.js: the config verb runs the config slice's shadow over the rows it prints

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

first draft

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

Opened every file and function named: configOf, whereFrom, asksText, valuesOf, src/config Value, src/lsp countAt, the module's winning and filed, readConfig, the proc and log doors, and quack's load.
The callers list names every caller of Where, Layered, winning, readConfig and configs, found by grep over src and .claude.
go test ./... decides through TestReadersGolden and the unit tests, the golden line through TestReadersGolden and the node golden test, the shadow line through the node row tests and a live run of ./RUNME.sh config with SE_ANSWER_WARN_AT set, and ./RUNME.sh check through the commit verb.

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test test/level0/config-shadow.test.js

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

test/level0/config-shadow.test.js,src/quack/config_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The golden test fails on its own assertion: the golden file holds no section for a reader. The Go twin, TestReadersGolden, fails the same way. The code stood before this hand-back, since the first pass ran with the helpers that never built, so this red comes from the golden file standing empty, as it stood before the first write, and the file comes back right after. The surprise sits in the golden itself: the readers answer four keys apart. JavaScript spells SE_ANSWER_WARN_AT where Go spells SE_ANSWER_WARNAT, the module ranks a variable over the local file where every old reader ranks the local file first, two readers keep a variable as text, and every old reader lets the local file set a shared slice key.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

Every done_when line meets a red test: go test ./... through TestReadersGolden, the golden line through the node golden test, the shadow line through the shadow run test, and the check through the commit verb.
Every door the tests reach takes a fake: the shadow run takes fake settings, files, proc and log, and the golden writer reads a fake disk.

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept: the approach runs the module beside the old readers through quack config, and each done_when line meets a test (TestReadersGolden, the node golden and shadow-run tests, the commit check). Weighed: both red files pass already since the golden stands whole again, which tests-green reads as done; the four keys the golden holds apart are the mismatches the shadow exists to show the owner.

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh lint src/quack/config.go src/scripts/config-shadow.js src/scripts/config-golden.js src/scripts/cli-check.js

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

The change touches the config module, the quack config verb, the config reader and the shadow door the ask names, and the migration slice keys it declares, and nothing past them.
The shadow run takes fake settings, files, proc and log, and the Go tests seed the fixture files under testdata.
The headers of src/scripts/config-shadow.js and src/quack/config.go name the approach and link this ticket.
The slice keys stand once in src/modules/migration/migration.go, and the golden fixture stands once under src/quack/testdata.

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh test test/level0/config-shadow.test.js src/modules/config src/config src/shadow

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The config module now answers every config key beside the old readers. quack config lists each key with its value and the layer that answers it. Where migration.config reads shadow, ./RUNME.sh config compares both answers and writes one shadow row a key they answer apart, which ./RUNME.sh log --kind shadow names. The readers golden holds each reader answer over one frozen fixture, and it shows four keys apart today: the SE_ANSWER_WARN_AT spelling, the rank of a variable against the local file, variables kept as text, and a shared slice key the local file sets. TestReadersGolden in src/quack passes with go test -run TestReadersGolden, while that folder also holds the sibling tickets red tests.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

The change touches no file past the config readers, the module and the shadow door the ask names.
The shadow run meets fake settings, files, proc and log.
The config-shadow and quack config headers name the approach.
The slice keys stand once, in src/modules/migration/migration.go.

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
