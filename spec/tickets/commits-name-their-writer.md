---
kind: [[ticket]]
state: open
step: gate
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
      - name: person-1
        does: answers the question the engine asks
        by: anyone
        to: engine
        asks: "The main merge conflicts in the frontmatter of spec/tickets/the-foundation-closes-its-gaps.md: the branch adds record: (sync) and main adds cloud: true. The door refuses an agent write to the open group ticket. Keep both keys and commit the merge?"
        evidence:
          - name: answer
            form: text
            says: the answer, which the step behind this one reads
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
depends_on: [reads-resolve-in-two-passes, io-modules-own-their-names, tickets-becomes-a-module, the-manager-becomes-a-module]
record:
  - step: design/person-1
    hand: box d7dd59fe93d6 · claude-code-remote
    hash_before: fac6090e3f77aa3f4601a712d472ea9a0114c852
    hash_after: fac6090e3f77aa3f4601a712d472ea9a0114c852
    def: 799c3bd685e25728
  - step: design/draft
    hand: box d7dd59fe93d6 · claude-code-remote
    hash_before: d0c8cdb013ce8a3e9fc98f0d16df4147543c529e
    hash_after: d0c8cdb013ce8a3e9fc98f0d16df4147543c529e
    inputs:
      - name: ask
        hash: 7b7b7a2d0a5b5975
        size: 511
      - name: [[spec/design_input/the-index-holds-the-model]]
        hash: 632da9d1c9abae9f
        size: 3518
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box d7dd59fe93d6 · claude-code-remote
    hash_before: 5dca0f65e88fba2dc898e81d5e9864793d801d2c
    hash_after: 5dca0f65e88fba2dc898e81d5e9864793d801d2c
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/q fails
    inputs:
      - name: design/draft
        hash: b4c4261b71323728
        size: 2103
    def: 08e16d07b0de477c
  - step: design/draft
    hand: the engine
    stale: ask, [[spec/design_input/the-index-holds-the-model]]
  - step: design/tests-red
    hand: the engine
    stale: design/draft
  - step: design/draft
    hand: box d7e2ac6b84cc · claude-code-remote
    hash_before: ef8b3ef5f09b24b2afc9956cde90210df0a808ce
    hash_after: 9da6acd689b2deeec00ada160b874041c60cc00d
    inputs:
      - name: ask
        hash: 9735ed6d14475923
        size: 621
      - name: [[spec/design_output/model]]
        hash: eb315d7a681bc4e4
        size: 74362
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box d7e2ac6b84cc · claude-code-remote
    hash_before: c269d3805b2cc318112da82eb2d0fa248be42113
    hash_after: c269d3805b2cc318112da82eb2d0fa248be42113
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/q fails
    inputs:
      - name: design/draft
        hash: 936ed5763f0ade41
        size: 2786
    def: 08e16d07b0de477c
---

# Ask

`Commit` names the instance writing, and the store refuses a name the wiring binds to no out-port of that instance. `q.Given` leaves the core, because every name it registers today has a writer module by then, per [[spec/design_output/model#the-index-core]].

Only a writer writes its name. Without a writer on the commit, any caller writes any name, and one owner per name holds on paper alone.

- `go test ./...` from the root passes
- a case commits a name as another instance, and reads the refusal
- `q.Given` and `q.GivenIn` stand nowhere under `src`, which `grep -rn GivenIn src` shows
- `./RUNME.sh check` exits 0

# design

## owner-read

<!-- reads the ask a handover carries, before any draft -->

### read

<!-- pass where the ask says what the owner said, or fail with the owner's words -->

<!-- the form is verdict -->

## person-1

<!-- The main merge conflicts in the frontmatter of spec/tickets/the-foundation-closes-its-gaps.md: the branch adds record: (sync) and main adds cloud: true. The door refuses an agent write to the open group ticket. Keep both keys and commit the merge? -->

### answer

<!-- the answer, which the step behind this one reads -->
<!-- the form is text -->

Keep both keys and commit the merge. record: (the sync rows) and cloud: true are distinct keys, so the union loses nothing from either side. Weighed: the conflict markers break every frontmatter read of the group ticket, so the fix cannot wait on a person. Assumed: the engine or the sync verb rewrites the group frontmatter, since the door refuses an agent write there.

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->
<!-- the form is text -->

`Commit` refuses each name whose active owner the writer does not hold. The error names the name, its owner's port and place, and says the commit names another writer. `Run`, `Land` and `Restore` already commit as the owner, so they pass.
`Given` and `GivenIn` leave `src/q`. An IO module writes what comes in the way any module writes its outputs, per the rationale on every part being a module. So `q.OutIn` takes their place: an out-port a module's start commits, with its built-in value.
The watch, the clock, the env and the manager register their out-ports through `q.OutIn`. The fake index registers its input families through it too, since it stands for those IO modules.
The provider kind stays one kind, renamed from given to out, so the check, the store and why read it as before.
Every case calling `GivenIn` takes `OutIn`, by one sweep over `src`.
A case in the root greps `src` for the two names, so the check holds the third done_when line.
Weighed: `OutIn` against a flagged fold. A fold wants a step and an event type, and an out-port a start commits needs neither.
Assumed: the manager's alarms and health are out-ports of the manager, since its start commits them.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

src/q/store.go: commit, which refuses a name past the writer
src/q/q.go: Given and GivenIn, which leave, and OutIn, which comes
src/q/projection.go: ProjectIn, whose saved kind registers an out
src/q/why.go: the kind it names
src/q/qtest/qtest.go: New, which registers the input families
src/modules/files/watch.go: Registers
src/modules/clock/clock.go: Registers
src/modules/env/env.go: Registers
src/modules/index/manager.go: Registers
every case under src calling GivenIn, which the sweep moves to OutIn

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

./...: go test ./... from the root
src/q/writer_test.go: TestCommitRefusesANameOfAnotherProvider
src/q/writer_test.go: TestCommitTakesTheOwnersWriter
src/quack/described_test.go: TestNoRegistrationTakesTheGivenForm
RUNME.sh: ./RUNME.sh check

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

the ask moved: `q.Given` leaves the core now, where the first draft kept it, so `q.OutIn` takes its place
the first draft named `src/tickets` and the index topic, which `tickets-becomes-a-module` removed, so the writers stand on the modules

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

src/q/q.go
src/q/store.go
src/q/projection.go
src/q/why.go
src/q/writer_test.go
src/q/qtest/qtest.go
src/modules/files/watch.go
src/modules/clock/clock.go
src/modules/env/env.go
src/modules/index/manager.go
src/quack/described_test.go
every case under src calling GivenIn

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

I opened the store, the registrations, the fake index and each module's `Registers`, and checked each claim there.
The callers come off a grep for `GivenIn`, `Given(` and `Commit(` over `src`.
Each done_when line names its case, or `go test` or the check.

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/q/writer_test.go src/quack/given_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

src/q/writer_test.go
src/quack/given_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

`TestCommitRefusesANameOfAnotherProvider` fails, since `Commit` checks no writer yet. `TestNoRegistrationTakesTheGivenForm` names every file calling the given form, the cases among them.
The grep case stands in a file of its own, and not in the description case's file the draft named. So the red list keeps that passing case inside the check.
The surprise: the writer cases still register through the given form, so the build sweep moves them too.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

The second and third done_when lines meet a case failing on its assertion, and `go test` and the check decide the rest.
The store stands in memory and the grep reads the tree, so no door needs a fake.

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
