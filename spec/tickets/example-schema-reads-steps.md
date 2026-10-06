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
group: examples-run-as-tests
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box 70672ee0ff0d · claude-code-remote
    hash_before: d9e95dceec87c6db6cd24629c940a191c9fc878d
    hash_after: d9e95dceec87c6db6cd24629c940a191c9fc878d
    inputs:
      - name: ask
        hash: c53f269eb8381838
        size: 808
      - name: [[spec/design_output/examples]]
        hash: 5245c4fe35ade37e
        size: 8237
    def: c01ae0f2ace0cecb
---

# Ask

An example reads into steps one parser owns, and a schema refuses an example out of shape at the write door. Both drivers and the tab read the same steps. [[spec/design_output/examples#the-format]] [[spec/design_output/examples#the-places]]

Each driver parses examples its own way, and an example the harness passes fails in the tab.

- `spec/schemas/example.schema.yaml` governs `spec/examples/**`, which `./RUNME.sh lint` reads
- the schema asks every example for its title, keywords and interface, and a developer case alone for its edge
- a Go parser reads a file into prose, calls and expect lines, and its test proves each expect form of the design note on a planted file
- a line past `./RUNME.sh` and an expect form outside the table refuse, each with a case
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

A pure package `src/example` owns the one parser. `example.Read(path, text)` answers an `Example` and its faults. The example holds the chapter off the path, whether that chapter is a `9xx_dev` one, the front fields and the steps. A step holds the prose since the last call, the call's words past `./RUNME.sh`, its line and its expect lines. An expect holds its form, its words and its line.

The parser reads every `sh`, `bash` or `shell` fence. A line there is blank, a `./RUNME.sh` call or an `# expect:` line, and any other line is a fault. A call holding a pipe, a redirect, a `;`, a `&&` or a substitution outside quotes is a fault too. An expect line before any call faults, and so does a form outside the design table or one with the wrong words.

`spec/schemas/example.schema.yaml` governs `spec/examples/**`. It asks for `kind`, `title`, `keywords` and `interface`. Its `edge` field carries `x-under`, a glob of the `9xx_dev` chapters, and the front checker reads that new key: the field stands under the glob and nowhere else. The body carries `x-steps: example` and no chapters, `isNoteSchema` takes a body naming either, and `checkNote` adds the parser's faults as `Example.<rule>` findings. So lint, the sweep, the write door and the mint all refuse an example out of shape off one road.

`src/imports` lists `src/example` with the pure packages, so a module, the harness and the tab import it.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/modules/check/schema.go schemasIn, which calls isNoteSchema
- src/modules/check/schema.go checkNoteIn, which calls checkNote
- src/modules/check/mint.go, the mint's check, which calls checkNote
- src/modules/check/checker.go, the file check and the sweep, which reach noteFaults
- src/modules/check/schema.go checkNote, which calls frontFaults
- src/imports/imports.go pastQ, which reads pureTree

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/example/example_test.go TestAPlantedExampleReadsEachExpectForm
- src/example/example_test.go TestALinePastRunmeRefuses
- src/example/example_test.go TestAnExpectFormOutsideTheTableRefuses
- src/example/example_test.go TestAnExpectBeforeAnyCallRefuses
- src/example/example_test.go TestTheChapterNamesADeveloperCase
- src/modules/check/example_test.go TestAnExampleNamesTitleKeywordsAndInterface
- src/modules/check/example_test.go TestADeveloperCaseAloneNamesItsEdge
- src/modules/check/example_test.go TestTheCheckRefusesAStepOutOfShape

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/example/example.go
- src/example/example_test.go
- spec/schemas/example.schema.yaml
- src/modules/check/schema.go
- src/modules/check/example.go
- src/modules/check/example_test.go
- src/imports/imports.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every file named stands opened: schema.go, schema-body.go, note.go, mint.go, checker.go and imports.go
- the callers list names each caller of checkNote, frontFaults, isNoteSchema and pureTree
- each done_when line names its test: the schema in the check tests, the parser in the example tests, and the check run itself
- the approach adds no config key

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
