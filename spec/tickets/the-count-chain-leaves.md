---
kind: [[ticket]]
state: open
step: implement/tests-green
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
depends_on: ["the-badge-reads-open-tasks"]
record:
  - step: design/draft
    hand: box d81f28f032e0 · claude-code-remote
    hash_before: 97b02f9f8be3021ba15362eb766d8c91dfd3dc3a
    hash_after: 97b02f9f8be3021ba15362eb766d8c91dfd3dc3a
    inputs:
      - name: ask
        hash: fd1d73f001a22d7b
        size: 318
    def: 71651f49796eeda4
  - step: design/tests-red
    hand: box d81f28f032e0 · claude-code-remote
    hash_before: 218d0ec1d53b6264863f6db56a18972d28d7fd04
    hash_after: 218d0ec1d53b6264863f6db56a18972d28d7fd04
    answered:
      - name: tests
        exit: 1
        said: assertion, 1 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: 91127a9904ac8c51
        size: 2942
    def: 08e16d07b0de477c
  - step: gate
    hand: box d81f28f032e0 · claude-code-remote · helper-3
    hash_before: 2bb420e11c96ac2f824daf070845cc854041a4a9
    hash_after: 2bb420e11c96ac2f824daf070845cc854041a4a9
    inputs:
      - name: design/draft
        hash: 91127a9904ac8c51
        size: 2942
      - name: design/tests-red
        hash: 6f9111b5692fa790
        size: 698
    def: dc4904ab364efa10
  - step: implement/change
    hand: box d81f28f032e0 · claude-code-remote
    hash_before: bdebaa0cab64b7ca1e2d00f5393dcd2ca4be6996
    hash_after: bdebaa0cab64b7ca1e2d00f5393dcd2ca4be6996
    answered:
      - name: lint
        exit: 0
        said: "spec/tickets/vale-ls-windows-trial.md:41:1: Sentence: A sentence holds 25 words. Cut this one in two."
    def: f150b8c0dc20fe45
---

# Ask

The count chain leaves the tree: `./RUNME.sh tui work --count`, the window's own count, and the old path behind the key.

Four processes a redraw leave the box. Without the delete the old path drifts beside the new one.

- `grep -rn -- '--count' src/extension src/tui` finds no count chain
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

The badge asks the index itself, and the window counts nothing of its own.

| part | today | after |
|---|---|---|
| the badge line | `counts: ./RUNME.sh tui work --count` in spec/config/level0.schema.json | `counts: ./RUNME.sh index call value {"name":"work/open-tasks"}`, which `asksIndex` hands to `se-index` |
| the badge read | `countIn` in src/extension/lib/work.js reads `{count}` | it reads a bare integer as well |
| the node verb | `counted` and `COUNT` in src/scripts/tui.js | they leave |
| the viewer flag | `--count`, `countSaid` and `placesAt` in src/tui/main.go | they leave |
| the window's own count | `countTakeable` in src/tui/work/workplaces.go | it leaves, and `PlacesAt` asks `work/open-tasks` through `askIndex` |
| the old path behind the key | `slicedCount`, `shadowOf` and the shadow row in src/tui/work/shadow.go | the file leaves |

A door answering nothing leaves `Places.Counted` false, and `Tab.Label` draws `work` with no brackets. `askIndex` starts a door where none stands, so a live tree answers.

A redraw spawns node and `se-index`, where it spawned node, the viewer, node again and the index. The key `migration.opentasks` stays at `new` as the slice's record, and the migration module keeps owning it.

spec/design_output/tui.md, chapter the work tab, says the badge reads the index, and names the new line.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/extension/sidebar.js counted, through countIn
- spec/config/level0.schema.json the editor action's counts line
- src/scripts/tui.js the tui verb, which calls counted
- src/tui/main.go main, which calls countSaid
- src/tui/work/work.go PlacesCmd and Tab.Label
- src/tui/work/workplaces.go PlacesAt
- src/modules/work/open_tasks.go its header, which names countTakeable

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- test/level0/work-strings.test.js the count reads a bare integer as well as a count object
- src/tui/work/shadow_test.go leaves with shadow.go, and its cases move to workplaces_test.go
- src/tui/work/workplaces_test.go TestPlacesAtReadsTheIndexCount
- src/tui/work/workplaces_test.go TestTheLabelDrawsNoCountWhereNoDoorAnswers
- src/tui/count_test.go, src/tui/workcount_test.go and test/level0/tui-count.test.js leave with the chain

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first draft
- the design input table places the chain's exit in the actions switch, beside cli.js
- the ask moves it here, and the badge still asks through cli.js, so the actions switch keeps that last hop

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- opened: countIn and lineArgvOf in work.js, asksVerb in editor-lens.js, asksIndex in cli-read.js, counted in tui.js, countSaid in main.go, PlacesAt and countTakeable in workplaces.go, askIndex in workindex.go, Tab.Label in work.go
- ran: ./RUNME.sh index call value with the name answers the index count
- callers: every reader of Takeable, countSaid and counted stands in the list
- done_when: the grep line finds no count chain once the flag and its callers leave, and ./RUNME.sh check decides the rest

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test test/level0/work-strings.test.js src/tui/work

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- test/level0/work-strings.test.js
- src/tui/work/workplaces_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Three cases fail on their own assertion. countIn reads no bare integer. The header reads the rows the verb places, 2 and 1, where it wants the index's 5, and no brackets with no door.

With no config in the case root the slice reads old, so the header counts its own rows. That is the old path behind the key the build takes away.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- done_when: the header cases fail, and the grep line stands as a checkpoint the build answers
- fakes: runPlaces for the verb, askOpenTasks for the index, and the run record for countIn

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- count-tests-miss-the-chain: test/level0/sidebar-work.test.js pins tui work --count, so the new counts line breaks it. src/tui/workplaces_test.go and src/tui/work/workplaces_test.go assert Takeable off PlacesIn. Neither list names them, so rewrite them in the build.
- open-tasks-fake-moves-over: the red cases fake askOpenTasks, which lives in shadow.go. The design deletes that file. Move askOpenTasks beside PlacesAt, and back it with askIndex.
- opentasks-help-names-dead-modes: the migration.opentasks help in level0.schema.json still describes old and shadow. After the delete no reader acts on them, so rewrite the help.
- count-grep-misses-the-scripts: the done_when grep skips src/scripts/tui.js, which holds counted and COUNT. It also hits a playwright-core line under node_modules. Widen it to src/scripts, and exclude node_modules.

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

- files: the ones the draft names, and the three standing tests the gate names, which the children carry
- fakes: askOpenTasks and askQueuePlaces for the index, runPlaces for the verb, and the answers table for the badge line
- comments: countIn, askOpenTasks, Counted and the grep case point at their tickets
- one place: openTasksName and queuePlacesName name each index name once, and tui.md states the chain in one table

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
