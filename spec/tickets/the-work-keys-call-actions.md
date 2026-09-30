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
group: tui-shell-switches-over
depends_on: [the-work-tab-reads-v1]
step: gate
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box d88aea6eafd6 · claude-code-remote
    hash_before: 4f6522967b68d9e5c6f366d9fdede2208175a447
    hash_after: 4f6522967b68d9e5c6f366d9fdede2208175a447
    inputs:
      - name: ask
        hash: 92f5a8d308b09e53
        size: 607
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box d88aea6eafd6 · claude-code-remote
    hash_before: 1ea140c60cf93698c3b4807eb9bcb57e1cdd028e
    hash_after: 1ea140c60cf93698c3b4807eb9bcb57e1cdd028e
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/tui/work fails
    inputs:
      - name: design/draft
        hash: 3a6564cc53a8353e
        size: 5780
    def: 08e16d07b0de477c
---

# Ask

The work tab's keys post the actions `spec/views/work.base` names to `/v1/actions`: the place chord, the urgent flip, the field edit and the pull button. The tab writes no file of its own.

The tab writes `.se/.runtime/plan.json` and a ticket's front itself, so a write skips the rule the action holds, and two writers of one file drift.

- `git grep -n 'writeFile\|appendFile\|makeDir' src/tui/work` answers nothing
- a case under `src/tui/work` presses each key over a fake action door, and reads what it posts
- `./RUNME.sh check` exits 0

view: the work tab, a place set with the place chord

from: none

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

The work tab posts what it wants written, and the verbs behind the index write it.

1. `registry` gains `Caller`, one method `Call(name string, input any) (json.RawMessage, error)`. `V1.Call` posts the input as JSON to `<base>/actions/<name>` with `Prefer: wait=N` through a new `post` in `registry/door.go`. It answers the result on a 200, the handle on a 202, and the problem's detail at 400 and past, through the standing `problemIn`. `Fake.Call` records each post in `Called`, answers the result a case seeds under `Results`, and answers an error for a name it lacks, the way the index answers a 404.
2. `work.Source` embeds `registry.Caller`, so the window's `V1` catalog and a case's `Fake` both carry the posts.
3. The tab reads the action names off its base text through `tree.ReadBase`. It looks each one up by trigger: `p`, `u`, the edit, and the `pull` button. `work.base` stays the one place that names them. A trigger the file leaves out answers a notice naming it.
4. Each key answers a `tea.Cmd` that posts and hands back an `actionSaid` holding the name and the result or the error. The tab shows it as its notice, and the watch on `work/rows` redraws what the verb wrote.
   - `p` then a digit posts `work/place` with `{name, n}`. The verb holds the place rule, so `PlaceValue`, `placeOf`, `anchorFor`, `SiblingAt`, `LastPlace`, `PlaceNumber`, `writePlace` and `PlanAt` leave the tab.
   - `u` posts `tickets/flip-urgent` with `{name}` once a marked row, or once for the selected row.
   - An edit's enter or fill posts `tickets/set-field` with `{name, field, value}` once a written row. `writeTicket` and `WithField` leave, since `ticket set` owns the front write.
   - `P` presses the view's `pull` button and posts `work/pull` with `{}`.
5. `door.go` keeps `readFile` for the ticket schema, and `writeFile`, `appendFile`, `makeDir` and `statOf` leave it.
6. The schema checks `Refuses` and `Weighs` stay, so a refused value names its reason before any post.

What I weigh and assume:
- The base file names no key for the pull button, so the tab binds it to `P`, which the work tab leaves free. The view file stays the owner of the name `work/pull`.
- The rule the Go tab and `ticket-edit.js` both spell moves to the verb alone. `src/tui/work/testdata/places.json` stays where `test/level0/ticket-edit.test.js` reads it.
- The tab drops its early `SetValue` on a place or a flip, so a row changes once the watch hands it on. That costs a short lag, and in return the tab never draws a value the verb refuses.

The section `spec/design_output/tui.md#the-work-tab-takes-edits` takes the new road, and `spec/design_output/pull.md#a-todo-forces-a-place` names the verb as the one writer of the plan file.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

