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
        checklist: ["every file, function and verb the approach names stands opened, and each claim checked there", "the callers list names every caller of what the approach changes", "every done_when line names the test that decides it", "every config key the approach adds names each default file it lands in"]
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
process_hash: c671f20a6ae2a4a6
group: javascript-leaves
depends_on: ["cage-libs-leave", "session-start-leaves-node"]
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box b1ba21c2e626 · claude-code-remote
    hash_before: ae0979cb246e72db8174e4183eb637a2d438a7c2
    hash_after: ae0979cb246e72db8174e4183eb637a2d438a7c2
    inputs:
      - name: ask
        hash: 1ac4750d62402a00
        size: 343
    def: c01ae0f2ace0cecb
  - step: design/tests-red
    hand: box b1ba21c2e626 · claude-code-remote
    hash_before: 4057ff86a421428344c4ed2e00519af6701ac476
    hash_after: f4dfde07a9feb9bca8e6ac7e9a89550b029bc9bd
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/quack fails
    inputs:
      - name: design/draft
        hash: 2ae87ba2c2fbedf5
        size: 9770
    def: 08e16d07b0de477c
---

# Ask

`src/engine` leaves, and every JavaScript door serving ported code leaves with its fake and contract test.

The doors and the engine stay for code that no longer runs.

- `git ls-files src/engine` names `tools.js` alone while the lint group's Vale door reads it, or nothing
- `./RUNME.sh doors` exits 0
- `./RUNME.sh check` exits 0

none

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

