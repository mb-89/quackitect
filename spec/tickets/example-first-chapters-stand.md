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
group: examples-run-as-tests
depends_on: ["example-harness-runs-on-fakes", "example-coverage-check-reports"]
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box 23ee163eaf36 · claude-code-remote
    hash_before: 670ba430798efdd43eabb3bff18faa0aa7f62659
    hash_after: 670ba430798efdd43eabb3bff18faa0aa7f62659
    inputs:
      - name: ask
        hash: 35216ca059f5678c
        size: 572
      - name: [[spec/design_output/examples]]
        hash: 5245c4fe35ade37e
        size: 8237
    def: c01ae0f2ace0cecb
  - step: design/tests-red
    hand: box 23ee163eaf36 · claude-code-remote
    hash_before: aeda7c6537da9a118877184cbaf270fba000ec9e
    hash_after: aeda7c6537da9a118877184cbaf270fba000ec9e
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/quack fails
    inputs:
      - name: design/draft
        hash: e074fbb1c5f328f8
        size: 6616
      - name: [[spec/design_output/examples]]
        hash: 5245c4fe35ade37e
        size: 8237
    def: 08e16d07b0de477c
  - step: gate
    hand: box 23ee163eaf36 · claude-code-remote · helper-4
    hash_before: 7a1a4d1bf7309615fead15a56044584a2ad92a4b
    hash_after: 7a1a4d1bf7309615fead15a56044584a2ad92a4b
    inputs:
      - name: design/draft
        hash: e074fbb1c5f328f8
        size: 6616
      - name: design/tests-red
        hash: da38d90bf8f8bb8c
        size: 1717
      - name: [[spec/design_output/examples]]
        hash: 5245c4fe35ade37e
        size: 8237
    def: dc4904ab364efa10
  - step: implement/change
    hand: box 23ee163eaf36 · claude-code-remote
    hash_before: 6411a7c0c87b07fa3b410e0d811a696133c4eb4e
    hash_after: 9b8f27ea63d6331d99a768ae314b9829e322832e
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
    def: f150b8c0dc20fe45
---

# Ask

