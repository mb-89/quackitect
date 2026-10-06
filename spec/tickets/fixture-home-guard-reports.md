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
step: gate
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box 37997ca97a74 · claude-code-remote
    hash_before: 15191e058697f4c2e6c5766ac3fb3146a6c6bd63
    hash_after: 15191e058697f4c2e6c5766ac3fb3146a6c6bd63
    inputs:
      - name: ask
        hash: b6103e9aaeda61bd
        size: 1030
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box 37997ca97a74 · claude-code-remote
    hash_before: 77cdcc06f46792b90c4b27f619c16b411effc12b
    hash_after: 77cdcc06f46792b90c4b27f619c16b411effc12b
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/imports fails
    inputs:
      - name: design/draft
        hash: 593d998451f3c4ea
        size: 1383
      - name: [[spec/design_output/model]]
        hash: a1cec3f4220df26e
        size: 77706
    def: 08e16d07b0de477c
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
A fixture builds once a package, in one home a reader finds: the `TestMain` in a package's `main_test.go`, or a builder in `src/q/qtest` memoized with `sync.Once`. The battery stops paying a temp dir, a git repo, a process or an index start per case.

<!-- breaks, as text: what breaks if it is never done -->
The slowest packages build a real repo or start an index per case. Fixtures drift apart in copies, and the battery stays slow.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
- `src/imports` holds a guard naming every Test function calling `t.TempDir`, `os.MkdirTemp`, a `git` command, `exec.Command` or an index start, outside `main_test.go` and `src/q/qtest`, unless the call carries `// level0: FixtureOutsideHome - <why>`, and its test fires on a planted case and passes the home, which `go test ./src/imports` decides
- `src/q/qtest` holds the shared builder form, memoized with `sync.Once` and read-only to tests, and a test proves a second call answers the first build
- the guard reads a baseline of today's offenders, and `./RUNME.sh check` prints the offenders per package in report mode and stays green

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

[[spec/design_output/model#the-guards-hold-a-baseline]]. A pure function, `FixtureBuilds`, in `src/imports/fixture.go` names each top-level test reaching a fixture build outside the home, as a path and a test name. It walks the calls of the test and of the helpers its package declares, as `SerialTests` walks them. A guard entry `fixture` in `src/imports/guards.go` runs it over the tracked test files. `src/q/qtest/shared.go` holds `Shared`, a generic builder over `sync.OnceValue`.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- `src/imports/guards.go` `Guards`, which gains the entry
- the guards verb in `src/quack/verb_guards.go`, which runs every entry

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- `src/imports/fixture_test.go` `TestATestBuildingAFixtureOutsideTheHomeIsNamed`
- `src/imports/fixture_test.go` `TestTheHomeAndAMarkedCallAreSpared`
- `src/q/qtest/shared_test.go` `TestASharedBuildAnswersTheFirstBuild`

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first draft

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- `src/imports/fixture.go`
- `src/imports/fixture_test.go`
- `src/imports/guards.go`
- `src/imports/baseline/fixture.txt`
- `src/q/qtest/shared.go`
- `src/q/qtest/shared_test.go`
- `spec/design_output/model.md`

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- `SerialTests`, the guards registry and `src/q/qtest` stand opened, and the walk copies the serial guard
- the guards registry is the one caller, and the verb runs whatever it holds
- each done_when line meets a case the tests line names

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- `src/imports/fixture_test.go`
- `src/q/qtest/shared_test.go`

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The naming case and the shared builder fail on their assertions over the stubs. The sparing case passes over the stub, since a guard naming nothing spares everything, and it turns into a proof once the naming case goes green. A home helper stands trusted: a case calling `home()` from `main_test.go` passes, so the guard reads the home as building once.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each done_when line meets a red case: the guard in the naming case, the shared builder in its own case, the baseline through the guards verb of the black-box leaf
- the tests reach no door: they parse planted text

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
