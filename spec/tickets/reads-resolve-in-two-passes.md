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
step: implement/tests-green
process: [[spec/processes/standard]]
process_hash: 22b42ea1501e8967
group: the-foundation-closes-its-gaps
depends_on: [the-wiring-file-binds-ports]
record:
  - step: design/draft
    hand: box d7e10c2f00cd · claude-code-remote
    hash_before: ce8476e00bc870b36d177b46c9a380b1ba8021eb
    hash_after: ce8476e00bc870b36d177b46c9a380b1ba8021eb
    inputs:
      - name: ask
        hash: 41c6943945b32e52
        size: 936
      - name: [[spec/design_output/model]]
        hash: eb315d7a681bc4e4
        size: 74362
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box d7e1c5ea2bd1 · claude-code-remote
    hash_before: d147a2ac3ce62a2be6e6daa1d21b60adb2ea7208
    hash_after: d147a2ac3ce62a2be6e6daa1d21b60adb2ea7208
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/q fails
    inputs:
      - name: design/draft
        hash: aa0fb1a917cce672
        size: 2936
    def: 08e16d07b0de477c
  - step: gate
    hand: box d7e1c5ea2bd1 · claude-code-remote
    hash_before: cb3596229973134926051dd165e071827d258ca9
    hash_after: cb3596229973134926051dd165e071827d258ca9
    inputs:
      - name: design/draft
        hash: aa0fb1a917cce672
        size: 2936
      - name: design/tests-red
        hash: 205ea49bec3293cf
        size: 1067
    def: dc4904ab364efa10
  - step: implement/change
    hand: box d7e1c5ea2bd1 · claude-code-remote
    hash_before: 19cae9bc022be2687d2ca018e368f58efe4baa55
    hash_after: 19cae9bc022be2687d2ca018e368f58efe4baa55
    answered:
      - name: lint
        exit: 0
        said: "src/q/qtest/suite.go:75:48: MagicNumber: 6 carries a meaning here. Name it in the constants block at the top of this fil"
    def: f150b8c0dc20fe45
---

# Ask

The index resolves the wiring in two passes, per [[spec/design_output/model#the-index-resolves-in-passes]]. Every wired in-port finds its writer, the types match, and each standard name has one writer. The start refuses loudly on each fault, naming the port.

Modules load in any order, so one pass refuses a sound wiring. An instance that crashes then fails the start, where its readers could run on the built-in value.

- `go test ./...` from the root passes
- a case registers a reader before its writer, and the index starts
- a case leaves an in-port with no wire and no `built-in` mark, and reads the refusal naming the port
- a case wires two out-ports to one standard name, and reads the refusal naming both
- a case wires an in-port to a writer of another type, and reads the refusal naming both types
- a case names an instance that runs nowhere, and reads the built-in value marked `not provided`
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

`Load` in `src/q/wiring.go` runs two passes over the instances, in any wiring order.
The first pass registers each instance, names its out-ports, and binds each in-port whose writer stands already.
It leaves every other wired in-port open.
The second pass binds the open in-ports against every writer, and names a fault where one stays open.
`registration` in `src/q/q.go` gains `instance` and `port`, and `input` gains `port`, so each fault names the port as `<instance>.<port>`.
`twice` in `src/q/check.go` names both out-ports writing one standard name.
`inputFaults` names the in-port, the writer port, and both types on a type apart.
A new `Start(w Wiring, types)` in `src/q/wiring.go` runs `Load`, then `Check`, and answers `(*Store, error)`.
On any fault it answers no store and a `Refused` error, one fault a line, each naming its port.
`Store` in `src/q/store.go` gains `Down(instance) error`, which marks an instance that runs nowhere, copied into each `Snapshot`.
`Snapshot.Read` answers the writer built-in value while its instance stands down, and `Snapshot.NotProvided(name)` answers the mark.
`Why` in `src/q/why.go` reads the state `not provided` there.
Assumption: the mark covers a writer down alone, and a name with no value keeps the state `default`, since `why_test.go` holds it.
Assumption: a module type nobody registers keeps the `NoType` refusal, since it is a fault of the binary and no crash.
The index manager calls `Down` on a crash later. The composition root of `io-modules-own-their-names` calls `Start`.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

src/q/wiring_test.go: loaded,src/q/wiring_test.go: TestAnUnwiredInPortAnswersAFault,src/q/qtest/qtest.go: Over,src/q/catalog_test.go: every case calling `Check`,src/q/store_test.go: the case calling `Check`,src/q/store.go: Land,src/q/q.go: derivedOf,src/q/why.go: why,src/q/qtest/qtest.go: Read,src/index/door.go: the why and read handlers calling `Snapshot().Read`,src/index/v1.go: the read calling `snap.Read`

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

./...: `go test ./...` from the root,src/q/start_test.go: TestAReaderRegisteredBeforeItsWriterStarts,src/q/start_test.go: TestAnInPortWithNoWireAndNoBuiltInRefusesNamingThePort,src/q/start_test.go: TestTwoOutPortsOnOneStandardNameRefuseNamingBoth,src/q/start_test.go: TestAnInPortWiredToAnotherTypeRefusesNamingBothTypes,src/q/start_test.go: TestAnInstanceThatRunsNowhereReadsTheBuiltInMarkedNotProvided,RUNME.sh: `./RUNME.sh check`

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

src/q/wiring.go,src/q/check.go,src/q/q.go,src/q/store.go,src/q/why.go,src/q/start_test.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

I opened `Load`, `bind`, `outName`, `Check`, `twice`, `inputFaults`, `NewStore`, `Snapshot.Read` and `Why`, and checked each claim there.
I grepped every caller of `Load`, `Check`, `NewStore` and `Snapshot.Read` across `src`, and the callers list names each.
Each done_when line names its test in `src/q/start_test.go`, or the command `go test ./...` or `./RUNME.sh check`.

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/q

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

src/q/start_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Every start case fails on its own assertion over the stubs: Start answers no store and the error 'the start stands unbuilt', so the started cases refuse and the refused cases find no port named in the error. Down answers nil and NotProvided answers false. The surprise: Load already binds in two passes, since it names every writer before it binds any in-port, so a reader loaded before its writer binds today, and the work left is Start, the port names in each fault, and the down mark. The send and writer cases in src/q stand red on the lists of io-modules-own-their-names and commits-name-their-writer.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

every done_when line meets a case: the reader before its writer, the unwired in-port, the two out-ports on one standard name, the in-port of another type and the instance that runs nowhere each have a case in src/q/start_test.go, and go test and the check decide the rest as commands
the cases run over a catalog and a store in memory, so no door stands unfaked

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh lint src/q

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change touches the files the draft size names, and `src/q/start_test.go` from tests-red
every case runs over a catalog and a store in memory, so the change reaches no door
each new function points at the design section on passes, the approach it implements
the port name stands once in `portName`, and the down mark once in `Store.down`

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