The first chapters of examples stand, so a user learns the tree from them and the suite asserts the normal behavior there. [[spec/design_output/examples#the-suite]]

The harness and the tab hold nothing, and the behavior stays asserted in tests no user reads.

- user chapters cover the ticket, branch and check verbs, and developer cases cover the edges their tests hold today
- each test that asserts again what an example shows leaves, and the Discussion lists each one cut
- the coverage report names fewer features than before
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

The design stands in [[spec/design_output/examples]]; this ticket applies it to three verb families, in three moves.

1. The doors. Each verb the chapters show joins the harness table once its constructor takes a fakeable door:

| verb | today | the change |
|---|---|---|
| `ticket set`, `ticket todo`, `ticket urgent` | build `pull.OSDisk` off `rootOf` | take `pullOver`, as `ticket note` does, and read `it.Disk`; `init` passes `pullingHere(index.Root, registeredRepo)` |
| `branch` | builds `branchDoors` inside the twin | `branchVerb` takes `func(out, errs io.Writer) *branches.Doors`; `init` wraps `branchDoors(index.Root, index.V1, ...)` |
| `check` | takes `doorsOf` already | no change; the harness builds a `checkDoors` whose `run`, `verb`, `get` and `git` answer from fakes |

The harness adds `spec/schemas` to `fixtureFolders`, builds `branches.Doors` over the same fake tree, fake repo and fake runner the pull holds, answers `Value`, `Guidance` and `Queue` from fixed fakes, and pushes one commit to origin `main` past the seed, so a sync has something to take.

2. The chapters, each file one behavior:

| file | interface | shows |
|---|---|---|
| `110_tickets/pull.md` | ticket pull | stands |
| `110_tickets/note.md` | ticket note | a note lands under `.se/tickets` |
| `110_tickets/set.md` | ticket set | a field lands, read back by `field` |
| `110_tickets/todo.md` | ticket todo | a free note takes the todo flag |
| `110_tickets/urgent.md` | ticket urgent | a ticket takes the urgent mark |
| `120_branches/list.md` | branch | the listing shows the open group |
| `120_branches/sync.md` | branch | a work branch takes main |
| `120_branches/release.md` | branch | a level branch hands back |
| `130_check/check.md` | check | a green run exits 0 and says so |
| `910_dev_tickets/set-refuses-engine-field.md` | ticket set | edge: `state` refuses |
| `910_dev_tickets/todo-refuses-grouped.md` | ticket todo | edge: a ticket riding a group refuses |
| `920_dev_branches/release-refuses-unpushed.md` | branch | edge: unpushed commits refuse |
| `920_dev_branches/sync-refuses-other-branch.md` | branch | edge: a branch off `main` and `work/` refuses |
| `930_dev_check/check-red-exits-1.md` | check | edge: a red part exits 1 |

`branch take` and `branch done` stay out of the first chapters: take needs a free group the fixture plants already taken, and done needs a written retro and a green stamp. Each joins with the chapter that plants them.

3. The cuts. At tests-green, each test below leaves where the example asserts every claim of its name, and stays where it asserts more; the Discussion lists each one cut or kept, with the reason:

- `src/quack/ticket_note_test.go` TestTicketNote, the landing row
- `src/quack/ticket_set_test.go` TestTicketSet, the landing and the engine-field rows
- `src/quack/ticket_todo_test.go` TestTicketTodo, the flag and the grouped rows
- `src/quack/ticket_urgent_test.go` TestTicketUrgent, the mark row
- `src/branches/port_d_list_test.go` TestPDTheListingShowsOpenWorkByDefault
- `src/branches/port_d_sync_test.go` TestPDSyncOnAWorkBranchTakesMain
- `src/branches/sync_test.go` TestTheSyncRefusesAnyOtherBranch
- `src/branches/port_a_leave_test.go` TestPALevelBranchReleases, TestPAReleaseRefusesUnpushedCommits
- `src/quack/check_test.go` TestCheckVerb, the green and red rows

Assumed: one example per verb family covers its registered name, since `ExampleCovers` reads `branch` and `check` as one name each; the coverage report drops `ticket set`, `ticket todo`, `ticket urgent`, `branch` and `check`.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/quack/ticket_set.go init
- src/quack/ticket_todo.go init
- src/quack/ticket_urgent.go init
- src/quack/ticket_set_test.go TestTicketSet, through the registered verb
- src/quack/ticket_todo_test.go TestTicketTodo, through the registered verb
- src/quack/ticket_urgent_test.go TestTicketUrgent, through the registered verb
- src/quack/branch.go init
- src/quack/branch_test.go TestTheGoVerbsPrintTheirUsage
- src/quack/dispatch.go dispatchVerb, which calls branchDoors and stays as it stands
- src/quack/cloud.go cloudVerb, which calls branchDoors and stays as it stands
- src/quack/examples_harness_test.go exampleTable and exampleTree

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- spec/examples/110_tickets/note.md, run by src/quack/examples_test.go TestEveryExampleHoldsItsSteps
- spec/examples/110_tickets/set.md, same
- spec/examples/110_tickets/todo.md, same
- spec/examples/110_tickets/urgent.md, same
- spec/examples/120_branches/list.md, same
- spec/examples/120_branches/sync.md, same
- spec/examples/120_branches/release.md, same
- spec/examples/130_check/check.md, same
- spec/examples/910_dev_tickets/set-refuses-engine-field.md, same
- spec/examples/910_dev_tickets/todo-refuses-grouped.md, same
- spec/examples/920_dev_branches/release-refuses-unpushed.md, same
- spec/examples/920_dev_branches/sync-refuses-other-branch.md, same
- spec/examples/930_dev_check/check-red-exits-1.md, same
- src/modules/check/coverage_test.go TestTheFirstChaptersLeaveTheirVerbsUnreported: ExampleCovers over the tree names none of ticket set, ticket todo, ticket urgent, branch, check

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/quack/ticket_set.go
- src/quack/ticket_todo.go
- src/quack/ticket_urgent.go
- src/quack/branch.go
- src/quack/examples_harness_test.go
- src/modules/check/coverage_test.go
- src/quack/ticket_note_test.go
- src/quack/ticket_set_test.go
- src/quack/ticket_todo_test.go
- src/quack/ticket_urgent_test.go
- src/quack/check_test.go
- src/branches/port_d_list_test.go
- src/branches/port_d_sync_test.go
- src/branches/sync_test.go
- src/branches/port_a_leave_test.go
- spec/examples/110_tickets/*.md
- spec/examples/120_branches/*.md
- spec/examples/130_check/check.md
- spec/examples/910_dev_tickets/*.md
- spec/examples/920_dev_branches/*.md
- spec/examples/930_dev_check/check-red-exits-1.md
- spec/tickets/example-first-chapters-stand.md, the Discussion

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- opened: branch.go, check.go, checkdoors.go, ticket_set.go, ticket_todo.go, ticket_note.go, ticket_pull.go, ticket_doors.go, examples_harness_test.go, coverage.go and the test names above; ticket_urgent.go read by its init and signature alone, and implement opens its body before the change
- callers: a grep for branchVerb, branchDoors, ticketSet, ticketTodo, ticketUrgent and checkVerb across src names each line above
- done_when: chapters by TestEveryExampleHoldsItsSteps; cuts by the Discussion list; fewer features by TestTheFirstChaptersLeaveTheirVerbsUnreported; check exits 0 by ./RUNME.sh check at tests-green
- config keys: the approach adds none

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/quack/examples_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/quack/examples_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Ten new examples fail on the harness's own miss: each names a verb outside the harness table, so no fake answers it. The note example passes already, since ticket note stands in the table. The coverage case passes as soon as the example files stand, because the rule reads interface alone. So it guards the drop, and the red examples decide the chapters. Three surprises change the draft. First, the check verb removes, reads and writes its runtime files through os calls on its root, so implement routes those through a disk on checkDoors before check joins the table. Second, an example runs ./RUNME.sh calls alone, so no example switches branch or plants a red part: the sync edge on another branch and the red check edge stay in their Go tests, and TestCheckVerb keeps its red rows. Third, a release edge on unpushed commits needs a commit verb in the table, so the developer case shows the uncommitted refusal instead. The lint on this box reads no tracked file, so the coverage count comes from the Go case, not the Problems panel.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- done_when 1: ten red examples under spec/examples, decided by TestEveryExampleHoldsItsSteps
- done_when 2: the cuts land at tests-green and the Discussion lists them, a checkpoint the hand answers
- done_when 3: TestTheFirstChaptersLeaveTheirVerbsUnreported holds the drop
- done_when 4: ./RUNME.sh check at tests-green
- fakes: the pull runs over the fake disk, git and process the harness builds; branch takes branches.Doors over the same fakes; check takes a checkDoors whose run, git, get and disk answer from fakes, the disk added at implement

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

pass
- the approach answers the ask: ten red examples under spec/examples decide the chapters, red on the harness's own miss (each verb stands outside exampleTable); note.md and pull.md pass already; the door claims hold (ticketSet, ticketTodo, ticketUrgent build pull.OSDisk through workDisk; ticketNote takes pullOver; branchVerb builds branchDoors inline; dispatch.go and cloud.go call branchDoors; fixtureFolders lacks spec/schemas)
- size, fixed in place at implement: check.go and checkdoors.go join the size and callers lists, since check.go removes, reads and writes runtime files through os calls (lines 131-207, 460-479) and the disk lands on checkDoors before check joins the table
- tables, fixed in place: the chapter table and the tests list still name 930_dev_check/check-red-exits-1.md, 920_dev_branches/sync-refuses-other-branch.md and release-refuses-unpushed.md; the tree holds release-refuses-uncommitted.md in their place, as tests-red says
- cuts, fixed in place: TestTheSyncRefusesAnyOtherBranch, TestPAReleaseRefusesUnpushedCommits and the red rows of TestCheckVerb stay, since no example shows them, and the Discussion lists each as kept
- tests list, fixed in place: TestTheFirstChaptersLeaveTheirVerbsUnreported stands in src/quack/examples_test.go, not src/modules/check/coverage_test.go; it passes already, so it guards the drop rather than deciding it red, which done_when 3 accepts since the example files already stand
- done_when 4 rests on ./RUNME.sh check at tests-green, a checkpoint the hand answers

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh lint src/quack/check.go src/quack/branch.go src/quack/branch_test.go src/quack/examples_harness_test.go src/quack/ticket_set.go src/quack/ticket_todo.go src/quack/ticket_urgent.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches the files the size list names, plus check.go, which the gate adds to it
- ticket set, todo and urgent take the pull door, branch takes a doors constructor, and check carries a disk, so the harness hands each one a fake over the copy
- each new type and function links to spec/design_output/examples#one-runner-two-drivers
- the harness table stands in exampleTable alone, and the main commit file name stands once, as a constant

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
