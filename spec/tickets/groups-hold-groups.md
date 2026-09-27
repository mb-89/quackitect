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
group: the-cloud-works-its-queue
depends_on: [dispatch-writes-the-bundles]
step: design/tests-red
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box d7e093d924e2 · claude-code-remote
    hash_before: f2bfdfa1bf4db9102f548232b2e69a0d05a98ece
    hash_after: f2bfdfa1bf4db9102f548232b2e69a0d05a98ece
    inputs:
      - name: ask
        hash: 3bc8b3019abe9755
        size: 2421
      - name: [[spec/design_input/the-cloud-runs-itself]]
        hash: 5a2557d24d86ab34
        size: 13510
      - name: [[spec/design_output/tree-view]]
        hash: 41f88d071009b333
        size: 14929
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box d7e093d924e2 · claude-code-remote
    hash_before: 1c9bcae27264fe69d8f3defaa84252abbac3e0ce
    hash_after: 1c9bcae27264fe69d8f3defaa84252abbac3e0ce
    answered:
      - name: tests
        exit: 1
        said: assertion, 10 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: c76b3dbde22c5f22
        size: 5112
    def: 08e16d07b0de477c
  - step: gate
    hand: box d7e2326ed644e · claude-code-remote
    hash_before: c0362c7dc22e6e55b701481cee32b40cf5f75962
    hash_after: c0362c7dc22e6e55b701481cee32b40cf5f75962
    inputs:
      - name: design/draft
        hash: c76b3dbde22c5f22
        size: 5112
      - name: design/tests-red
        hash: 76adb2a2ca4b60c0
        size: 1399
    def: dc4904ab364efa10
  - step: implement/change
    hand: box d7e2326ed644e · claude-code-remote
    hash_before: 63102090928a01535f6ac5e59cefa392b4c4fa1d
    hash_after: 63102090928a01535f6ac5e59cefa392b4c4fa1d
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
    def: f150b8c0dc20fe45
  - step: design/draft
    hand: the engine
    stale: [[spec/design_output/tree-view]]
  - step: design/draft
    hand: box d7e2326ed644e · claude-code-remote
    hash_before: 405386a49ed0317e6a92058a0efe27375edbeac8
    hash_after: 405386a49ed0317e6a92058a0efe27375edbeac8
    inputs:
      - name: ask
        hash: 3bc8b3019abe9755
        size: 2421
      - name: [[spec/design_input/the-cloud-runs-itself]]
        hash: 5a2557d24d86ab34
        size: 13510
      - name: [[spec/design_output/tree-view]]
        hash: a188bdfeed9395a9
        size: 15128
    def: 7883b3d10633c780
---

# Ask