1. A door leaves when nothing still standing reads it, apart from its own fake and contract test. A door whose last reader leaves in a later slice stays until that slice.
2. src/engine/group.js, named.js and front-merge.js leave. src/branches/group.go, src/branches/sync.go and src/modules/hooks/command/ticket.go own their rules.
3. src/engine/tools.js stays, since the lint group's src/doors/vale.js and test/contract/ruled.js read it.
4. src/engine/swap moves by git mv to src/index/swap, and src/index/main.go imports it there, since only the index reads it.
5. The clock, http, index and log doors leave with their fakes and contract tests, since no code that stays reads them.
6. src/doors/fake/awake.js leaves, since nothing imports it and no awake door exists.
7. disk and proc stay with their fakes, since the extension's contract tests and the lint group's tests read them.
8. wire and wire.test.js stay. editor-index.test.js runs its server on the wire, and DoorsOnly refuses node:http in a test.
9. vale stays for the lint group. fake/vscode.js and fake/behaves.js stay, since the extension tests load them.
10. git stays with its fake, git.test.js and real-git.test.js. schema.test.js, ticket.test.js, folders.test.js and tree-of.js read them.
11. front stays with its fake and front.test.js, since the schema-mint tests pass in the fake front.
12. bridgehead.test.js uses fakeProc in place of fakeGit and calls outside.run, so no hook test depends on the git door.
13. A Discussion line on schema-libs-leave hands it the front door. A line on plugin-libs-leave hands it the git door.
14. test/level0 group.test.js, front-merge.test.js, quoted.test.js and ticket-folders.test.js leave whole, since each reads a leaving engine file.
15. front-writer.test.js drops its group writer case and the group.js import. Its two refusal cases call the front door directly.
16. test/contract/process.test.js writes firstLeaf inline, with a pointer at firstLeafOf in src/pull/pull_ticket.go.
17. level0/log.test.js drops its cases over the log door and its fakeLog and fakeClock imports. Its lib/log.js cases stay.
18. test/contract/compact.test.js leaves. The probe verb runs the live check, and probe_verb_test.go holds the reading.
19. src/branches/sync_test.go gains, as a table, the record-rewrite and body clash rows that only front-merge.test.js held.
20. The implementer maps each group.test.js case to a Go case in group_test.go, record_test.go, port_b_group_test.go or src/front/front_test.go.
21. Where that map finds a gap, src/branches/group_test.go gains a row.
22. Every Go comment and lib comment that names a leaving file names its Go owner instead.
23. doors.md, log.md, work.md, level0.md and migration.md name the Go owner of each leaving file, or drop its row.
24. The doors and tests rows of the javascript-leaves inventory name the fate this approach gives them.
25. depends_on gains tree-libs-leave, since tested.test.js reads the fake clock until that slice deletes it.
26. src/quack/engine_doors_test.go globs every leaving file and src/engine, and stays red until they leave.
Weighed: deleting git and front here. Their readers are library tests that later slices delete whole, so rewriting them now pays for the same work twice.
Weighed: moving the extension's fakes next to the extension tests. remaining-js-names-its-reason decides where each remaining file lives.
Weighed: an http server inside editor-index.test.js. DoorsOnly refuses node:http outside a door, so wire stays.
Weighed: keeping compact.test.js. It reads engine/tools.js only to run a Go verb, and the owner runs that verb directly.
Weighed: swap at a top-level src/swap. Only src/index imports it, so it lives next to its reader.
Weighed: Go cases for the log door's level and keep options. The door leaves, and Go writes the session log.
Assumed: the fixture paths naming src/engine/swap in port_f_testverb_test.go and outside-in-doors.test.js stay, since each builds its own tree or reads a Vale glob.
Assumed: the Go tests under src/index cover the glob, standing, hashes, changes and stop cases that index.test.js held.
Assumed: the lint group accepts the edit to process.test.js.
Assumed: FakeDoorsInTest keeps its pattern naming clock and log, since the name of a deleted door refuses nothing.
Assumed: tree-libs-leave lands its tree.test.js, tested.test.js and real-git.test.js edits before this slice.
Assumed: the review prompt example naming src/doors/git.js stays, since the git door stays.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/index/main.go: the swap import and stops(swap.Watches)
- test/contract/process.test.js: the firstLeaf import from src/engine/group.js
- test/level0/front-writer.test.js: the withField import and its three cases
- test/level0/group.test.js: every case, which reads src/engine/group.js
- test/level0/front-merge.test.js: every case, which reads mergedFront
- test/level0/quoted.test.js: recordIn and withEntry from group.js, and quote from fake/front.js
- test/level0/ticket-folders.test.js: NOTE_END and TICKETS from group.js, and FIELD_HOW from named.js
- test/contract/index.test.js: index, clock and fakeIndex
- test/contract/clock.test.js: clock and fakeClock
- test/contract/log.test.js: log, fakeLog and fakeClock
- test/contract/http.test.js: http and fakeHttp, over wire
- test/contract/compact.test.js: readTools and whereIs over the probe verb
- src/doors/fake/log.js: fakeLog, which reads log.js, fake/clock.js and fake/disk.js
- test/level0/log.test.js: door, fakeLog and fakeClock
- test/level0/tested.test.js: fakeClock, until tree-libs-leave deletes it
- test/level0/bridgehead.test.js: fakeGit, outside.proc and outside.ran
- src/branches/sync.go: the header comment naming front-merge.js
- src/branches/group.go: the header comment naming group.js
- src/modules/git/git.go: the TICKETS comment and the ticketAt comment
- src/modules/hooks/stop/tickets.go: the fieldOf comment
- src/modules/queue/places.go: the words comment naming group.js
- src/modules/tickets/tickets.go: the todoOf, heldIn, dependsOn and stepOf comments
- src/modules/tickets/tickets_test.go: the stepOf comment
- src/pull/tickets.go: the header comment naming group.js
- src/quack/retro_backlog.go: the askOf comment
- src/quack/retro_collect_cloud.go: the fieldOf comment
- src/quack/retro_score.go: the fieldOf comment
- src/quack/ticket_note.go: the askOf comment
- src/quack/twins.go: the OPEN comment
- src/quack/verb_log.go: the spanOf comment
- src/quack/retro_collect.go: the stillHeld comment naming named.js
- src/modules/hooks/command/ticket.go: the header comment naming named.js
- src/modules/hooks/cage.go: the row kinds comment naming src/doors/log.js
- .claude/skills/level0/lib/apply.js: the TICKET_WHERE comment naming named.js
- .claude/skills/level0/lib/folders.js: the public tickets comment naming group.js
- spec/design_output/doors.md: the door, standing-on, fake and contract tables, and the families row naming index.test.js
- spec/design_output/log.md: the opening line and the writer list naming src/doors/log.js
- spec/design_output/work.md: the lines naming group.js, front-merge.js and work.js
- spec/design_output/level0.md: the named.js lines and the compact.test.js paragraph
- spec/design_output/migration.md: the swap row and the index client row

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/quack/engine_doors_test.go: TestTheEngineAndThePortedDoorsStandNowhere
- src/quack/engine_doors_test.go: TestTheEngineFolderHoldsToolsAlone
- src/branches/sync_test.go: TestTheFrontLeavesEachClashForAHand, a table with the key, record and body rows
- src/branches/group_test.go: TestAGroupDropLeavesTheRouteStanding, plus a row for each other gap the case map finds

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first: no review has read this draft

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/engine/group.js
- src/engine/named.js
- src/engine/front-merge.js
- src/engine/swap: swap.go, door.go, swap_test.go, moved to src/index/swap
- src/index/main.go
- src/doors: clock.js, http.js, index.js, log.js
- src/doors/fake: clock.js, http.js, index.js, log.js, awake.js
- test/contract: clock.test.js, http.test.js, index.test.js, log.test.js, compact.test.js
- test/contract/process.test.js
- test/level0: group.test.js, front-merge.test.js, quoted.test.js, ticket-folders.test.js
- test/level0/front-writer.test.js
- test/level0/log.test.js
- test/level0/bridgehead.test.js
- src/quack/engine_doors_test.go
- src/branches/sync_test.go
- src/branches/group_test.go
- src/branches: sync.go, group.go
- src/modules/git/git.go
- src/modules/hooks/stop/tickets.go
- src/modules/queue/places.go
- src/modules/tickets: tickets.go, tickets_test.go
- src/pull/tickets.go
- src/quack: retro_backlog.go, retro_collect_cloud.go, retro_score.go, ticket_note.go, twins.go, verb_log.go, retro_collect.go
- src/modules/hooks/command/ticket.go
- src/modules/hooks/cage.go
- .claude/skills/level0/lib: apply.js, folders.js
- spec/design_output: doors.md, log.md, work.md, level0.md, migration.md
- spec/tickets: engine-and-doors-leave.md depends_on, and Discussion lines on schema-libs-leave.md, plugin-libs-leave.md, javascript-leaves.md

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every file, function and verb named stands opened and checked: each door and fake, group.js, named.js, front-merge.js, tools.js, swap, doorsVerb, the Go group, sync, ticket and log owners, and every test importer
- the callers come from git grep for each door, fake and engine file across hooks, lib, src with src/extension, test, RUNME.sh, package.json, .github, .vale.ini, Vale styles, Go comments and spec notes
- TestTheEngineFolderHoldsToolsAlone and TestTheEngineAndThePortedDoorsStandNowhere decide the first line. ./RUNME.sh doors and ./RUNME.sh check at tests-green decide the second and third
- the approach adds no config key, so no default file changes

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/quack/engine_doors_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/quack/engine_doors_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

