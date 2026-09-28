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
group: open-tasks-switch-lands
record:
  - step: design/draft
    hand: box d81edbaa8ed8 · claude-code-remote
    hash_before: 2f3ff16a50e29d31a84ecbab8d17aee2f406e55c
    hash_after: 2f3ff16a50e29d31a84ecbab8d17aee2f406e55c
    inputs:
      - name: ask
        hash: fe2bc1ba0ba3484f
        size: 258
    def: 71651f49796eeda4
  - step: design/tests-red
    hand: box d81edbaa8ed8 · claude-code-remote
    hash_before: 62fd5688ff505e5d6fd698c9b5c4b8481c25002d
    hash_after: 62fd5688ff505e5d6fd698c9b5c4b8481c25002d
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/tui/work fails
    inputs:
      - name: design/draft
        hash: 3f388022f20d8f55
        size: 1464
    def: 08e16d07b0de477c
---

# Ask

The key moves to `new`, and the sidebar badge and the window's work header both read `work/open-tasks`.

The two numbers stop disagreeing. One commit on the key rolls it back.

- a case holds the badge and the header to one value
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

`PlacesAt` in src/tui/work/workplaces.go stops calling `shadowOf` direct, and calls a new `slicedCount(root, old, now)` in src/tui/work/shadow.go. It reads `migration.opentasks`: under `new` it answers the index's `work/open-tasks` through `askOpenTasks`, and keeps the old count where no door answers; under `shadow` it runs `shadowOf` and answers the old count; under `old` it answers the old count. `PlacesAt` writes the answer into `Places.Takeable`, which the window's header (`Tab.Label`) and the badge's verb (`countSaid`, behind `./RUNME.sh tui work --count`) both read, so the two numbers come off one function. `migration.opentasks` moves to `new` in spec/config/level0.json. One commit on that key puts the old count back.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

src/tui/main.go countSaid,src/tui/work/work.go PlacesCmd, then Tab.Label,src/tui/work/workplaces.go PlacesAt

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

src/tui/work/shadow_test.go TestTheNewSliceAnswersTheIndexCount,src/tui/work/shadow_test.go TestTheNewSliceKeepsTheOldCountWhereNoDoorAnswers,src/tui/work/shadow_test.go TestTheBadgeAndTheHeaderReadOneValue

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

first draft

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

PlacesAt, shadowOf, askOpenTasks, Tab.Label and countSaid stand opened, and each reads Places.Takeable as the approach says
the callers list names countSaid, PlacesCmd and PlacesAt, every reader of PlacesAt
a case holds the badge and the header to one value: TestTheBadgeAndTheHeaderReadOneValue; the check line: ./RUNME.sh check

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test src/tui/work

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

src/tui/work/shadow_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Two of the three tests fail on their own assertion: the new slice answers the old count, and the badge and header read the old count. The no-door test passes already, since the stub keeps the old count, and it stands as the guard for the fallback.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the done_when case meets TestTheBadgeAndTheHeaderReadOneValue, which fails on its assertion
the index door and the verb both have fakes: askOpenTasks and runPlaces

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

The owner moves three parts of [[spec/tickets/the-queue-views-agree]] here, at its `design/person-2`. The draft here takes them into its approach:

- the sidebar redraws once after a burst of writes to a ticket folder, the plan file or the hold folder
- that redraw stands in `src/extension/sidebar.js`
- a case in `test/level0/sidebar.test.js` holds a ticket write changing the badge
- a person step: the owner compares the sidebar badge with the work tab's brackets. The compare runs before and after a ticket moves, with no window reload
