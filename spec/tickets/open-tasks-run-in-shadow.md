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
group: open-tasks-shadow-lands
depends_on: ["open-tasks-come-from-work"]
record:
  - step: design/draft
    hand: box d81c1a402acf · claude-code-remote
    hash_before: ef65ffdb1c10e0a99d8637d57b8b2831ad47be1e
    hash_after: ef65ffdb1c10e0a99d8637d57b8b2831ad47be1e
    inputs:
      - name: ask
        hash: 81fa1b40004bfbb4
        size: 377
    def: 71651f49796eeda4
  - step: design/tests-red
    hand: box d81c1a402acf · claude-code-remote
    hash_before: 544a8d8ea5e37569ba9964be895af070ec747ac0
    hash_after: 544a8d8ea5e37569ba9964be895af070ec747ac0
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/index fails
    inputs:
      - name: design/draft
        hash: 5560bb486339a576
        size: 2570
    def: 08e16d07b0de477c
---

# Ask

The key `migration/config/slices/openTasks` takes `old`, `shadow` or `new`. Under `shadow`, the old count answers, the new one runs beside it, and a mismatch writes a `shadow` row.

The owner judges the switch off these rows. Without them the go rests on hope.

- a case under `shadow` plants a mismatch, and `./RUNME.sh log --kind shadow` names it
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

A migration module, src/modules/migration/migration.go, declares the shared key slices/open-tasks, built-in old, and the wiring loads the instance migration, so the key stands as migration/config/slices/open-tasks. The catalog takes lowercase segments alone and refuses openTasks, so the key spells the slice open-tasks, the name its port carries. The default file spec/config/level0.json sets migration.slices.open-tasks to shadow, and the schema adds the slices block with the three values. The index answers a new method value, the settled value of one name, and index.AskAt asks the index standing over a root. PlacesAt in src/tui/work/workplaces.go answers the old count as it does today, and both the tab header and the sidebar count read it. Beside it, src/tui/work/shadow.go reads the key off the default file. Under shadow it asks the index for work/open-tasks, and where the index answers a number other than the old count, it appends a row of kind shadow to .se/.log/session.jsonl, naming the slice, the old count and the new one. Under old it asks nothing, under new it still answers the old count until the switch group moves the readers, and an index standing down writes no row, since no new count stands to compare.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

src/tui/work/workplaces.go: PlacesAt, which the tab and countSaid in src/tui/main.go call
src/index/answers.go: answers, the method switch
src/index/main.go: Ask, beside which AskAt stands
src/quack/main.go: modules, the table the wiring loads types from
spec/wiring.yaml: the instances
spec/config/level0.json and spec/config/level0.schema.json: the migration block

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

src/tui/work/shadow_test.go: TestAShadowMismatchWritesAShadowRow
src/tui/work/shadow_test.go: TestAMatchUnderShadowWritesNothing
src/tui/work/shadow_test.go: TestTheOldSliceAsksNothing
src/modules/migration/migration_test.go: TestTheSliceKeyReadsTheDefaultFile
src/index/door_test.go: TestTheDoorAnswersTheValueOfAName

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

first

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

every file, function and verb the approach names stands opened, and each claim checked there: read PlacesAt, countSaid, the index answers switch and Ask, the config module filed and winning, log.js rowOf and the session log rows
the callers list names every caller of what the approach changes: PlacesAt feeds the tab and the sidebar count, and the rest is new
every done_when line names the test that decides it: TestAShadowMismatchWritesAShadowRow plants the mismatch, the hand runs ./RUNME.sh log --kind shadow over the row it writes, and the check closes at tests-green

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

src/tui/work/shadow_test.go
src/modules/migration/migration_test.go
src/index/door_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The mismatch case writes no row, the slice key names no provider, and the door answers no method called value. The match case and the old case pass on the stub, since they guard against a row, and they stay as guards once the shadow writes.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

every done_when line meets a test that fails, or a checkpoint the hand answers where no command decides: TestAShadowMismatchWritesAShadowRow plants the mismatch, the hand runs the log verb over the row at tests-green, and the check closes there
every door the tests reach has a fake: the index count stands behind a fake the case sets, and the files are a temporary tree

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
