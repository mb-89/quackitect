---
kind: [[ticket]]
state: open
step: implement/change
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
      - name: draft-2
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
      - name: tests-red-2
        does: writes the tests the ask calls for
        tags: ["code", "testing"]
        needs: ["branch test"]
        input: draft-2
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
    input: ["design/draft", "design/tests-red", "design/draft-2", "design/tests-red-2"]
    evidence:
      - name: verdict
        form: verdict
        says: accept, accept with points naming a fix ticket a line, or reject with findings one a line
  - name: implement
    tags: ["code", "testing"]
    needs: ["branch test"]
    input: ["design/draft", "gate", "design/draft-2"]
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
        input: ["design/tests-red", "design/tests-red-2"]
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
  - step: gate
    hand: box d81edbaa8ed8 · claude-code-remote · helper-4
    hash_before: c26808e7bb6e449df0d80336b50c68992098e77e
    hash_after: c26808e7bb6e449df0d80336b50c68992098e77e
    returns: 1
    why: "the approach leaves out the three parts the owner moves here under Discussion, though that entry says the draft takes them in: a sidebar redraw after a burst of writes to a ticket folder, the plan file or the hold folder, in src/extension/sidebar.js; a case in test/level0/sidebar.test.js holding a ticket write changing the badge; and the owner's before-and-after compare with no window reload; src/extension/sidebar.js watches only SCHEMA, TRACKED, LOCAL and BLESS, so the badge keeps its old number after a ticket moves while the work tab reads fresh places; the two numbers still disagree, and the ask's goal stays unmet; design/tests-red holds no red case for the redraw, so no failing test decides that part; the draft names the redraw and its case in test/level0/sidebar.test.js, and tests-red writes that case red; the callers list names no caller in src/extension; add sidebar.js counted and its watches list; form, rides to the build: TestTheBadgeAndTheHeaderReadOneValue reads Places.Takeable as the badge; a case on countSaid in src/tui holds the badge's own verb; checked and holding: slicedCount, shadowOf, askOpenTasks, PlacesAt, Tab.Label and countSaid read as the draft says; migration.opentasks takes new under the schema enum; openTasksOf in src/modules/work counts what countTakeable counts; two of the three new tests fail on their own assertion, reading 3 and 2 where they want 5"
  - step: design/draft-2
    hand: box d81f28f032e0 · claude-code-remote
    hash_before: 2522528b8b1c597b27edda9728c6360c5258a68f
    hash_after: 2522528b8b1c597b27edda9728c6360c5258a68f
    inputs:
      - name: ask
        hash: fe2bc1ba0ba3484f
        size: 258
    def: a3dfd8c60d853590
  - step: design/tests-red-2
    hand: box d81f28f032e0 · claude-code-remote
    hash_before: fc54fcd9fb59c9f4a761e8eff5fd721132437709
    hash_after: fc54fcd9fb59c9f4a761e8eff5fd721132437709
    answered:
      - name: tests
        exit: 1
        said: assertion, 2 test(s) fail on their own assertion
    inputs:
      - name: design/draft-2
        hash: 4ff8057cc2e3969d
        size: 3593
    def: 9c7cd4dd4a2dadb8
  - step: gate
    hand: box d81f28f032e0 · claude-code-remote · helper-7
    hash_before: 803cd4d2264af62af3f41faf665170448f7b2752
    hash_after: 803cd4d2264af62af3f41faf665170448f7b2752
    inputs:
      - name: design/draft
        hash: 3f388022f20d8f55
        size: 1464
      - name: design/tests-red
        hash: ac0aa081eda77646
        size: 518
      - name: design/draft-2
        hash: 4ff8057cc2e3969d
        size: 3593
      - name: design/tests-red-2
        hash: 163a9a7ab1ecc62c
        size: 894
    def: 01417e29801ecc2f
group: open-tasks-switch-lands
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

## draft-2

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->
<!-- the form is text -->

