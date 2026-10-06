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
group: code-is-pure-tests-behave
step: implement/tests-green
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box 37997ca97a74 · claude-code-remote
    hash_before: 8d8e9a9fb091558f46ca6ca06a389bfd259acaf6
    hash_after: 8d8e9a9fb091558f46ca6ca06a389bfd259acaf6
    inputs:
      - name: ask
        hash: 47799efb83a652b4
        size: 831
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box 37997ca97a74 · claude-code-remote
    hash_before: b4cec71ef55c4662ad1a4c52ae47df627b7ab3a8
    hash_after: b4cec71ef55c4662ad1a4c52ae47df627b7ab3a8
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/imports fails
    inputs:
      - name: design/draft
        hash: c0a79dd2622f6ee7
        size: 1537
      - name: [[spec/design_output/model]]
        hash: 61ac69020f637f41
        size: 76243
    def: 08e16d07b0de477c
  - step: design/tests-red
    hand: the engine
    stale: [[spec/design_output/model]]
  - step: design/tests-red
    hand: box 37997ca97a74 · claude-code-remote
    hash_before: 9eace32f7ec36d9793e7cbeb53fc32e2cf70ed82
    hash_after: 9eace32f7ec36d9793e7cbeb53fc32e2cf70ed82
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/imports fails
    inputs:
      - name: design/draft
        hash: c0a79dd2622f6ee7
        size: 1537
      - name: [[spec/design_output/model]]
        hash: a1cec3f4220df26e
        size: 77706
    def: 08e16d07b0de477c
  - step: gate
    hand: box 7b5a2726379b · claude-code-remote
    hash_before: 80ae0b3f4d345254658344bc54691f10478ebdb0
    hash_after: 80ae0b3f4d345254658344bc54691f10478ebdb0
    inputs:
      - name: design/draft
        hash: c0a79dd2622f6ee7
        size: 1537
      - name: design/tests-red
        hash: 251f6039a646caf2
        size: 661
      - name: [[spec/design_output/model]]
        hash: a1cec3f4220df26e
        size: 77706
    def: dc4904ab364efa10
  - step: implement/change
    hand: box 7b5a2726379b · claude-code-remote
    hash_before: 77b00f45ce78d805b1f7e57e31bb3144550cf4c6
    hash_after: 1494006ee7defb5b942430e7c670043f9dc9ad25
    answered:
      - name: lint
        exit: 0
        said: ""
    def: f150b8c0dc20fe45
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
A Go test reads its package through the exported surface alone. A refactor inside a package then leaves its tests standing, and no test pins an implementation detail.

<!-- breaks, as text: what breaks if it is never done -->
Every Go test file stands in its own package and reaches unexported helpers. Each refactor rewrites tests, and the owner says the rule again.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
- `src/imports` holds a guard naming every Go test file whose package clause lacks `_test` and whose clause carries no `// level0: InPackageTest - <why>` marker, and its own test fires on a planted file and passes a marked one, which `go test ./src/imports` decides
- the guard reads a baseline of today's offenders, and `./RUNME.sh check` prints the offenders per package in report mode and stays green
- the build checks section of `spec/design_output/model.md` names the guard, its marker and its baseline

<!-- view, as text: the view the owner reads the change in and the number there, in the owner's words, or none -->
none

<!-- from, as text: handover where the ask comes off a handover line, so the owner reads it first, or none -->
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

[[spec/design_output/model#the-guards-hold-a-baseline]]. A pure function, `InPackageTests`, in `src/imports/blackbox.go` names each Go test file whose package clause lacks `_test` and carries no marker. A pure `Compare` in `src/imports/guards.go` reads a baseline against what a guard names. The verb `guards` in `src/quack/verb_guards.go` walks the tracked test files, parses each, and prints the compare. The check runs the verb as its part `guards`, after `doors`.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- `src/quack/check.go` `partsOf`, which gains the part
- `src/modules/verbs/tree.go`, the verb list, which gains the verb

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- `src/imports/blackbox_test.go` `TestAnInPackageTestFileIsNamed`
- `src/imports/blackbox_test.go` `TestAMarkedOrBlackBoxFileIsSpared`
- `src/imports/guards_test.go` `TestACompareNamesNewOffendersAndStaleLines`
- `src/quack/verb_guards_test.go` `TestTheGuardsReportAnswersZeroAndNamesEachOffender`

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first draft

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- `src/imports/blackbox.go`
- `src/imports/blackbox_test.go`
- `src/imports/guards.go`
- `src/imports/guards_test.go`
- `src/imports/baseline/blackbox.txt`
- `src/quack/verb_guards.go`
- `src/quack/verb_guards_test.go`
- `src/quack/check.go`
- `src/modules/verbs/tree.go`
- `spec/design_output/model.md`

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- `partsOf`, the doors verb, the serial guard and the walk-around guard stand opened, and the verb copies their shape
- the two callers stand listed, and nothing else calls the new functions
- each done_when line meets a test the tests line names

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- `src/imports/blackbox_test.go`
- `src/imports/guards_test.go`
- `src/quack/verb_guards_test.go`

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Each case fails on its own assertion over the stubs. The new `src/imports` tests stand black-box in `package imports_test`. The `src/quack` test cannot, since a main package admits no outside test package, so its clause carries the marker with that reason. Every test file of `src/quack` stays an offender until its logic leaves the main package.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each done_when line meets a red case, and the design section stands written
- the tests reach no door: they parse planted text and read a map

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept: the approach answers each done_when line; InPackageTests and Compare stand as stubs and their cases in src/imports fail on their own assertion, verb_guards_test carries the marker with the main-package reason, and model.md#the-guards-hold-a-baseline names the guard, its marker and its baseline. I weigh the src/quack offenders standing in the baseline as the ask intends, since report mode keeps the check green.

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

go vet ./src/imports ./src/quack ./src/modules/check

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches the files the draft names, plus src/modules/check/textfaults.go and its golden, where the size twin met prose files and the check stood red
- the guard reads tracked text through a reader, so its tests reach no door
- each new function names model.md#the-guards-hold-a-baseline
- the baseline folder stands once, in guards.go, and the model points at it

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