TestTheEngineAndThePortedDoorsStandNowhere fails on its own assertion. It names all twenty-two leaving paths, src/engine/swap among them.
TestTheEngineFolderHoldsToolsAlone fails on its assertion. It names front-merge.js, group.js, named.js and swap.
The branch test verb exits 1 and ends on: assertion, a test of src/quack fails.
Every new branches row passes now, since Go already holds each behavior. So src/branches stands green.
TestTheFrontLeavesEachClashForAHand holds the key, record and body rows. The key row moves there from TestTheFrontMergesKeyByKey.
The Go mergedFront answers a bool, not a clash list. So the rows assert the refusal and not the clashing key name.
The table first asserts that its plain sides merge. That way each row fails for its clash and not for a bad fixture.
The group.test.js map runs as follows, case by case.
The isGroup and ticketAt case goes to the new TestAGroupIsTheTicketOnTheGroupRouteAlone, with TestAFieldReadsBareAndAGroupReadsOffItsRoute.
The fieldOf and askOf case goes to TestAFieldReadsBare, and the new row covers the missing field.
The firstLeaf and stepOf case goes to the new TestTheStepWithNoneIsTheFirstLeafOfTheRoute.
The withEntry twice case goes to the entry row of TestEachOpKeepsTheBody in src/front/front_test.go.
The heldIn, hand-back and skip-row cases go to the new TestAReleaseClosesTheOpenTakeAndLeavesTheRowsPastIt, with TestATakeHoldsUntilItsHashAfterLands.
The second hash_after case goes to TestAfterOverwritesTheLastItemWhereNoneStandsOpen in front_test.go.
The withField case goes to the set rows of TestEachOpKeepsTheBody.
The withoutField case goes to the new TestAGroupDropLeavesTheRouteStanding.
The spanOf and aged case goes to TestASpanAndAnAgeReadInTheirUnits.
The todoOf case goes to the new TestATodoReadsAsNothingFirstOrTheRowItNames. Before it, no Go test read todoOf.
The withEveryTakeClosed case goes to TestATakeHoldsUntilItsHashAfterLands and TestPBReleaseClosesEveryOpenTake.
One surprise: the quack package already owns a func named standing in survey.go. The glob helper therefore takes the name globbedIn.
No stub was needed, since every Go owner already exists.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

TestTheEngineFolderHoldsToolsAlone and TestTheEngineAndThePortedDoorsStandNowhere decide the first done_when line. ./RUNME.sh doors and ./RUNME.sh check at tests-green decide the rest.
The tests reach no door. The quack cases glob the disk with no exec, and the branches rows run over strings in memory.

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