The count takes the approach of draft: `PlacesAt` in src/tui/work/workplaces.go calls `slicedCount(root, old, now)` in src/tui/work/shadow.go. Under `new` it answers the index's `work/open-tasks` through `askOpenTasks`, and keeps the old count where no door answers. Under `shadow` it runs `shadowOf` and answers the old count, and under `old` it answers the old count. `Places.Takeable` carries the answer, and the header (`Tab.Label`) and the badge's verb (`countSaid`, behind `./RUNME.sh tui work --count`) both read it. `countSaid` in src/tui/main.go reads `PlacesAt` through a package variable `placesAt`, so a case holds the badge's own verb to `Takeable`. `migration.opentasks` moves to `new` in spec/config/level0.json, and one commit on that key puts the old count back.

The redraw closes the gap the gate names. src/extension/sidebar.js exports `COUNTS`: `spec/tickets/*.md`, `.se/tickets/*.md`, `.se/.runtime/plan.json` and `.se/.runtime/hold/*.json`. The sidebar answers them as `counts`, beside `watches`. src/extension/lib/settle.js holds `settled(run, span, later)`, which runs `run` once, `span` after the last call of a burst. `later` is the timer handed in, so a test drives it without a clock, and `timer` there wraps setTimeout for the editor. src/extension/extension.js watches `sidebar.counts` with `settled(draw, BURST, door.later ?? timer)` once the view opens. A ticket moving, a todo landing in the plan, or a hold changing then draws the badge again off the verb, with no window reload.

The owner's before-and-after compare stands at the view step: the badge and the work header read one number before a ticket write and after it, with no reload.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/tui/main.go countSaid
- src/tui/work/work.go PlacesCmd, then Tab.Label
- src/tui/work/workplaces.go PlacesAt
- src/extension/extension.js activate, the view's watch on sidebar.counts
- src/extension/sidebar.js counted, and the counts list beside watches

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/tui/work/shadow_test.go TestTheNewSliceAnswersTheIndexCount
- src/tui/work/shadow_test.go TestTheNewSliceKeepsTheOldCountWhereNoDoorAnswers
- src/tui/work/shadow_test.go TestTheBadgeAndTheHeaderReadOneValue
- src/tui/count_test.go TestTheBadgeVerbSaysTheTakeableCount
- test/level0/sidebar.test.js a ticket write draws the badge again once its burst settles
- test/level0/settle.test.js a burst of calls runs once, a span after the last

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- the approach leaves out the redraw: the second paragraph takes it in, with its watches in src/extension/sidebar.js
- sidebar.js watches only config files: COUNTS adds the ticket folders, the plan file and the hold folder
- no red case for the redraw: tests-red-2 writes the sidebar and settle cases red
- the callers list names no caller in src/extension: it names extension.js and sidebar.js
- the badge case reads Places.Takeable: TestTheBadgeVerbSaysTheTakeableCount in src/tui/count_test.go holds countSaid, the badge's own verb
- the owner's compare: the view step reads it

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- opened: PlacesAt, slicedCount, shadowOf, askOpenTasks in src/tui/work, Tab.Label in work.go, countSaid in src/tui/main.go, sidebarOf, watches and counted in src/extension/sidebar.js, the view's watch in src/extension/extension.js, HOLDS and TICKETS in folders.js, PLANS in runs.js
- the callers list names countSaid, PlacesCmd, PlacesAt, the view's watch in extension.js and sidebar.js
- done_when: TestTheBadgeAndTheHeaderReadOneValue and TestTheBadgeVerbSaysTheTakeableCount hold the badge and the header to one value, and ./RUNME.sh check decides the rest

## tests-red-2

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test test/level0/settle.test.js test/level0/sidebar.test.js src/tui/work

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/tui/work/shadow_test.go
- test/level0/settle.test.js
- test/level0/sidebar.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Four cases fail on their own assertion. The settle case runs its work at once where it wants one run after the burst. The sidebar case finds no watch on the ticket folders. The two slice cases read the old count where they want the index's.

The badge verb case in src/tui/count_test.go passes already. countSaid reads Takeable today, and the case guards that the badge and the header keep reading one field.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- done_when: TestTheBadgeAndTheHeaderReadOneValue fails on its assertion, and the sidebar case holds the badge's redraw after a ticket write
- fakes: askOpenTasks and runPlaces for the index and the verb, placesAt for the badge verb, and door.later for the timer

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

pass with findings
- queue-column-reads-the-index: under new, Takeable reads the index while the queue column reads the pull verb. The shadow stops logging, so a bracket its column contradicts goes unseen.

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