src/tui/registry/catalog.go Caller, new
src/tui/registry/v1.go V1.Call, new
src/tui/registry/door.go post, new
src/tui/registry/fake.go Fake.Call, new
src/tui/work/v1.go Source
src/tui/main.go main, wiring workTab.From = catalog
src/tui/work/work.go Tab.Update
src/tui/work/work.go Tab.Keys
src/tui/work/workplace.go Tab.openPlace
src/tui/work/workplace.go Tab.placeAt
src/tui/work/workplace.go PlaceValue, writePlace, placeOf, anchorFor, SiblingAt, LastPlace, PlaceNumber, PlanAt
src/tui/work/workedit.go Tab.writes
src/tui/work/workedit.go Tab.flip
src/tui/work/workedit.go writeTicket, WithField
src/tui/work/door.go writeFile, appendFile, statOf, makeDir
src/tui/workplace_test.go TestPThenADigitWritesTheTodoTheQueueReads, TestTheSiblingsOfARowStandAtItsOwnLevel
src/tui/workedit_test.go TestAnEditInTheWorkTabWritesTheFieldToTheTicket, TestAKeyFlipsAMarkAndWritesIt, TestAFrontTakesAFieldSetDroppedAndAdded, TestAFrontFencedWithCRLFTakesTheFieldAndKeepsItsLineEnds, TestTheUrgentKeyWritesACRLFTicket, TestAValueTheSchemaRefusesNamesTheReasonAndWritesNothing
src/tui/work/workplace_test.go TestPlaceValueReadsTheSharedCases
src/tui/work/workedit_test.go TestTheWindowWritesAFieldInTheWritersForm
src/scripts/ticket-edit.js the comments naming PlaceValue, writePlace and WithField

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

src/tui/registry/catalog_contract_test.go holdsTheContract gains its call cases, run by TestTheFakeCatalogKeepsTheContract and TestTheV1CatalogKeepsTheContract
src/tui/registry/v1_test.go TestACallTheIndexStillRunsAnswersItsHandle
src/tui/work/actions_test.go TestThePlaceChordPostsWorkPlace
src/tui/work/actions_test.go TestTheUrgentKeyPostsFlipUrgentForEveryMarkedRow
src/tui/work/actions_test.go TestAnEditPostsSetFieldForEveryRowItWrites
src/tui/work/actions_test.go TestThePullKeyPostsWorkPull
src/tui/work/actions_test.go TestAnActionTheIndexRefusesStandsAsTheNotice
src/tui/work/actions_test.go TestAValueTheSchemaRefusesPostsNothing

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

src/tui/registry/catalog.go
src/tui/registry/v1.go
src/tui/registry/door.go
src/tui/registry/fake.go
src/tui/registry/catalog_contract_test.go
src/tui/registry/v1_test.go
src/tui/work/v1.go
src/tui/work/work.go
src/tui/work/workplace.go
src/tui/work/workedit.go
src/tui/work/door.go
src/tui/work/actions.go
src/tui/work/actions_test.go
src/tui/work/workplace_test.go
src/tui/work/workedit_test.go
src/tui/workplace_test.go
src/tui/workedit_test.go
src/scripts/ticket-edit.js
spec/design_output/tui.md
spec/design_output/pull.md

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

every name stands opened: verbs/actions.go, index/actions.go, registry v1.go, door.go, fake.go and catalog_contract_test.go, and work's door.go, workplace.go, workedit.go, work.go and v1.go, each read on this commit
the callers list: git grep over src for every function the approach removes or changes, the tests and the JS comments among them
the done_when lines: the git grep line is its own command; the key case is src/tui/work/actions_test.go, its five tests over Fake.Call; the check line is ./RUNME.sh check

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test src/tui/work/actions_test.go src/tui/registry/call_contract_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

src/tui/work/actions_test.go
src/tui/registry/call_contract_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Each new case fails on its own assertion. The fake and the V1 door both answer an empty `Said`, and the work tab posts nothing. The flip case shows the old road: the refused flip reads `spec/tickets/one-ticket.md` off the disk and says the file stands nowhere. `TestAValueTheSchemaRefusesPostsNothing` passes already, as the guard that the schema refuses before any post.

What departs from the draft:
- `Call` answers a `registry.Said` holding the result, the running mark and the handle, so a 202 carries its handle.
- The 202 case stands in `call_contract_test.go` beside the contract, so the registry holds one red file.
- The window's `indexCatalog` in `src/tui/main.go` gains `Call` now, a pass-through like its `Read` and `Watch`, so the window builds. The callers list left it out. `TestTheIndexCatalogAnswersAnErrorForAnActionNoIndexTakes` in `src/tui/window_test.go` covers it.

The surprise: a key's command runs off the program, so the cases feed each answered message back through `keyed`, with a wait on each command.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the done_when lines: the grep line is its own command at implement; the key case is src/tui/work/actions_test.go, with a case each for p, u, the edit and P, each reading what the fake door keeps; the check line is ./RUNME.sh check
the doors: the cases post through registry.Fake, which call_contract_test.go holds to the V1 door over an httptest server, and they touch no file past the schema this tree ships

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
