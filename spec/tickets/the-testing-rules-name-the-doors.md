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
group: tests-meet-the-doors-once
depends_on: ["each-door-meets-one-test"]
step: implement/tests-green
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box e97c7a20bbd2 · claude-code-remote
    hash_before: 6b7173589739eb008c421c62e8d68bd1fa4f659b
    hash_after: 6b7173589739eb008c421c62e8d68bd1fa4f659b
    inputs:
      - name: ask
        hash: 646a8dca9a84c1c2
        size: 888
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box e97c7a20bbd2 · claude-code-remote
    hash_before: 4f2fbdfeaa6fc40afb0e5f68faef05ef75ef50c6
    hash_after: 4f2fbdfeaa6fc40afb0e5f68faef05ef75ef50c6
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/imports fails
    inputs:
      - name: design/draft
        hash: 4f5a7bb93fcd9872
        size: 2717
    def: 08e16d07b0de477c
  - step: gate
    hand: box e97c7a20bbd2 · claude-code-remote · helper-4
    hash_before: c16aeb2ee2722998b141785e081d8406d8877fba
    hash_after: c16aeb2ee2722998b141785e081d8406d8877fba
    inputs:
      - name: design/draft
        hash: 4f5a7bb93fcd9872
        size: 2717
      - name: design/tests-red
        hash: d95620e81141fe84
        size: 789
    def: dc4904ab364efa10
  - step: implement/change
    hand: box e97c7a20bbd2 · claude-code-remote
    hash_before: 29e9cdfa63fcadde2b4e5819c2fd220323473c20
    hash_after: 29e9cdfa63fcadde2b4e5819c2fd220323473c20
    answered:
      - name: lint
        exit: 0
        said: "test/level0/work-stands.test.js:16:1: correctness/noUnusedImports: Several of these imports are unused."
    def: f150b8c0dc20fe45
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
The testing guidance states the owner's rule in its own voice, and the check holds the part a program can read. A new test then meets the rule at the commit, and no audit repeats.

<!-- breaks, as text: what breaks if it is never done -->
The guidance names fakes and contracts, and says nothing of one door test a door, a fixture built once, a pure module over the index, a stateless module, or a wait on the wall clock. The tree drifts back the way the lease case went.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
- `spec/guidance/code/testing.md` carries rules for one door test a door, fakes elsewhere, fixtures built once, pure modules over the index, stateless modules with state a named exception, and no wall-clock wait outside a door test
- `spec/rationales/testing.md` argues each new rule
- a guard in the check names a Go test that sleeps or spawns a process outside the door tests the audit lists, and its own test proves it fires
- `./RUNME.sh check` stands green

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

The guard reads the audit, so the family table in `spec/design_output/doors.md` stays the one list of door tests.

1. `src/imports/clock.go` holds `RealWaits(file)`, a pure pass over one parsed test file. It names each call to `time.Sleep`, `exec.Command`, `exec.CommandContext` and `os.StartProcess`, through the import names the file gives `time`, `os/exec` and `os`.
2. `src/imports/clock_test.go` proves the pass over a planted file, and holds the tree case. The tree case walks every `_test.go` under `src`, reads every code span ending in `_test.go` out of the tables of the doors note, and names each file calling a real wait that no span matches through `path.Match`. The check runs it in its go part, as it runs the serial guard.
3. The doors note takes the files the survey finds outside the table: the index cases polling a real index join the index door row, and the watch cases join a new row as door tests of the file watch. The fixed sleep in `src/modules/index/call_test.go` waits in a module test, so a new row names it with a child ticket, `caller-wait-meets-no-sleep`.
4. `spec/guidance/code/testing.md` takes five rules: one door test a door listed in the audit, a fixture built once a package run, a module as read, compute and write over the index, a module holding no state past a named exception, and no wall-clock wait or spawn outside a door test, pointing at the guard.
5. `spec/rationales/testing.md` argues each new rule, off the lease flake, the cold-box waits and the measured builds.

The guard reads a sleep and a spawn, and leaves `time.After` and a ticker alone. It costs a wait inside a select, which the rule still names.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- the check's go part, which runs every Go test, the new tree case among them
- spec/design_output/doors.md, whose tables the tree case reads
- spec/guidance/code/testing.md, read by every hand writing a test

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/imports/clock_test.go TestASleepAndASpawnAreNamedThroughTheirImportNames
- src/imports/clock_test.go TestEveryTestWaitingOnTheBoxStandsInTheDoorAudit

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/imports/clock.go
- src/imports/clock_test.go
- spec/design_output/doors.md
- spec/guidance/code/testing.md
- spec/rationales/testing.md
- spec/tickets/caller-wait-meets-no-sleep.md

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each file named stands opened: serial.go and serial_test.go as the shape, the doors note tables, the testing guidance and rationale, and the seven files the survey finds
- the callers come off the check, which runs every Go test, and off the note the tree case reads
- each done_when line meets its test or file: the rules and the rationale stand as files, the two cases decide the guard, and the check the last

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/imports/clock_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/imports/clock_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The pass case fails on its own assertion: the stub names no wait, where the planted file holds a sleep, a spawn under an alias, and a process start. The tree case passes over the stub, and turns red once the pass reads the tree, until the doors note lists the seven files the survey finds. A surprise: the alias case matters, since a file may name os/exec under another name.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each done_when line meets a test or a checkpoint: the pass case and the tree case decide the guard, the rules and the rationale stand as files the gate reads, and the check decides the last
- the cases reach no door: they parse planted text and read the tree, as the serial guard does

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- guard-plants-command-context: the planted file in src/imports/clock_test.go holds no exec.CommandContext call, though the approach names it, so no case decides that name
- audit-guard-fires-on-plant: the tree case proves no firing, since no case plants an audit and an unlisted test file that sleeps, so the span match through path.Match goes unproven while the tree stands clean
- quack-audit-glob-narrows: the span src/quack/*_test.go in spec/design_output/doors.md admits every quack test, so a new sleep there passes the guard unnamed until quack-spawns-meet-fake-process narrows it
- testing-rules-name-fakes-elsewhere: the five rules the approach lists leave out the done_when item fakes elsewhere, so the builder names it beside one door test a door

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

- the change touches the files the draft names, plus the child caller-wait-meets-no-sleep, and the guidance departs from five new rules to five extended ones under the cap of fifteen
- the change reaches no door: the guard parses text, and the doors it names each carry a fake or a child moving them onto one
- a comment on each new function points at this ticket or the testing guidance
- the audit list stands once, in the doors note, and the guard and the rules point at it

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
