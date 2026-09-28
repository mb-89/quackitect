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
group: the-foundation-closes-its-gaps
depends_on: [ports-declare-their-looks]
step: gate
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box d7e2ac6b84cc · claude-code-remote
    hash_before: bc1c9dddf0885d22730565765d40875f75786a98
    hash_after: bc1c9dddf0885d22730565765d40875f75786a98
    inputs:
      - name: ask
        hash: 5e3a08e9f018fdfc
        size: 704
      - name: [[spec/design_output/model]]
        hash: eb315d7a681bc4e4
        size: 74362
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box d7e2ac6b84cc · claude-code-remote
    hash_before: f396f1bd679bdbfd0882b3f7199b6cb211ac9872
    hash_after: f396f1bd679bdbfd0882b3f7199b6cb211ac9872
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/q fails
    inputs:
      - name: design/draft
        hash: ddcc59b153cf41ef
        size: 2046
    def: 08e16d07b0de477c
---

# Ask

An action's output fields carry `label` and `doc` tags, per [[spec/design_output/model#a-module-is-one-file]], so every surface reads one text for what an action answers.

An action answers `[]Request` today, so its output holds no field to describe, and the MCP tool and OpenAPI show an untyped result.

- The design says what an action answers beside its requests, and [[spec/design_output/model#an-action-lists-requests]] names it.
- A case registers an action whose output field carries a `label` and a `doc` tag, and reads them off `Catalog.Presentation`.
- A case registers an output field with no `doc` tag, and reads the start refuse it naming the field.
- `./RUNME.sh check` exits 0.

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

A caller receives the answer of an action's last request, which Store.Deliver hands back and ops.Call passes on. The output is that answer, so the design declares its type beside the requests and changes no action function.

One, the option: src/q/looks.go adds q.Answers[Out](), a generic Option that sets the registration's out fields off fieldsOf over Out. An action with no q.Answers answers an untyped result, and presents no output fields.

Two, the reading: Presentation gains Out, the output fields, beside Fields.

Three, the refusal: Undescribed answers a NoDoc fault for each output field with no doc tag, saying output field and its name, so the start refuses it.

Four, the note: spec/design_output/model at an action lists requests says the caller receives the last answer and q.Answers declares its type, and the options table gains the row for q.Answers.

Weighed: a second type parameter on q.Action checks the answer at compile time, and changes every action and every test that registers one. The option adds to the API alone. Assumed: Deliver checks no answer against the declared type, and a later ticket adds that check where a surface needs it.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

src/q/q.go: registration, which gains the out fields
src/q/looks.go: Presentation and Undescribed, which read them
spec/design_output/model.md: an action lists requests, and the options

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

src/q/looks_test.go: TestAnActionOutputCarriesItsLabelAndDoc
src/q/looks_test.go: TestTheStartRefusesAnOutputFieldWithNoDocTag

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

first draft

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

src/q/q.go
src/q/looks.go
src/q/looks_test.go
spec/design_output/model.md

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

opened src/q/send.go Deliver, src/modules/index/call.go Call, src/q/looks.go and the model at an action lists requests, and checked each claim there
the callers come off a grep for Presentation and Undescribed, which nothing past the tests and Start reads
the two looks cases decide the output label and doc line and the refusal line, the note edit decides the design line, and the check decides the last

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/q/looks_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

src/q/looks_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Both cases fail on their own assertion over the stub. The catalog presents no output fields, and the start answers a store for an output field with no doc tag. The stub q.Answers sets nothing, so the two cases meet it alone.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the output case and the refusal case decide the second and third lines, the note edit at implement decides the first, and the check decides the last
the cases run over a catalog and a wiring in memory, and reach no door

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
