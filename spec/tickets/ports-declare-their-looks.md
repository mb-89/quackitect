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
step: implement/change
process: [[spec/processes/standard]]
process_hash: 22b42ea1501e8967
group: the-foundation-closes-its-gaps
depends_on: [the-wiring-file-binds-ports]
record:
  - step: design/draft
    hand: box d7e1c5ea2bd1 · claude-code-remote
    hash_before: 37569899b2f7451ce68cda56c901050768699195
    hash_after: 37569899b2f7451ce68cda56c901050768699195
    inputs:
      - name: ask
        hash: 2224b695bf6460e9
        size: 845
      - name: [[spec/design_output/model]]
        hash: eb315d7a681bc4e4
        size: 74362
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box d7e1c5ea2bd1 · claude-code-remote
    hash_before: 231fdf5229e1f851fb72f9e379472f5676ef977a
    hash_after: 231fdf5229e1f851fb72f9e379472f5676ef977a
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/q fails
    inputs:
      - name: design/draft
        hash: fdd4f3f45b32d5c5
        size: 2927
    def: 08e16d07b0de477c
  - step: gate
    hand: box d7e2ac6b84cc · claude-code-remote
    hash_before: 5151dd687ae0221266772493cef57f604ffd3e67
    hash_after: 5151dd687ae0221266772493cef57f604ffd3e67
    inputs:
      - name: design/draft
        hash: fdd4f3f45b32d5c5
        size: 2927
      - name: design/tests-red
        hash: fc25582a6d83a8e0
        size: 644
    def: dc4904ab364efa10
---

# Ask

The core takes the presentation declarations on everything a module exposes, per [[spec/design_output/model#a-module-is-one-file]]: `q.Doc`, `q.Label`, `q.Icon` and `q.Looks`. An action's input and output fields carry `label` and `doc` tags. The start refuses an exposed port, key, action or field with no description.

Every surface then reads one text off the registration, and no view or surface writes its own. A description missing shows at start, so the check refuses it before a merge.

- `go test ./...` from the root passes
- a case registers a port with a label, an icon and a look, and reads them off the catalog
- a case registers an action with no `q.Doc`, and reads the start refuse it naming the file and line
- a case registers an input field with no `doc` tag, and reads the refusal naming the field
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

Four pieces, following spec/design_output/model at a module is one file and the options.

One, the options: src/q/q.go adds label, icon and looks to the registration, and the options q.Label, q.Icon and q.Looks beside q.Doc. A look is a named kind, type Look string, with the constants q.Count, q.Rows and q.State the options table names.

Two, the fields: actionOf in src/q/action.go keeps the input type. A struct input answers one Field a exported field: its json name, its label tag and its doc tag. An input of another kind, such as a string, answers no fields.

Three, the reading: a new src/q/looks.go adds type Presentation, holding Doc, Label, Icon, Looks and Fields, and Catalog.Presentation(name), which answers it off the registration. Every surface reads its text there.

Four, the refusal: looks.go adds Catalog.Undescribed, which answers a fault of the new kind NoDoc for each registration with no doc and each action field with no doc tag, naming the registration's file and line and the field. Start in src/q/wiring.go appends these faults beside Load and Check.

Weighed: the refusal runs in Start alone, against Check. Check runs under qtest, the door and the watchdog, so a doc fault there breaks every test catalog in the tree. Every production registration carries a q.Doc today, and nothing past the tests calls Start, so the refusal breaks the start cases alone. Assumed: an exposed name is every registration a module type holds, and a field is a field of an action's input. The output of an action answers requests, and carries no fields to describe, so the output tags wait for an action answering a typed result.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

src/q/q.go: registration, and the options Doc, Label, Icon and Looks
src/q/action.go: actionOf, which keeps the input type
src/q/wiring.go: Start, which appends the undescribed faults
src/q/check.go: Kind, which gains NoDoc
src/q/wiring_test.go: source and counter, which take a q.Doc
src/q/start_test.go: labeller and the types of each start case, which take a q.Doc

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

src/q/looks_test.go: TestAPortCarriesItsLabelIconAndLook
src/q/looks_test.go: TestTheStartRefusesAnActionWithNoDocNamingItsFileAndLine
src/q/looks_test.go: TestTheStartRefusesAnInputFieldWithNoDocTag

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

first draft

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

src/q/q.go
src/q/action.go
src/q/check.go
src/q/wiring.go
src/q/looks.go
src/q/looks_test.go
src/q/wiring_test.go
src/q/start_test.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

opened spec/design_output/model at a module is one file and the options, src/q/q.go, src/q/action.go, src/q/check.go, src/q/wiring.go Start and src/q/start_test.go, and checked each claim there
the callers come off a grep for Start, Check and every registration outside src/q, which shows each production registration carrying a q.Doc
each done_when line names its test: the three looks cases decide the port, the action and the field, and go test and the check decide the first and last

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

Each case fails on its own assertion over the stubs. The catalog presents no port, and the start answers a store for an action with no doc and for a field with no doc tag. The surprise: nothing past the tests calls Start yet, so the refusal meets the start cases alone. Their types source, counter and labeller take a q.Doc at implement.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

every done_when line meets a failing case: the port, the action and the field cases, and go test and the check as commands
the cases run over a catalog and a wiring in memory, and reach no door

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- action-outputs-carry-field-tags: the ask has output fields carry label and doc tags; the draft defers them because an action answers []Request, so a typed result and its field tags wait on a ticket of their own
- the-check-refuses-undescribed-modules: the ask has the check refuse a missing description before a merge, and nothing past the tests calls q.Start, so a production module with no q.Doc passes the check; a test in a package importing every module runs Catalog.Undescribed over the full catalog
- looks-reads-a-field-label: no case reads a field label off Presentation.Fields; the builder adds that assertion to the field case in place

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