A group holds groups, per [[spec/design_input/the-cloud-runs-itself#groups-hold-groups]]. A child group waits on its own `depends_on` and on every ancestor's. A parent closes once no child stands open. A ticket a group files lands in that group's parent, so a fix bundle and a ticket for a person hold the parent open. So a big move runs as a chain of parent groups, and a review inside it is a ticket for a person.

Without it an ordered move takes a config switch the owner edits, and a group's follow-up lands loose, tied to no move. The work tab nests rows at any depth already, through `itemsOfTickets` in `src/tui/work/workitems.go`. For the nesting, see [[spec/design_output/tree-view#the-name-column-nests]]. It lacks a mark saying what holds a parent open. The index row carries no reading of a ticket for a person, and no flag in `spec/views/work.base` reads one.

- a case in `test/level0/dispatch.test.js` hands a group holding a group to no worker
- a case there lists that parent to close once every child stands closed on `main`
- a case there holds a group back while its parent's parent waits on an open group
- that case frees the group once the open group closes
- `waitingOn` in `src/scripts/work-stands.js` reads a dependency off its ticket on `origin/main` alone
- a case in `test/level0/work-stands.test.js` finds a parent with no branch holding its dependents
- a case in `test/level0/dispatch.test.js` finds a parent's close written once over two runs
- a case there bundles each parent's loose agent tickets into a fix group under that parent
- a case in `test/level0/work-done.test.js` finds `branch done` moving each open child under the parent
- that case moves each ticket the branch adds with no group there too
- a case there leaves them loose where the group stands at the top
- the work tab lights a letter on a group row over an open ticket for a person
- `spec/views/work.base` names that flag, and the rows carry its key
- a case in `src/tui/work/workitems_test.go` lights the letter over a ticket two levels down
- `spec/design_output/tree-view.md` names the letter, and `spec/design_output/work.md` carries the parent rules
- `spec/guidance/tickets.md` tells a hand to nest a group for a big move alone
- `./RUNME.sh check` exits 0

The view: the work tab in the window. A parent group's row lights the new letter while a ticket for a person stands open under it.

The source: none.

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

A group names its parent under `group`, and one walk reads the chain. Each rule below takes that walk.

1. The chain. `ancestorsOf` in `src/engine/group.js` walks `group` up from a group ticket on `origin/main`. It stops on a loop, and a group some group names is a parent.
2. The wait. `waitingOn` in `src/scripts/work-stands.js` reads a dependency off its group ticket on `origin/main` alone. It holds while that ticket stands short of `state: closed`, so a parent with no branch holds its dependents. `waitsOf` joins the waits of every ancestor.
3. The hand. `freeIn` in `src/scripts/work-free.js` drops every parent, so its children reach workers and the parent reaches none.
4. The close. The plan gains a `closes` part: each parent open on `origin/main` whose children all stand closed there. `writesOf` writes `state: closed` on each into the one dispatch commit. A second run meets the unmerged dispatch branch and writes nothing, so a close lands once.
5. The bundle. `bundlesOf` keys the loose agent tickets by the parent their `group` names, and the top stands as the parent named by nothing. Each bundle becomes a fix group whose `group` names that parent.
6. The filing. `branch done` files where it refused before. Each open child and each ticket the branch adds with no group takes the group's parent under `group`. A top group leaves them loose. `fixRefuses` keeps its refusal, so a fix group still finishes its own tickets. The filing reuses `withoutField` and the write `freeChildren` makes in `src/scripts/work-merge.js`.
7. The mark. The index row gains `person`: the ticket stands open, and its current step says `by: person`. That reading follows `personStep` in `src/scripts/work-answer.js`, and a comment in each file names the other. `itemsOfTickets` lifts `person` up the nest, so a group row lights while any row under it holds one. `spec/views/work.base` adds the letter P on the key `person`.

The cost: the person rule stands in a JavaScript reader and a Go reader. A single reader asks the index to carry every step's hand, which widens this move. The objection is drift between the two, and a case on each side reading one fixture ticket answers it.

I assume a parent needs no route step of its own. It stands open until the dispatch closes it, and `split` takes a child group as it takes a ticket.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/scripts/dispatch.js planned: reads waitsOf, freeIn and bundlesOf, and gains the closes part
- src/scripts/dispatch.js bundlesOf: keys bundles by parent
- src/scripts/dispatch-write.js opensOf: calls waitingOn
- src/scripts/dispatch-write.js writesOf: writes each fix group's parent and each close
- src/scripts/work-stands.js waitsOf: calls waitingOn and joins the ancestors' waits
- src/scripts/work-free.js freeIn: drops parents, and feeds the trigger
- src/scripts/work-list.js: calls waitsOf
- src/scripts/work.js: calls waitsOf, and finish calls childrenStand
- src/scripts/work.js childrenStand: files in place of the refusal
- src/scripts/work-merge.js freeChildren: shares the write the filing takes
- test/level0/work.test.js: calls waitingOn
- src/tickets/tickets.go Ticket and All: gain the person field
- src/tui/work/workitems.go itemsOfTickets and itemOfTicket: lift the person key

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- test/level0/dispatch.test.js: a parent reaches no worker
- test/level0/dispatch.test.js: a parent closes once every child stands closed on main
- test/level0/dispatch.test.js: a grandparent's open dependency holds a group back
- test/level0/dispatch.test.js: that group comes free once the dependency closes
- test/level0/dispatch.test.js: a parent's close lands once over two runs
- test/level0/dispatch.test.js: each parent's loose agent tickets bundle into a fix group under it
- test/level0/work-stands.test.js: a parent with no branch holds its dependents
- test/level0/work-done.test.js: branch done files each open child under the parent
- test/level0/work-done.test.js: branch done files each added loose ticket under the parent
- test/level0/work-done.test.js: a top group leaves them loose
- src/tui/work/workitems_test.go: TestPersonLightsTwoLevelsUp
- src/tickets/tickets_test.go: TestPersonReadsTheStepHand

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/engine/group.js
- src/scripts/work-stands.js
- src/scripts/work-free.js
- src/scripts/dispatch.js
- src/scripts/dispatch-write.js
- src/scripts/work.js
- src/scripts/work-merge.js
- src/tickets/tickets.go
- src/tui/work/workitems.go
- spec/views/work.base
- spec/design_output/work.md
- spec/design_output/tree-view.md
- spec/guidance/tickets.md
- test/level0/dispatch.test.js
- test/level0/work-stands.test.js
- test/level0/work-done.test.js
- src/tui/work/workitems_test.go
- src/tickets/tickets_test.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- a survey helper opened each file and function the approach names, with its line; I opened work-answer.js, work.base and tickets.go myself
- the callers list takes every caller of waitingOn, waitsOf, freeIn, bundlesOf and childrenStand the survey found
- each done_when line maps to a test in the tests list, and the doc lines and the check need none

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test test/level0/dispatch.test.js test/level0/work-stands.test.js test/level0/work-done.test.js src/tui/work src/tickets

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- test/level0/dispatch.test.js
- test/level0/work-stands.test.js
- test/level0/work-done.test.js
- src/tui/work/workitems_test.go
- src/tickets/tickets_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Each new case fails on its own assertion, and every earlier case in the five files passes.

Three things surprise me, and I decide each one here for the gate to read.

1. `opensOf` in `src/scripts/dispatch-write.js` opens a branch for a parent standing on main with none. So the change drops parents there too, beside `freeIn`. The write cases give their parents `cloud: true` until then.
2. A top group now leaves its open children loose, as the ask says. So three earlier refusal cases in `test/level0/work-done.test.js` change at tests-green to expect the filing.
3. `waitingOn` reading `origin/main` alone moves the dispatch case on closed dependencies onto the trunk read, and its fixture changes with it.

The Go cases read `person` through the JSON row, so a missing key reads false and the files compile before the field exists.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each done_when line meets a failing case, and the doc lines, the view letter and the check stand as checkpoints the implement step answers
- the git, disk, front and clock doors each take the fake the earlier cases use

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

pass with findings
- take-reads-the-parent-chain: `branch take`, the trigger and `pull-hand.js` call `freeIn` over `readWork(it)` with no trunk, so they miss an ancestor's wait and a parent standing on `main` alone. Only the dispatch reads the chain after this ticket.

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh lint src/engine/group.js src/scripts/work-stands.js src/scripts/work-free.js src/scripts/dispatch.js src/scripts/dispatch-write.js src/scripts/work.js src/scripts/work-merge.js src/scripts/work-fix.js src/tickets/tickets.go src/tui/work/workitems.go spec/views/work.base spec/design_output/work.md spec/design_output/tree-view.md spec/guidance/tickets.md test/level0/work-done.test.js

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches the files the size list names, and `src/scripts/work-fix.js` beside them, whose `addedHere` the filing shares with `fixLeaves`
- the change reaches git and the disk alone, and the cases drive both through the fakes the earlier cases use
- each new function carries a comment linking the groups-hold-groups chapter of the design input
- the parent rules stand once, as a table in `spec/design_output/work.md` naming each function, and the tree view and the guidance link it

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
