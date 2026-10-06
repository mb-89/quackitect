---
kind: [[ticket]]
state: closed
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
group: engine-verbs-hold
step: implement/tests-green
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box 57a5a484096e · claude-code-remote
    hash_before: ece7f09e348353050d0a96d02f0cfa4b3dc47eff
    hash_after: ece7f09e348353050d0a96d02f0cfa4b3dc47eff
    inputs:
      - name: ask
        hash: 74af97a0fdb11a41
        size: 316
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box 57a5a484096e · claude-code-remote
    hash_before: 31c1db075cb7cc1dd08535902bc19a76c5b539ca
    hash_after: 31c1db075cb7cc1dd08535902bc19a76c5b539ca
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/branches fails
    inputs:
      - name: design/draft
        hash: a9e49e10896a0dc7
        size: 1733
    def: 08e16d07b0de477c
  - step: gate
    hand: box 57a5a484096e · claude-code-remote · helper-4
    hash_before: 424afe23ad3a2683a4c6b93662107215a6621c14
    hash_after: 424afe23ad3a2683a4c6b93662107215a6621c14
    inputs:
      - name: design/draft
        hash: a9e49e10896a0dc7
        size: 1733
      - name: design/tests-red
        hash: 8532ce005e537ef8
        size: 652
    def: dc4904ab364efa10
  - step: implement/change
    hand: box 57a5a484096e · claude-code-remote
    hash_before: b5d743bbaaec42e0574c8b5f979b07b5477f57d9
    hash_after: b5d743bbaaec42e0574c8b5f979b07b5477f57d9
    answered:
      - name: lint
        exit: 0
        said: "  118.0  in all"
    def: f150b8c0dc20fe45
  - step: implement/tests-green
    hand: box 57a5a484096e · claude-code-remote
    hash_before: 6082bfb1bc7885496bce20e9ed5a412a7b160034
    hash_after: 6082bfb1bc7885496bce20e9ed5a412a7b160034
    answered:
      - name: tests
        exit: 0
        said: green, src/branches passes
      - name: check
        exit: 0
        said: "    1.7  test/contract/desk-start.test.js a server the proc door starts detached writes its marker after its starter exi"
    inputs:
      - name: design/tests-red
        hash: 8532ce005e537ef8
        size: 652
    def: ec253787263043a7
  - step: accept
    skipped: true
    why: the delivery's acceptance reads this ticket
  - step: view
    skipped: true
    why: the ask names no view the owner reads
reason: done
---

# Ask

A fix group the dispatch mints hands out its tickets at once, with no hand running ticket open.

Each loose-fixes group stands as a draft, and its box finds nothing to pull until a hand opens it.

- `go test ./src/branches/` passes a case where `fixGroup` writes the group at state open.
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

fixGroup in src/branches/dispatch_write.go writes the group at state open, with its step at the route's first leaf. After check.Minted and the fix mark, it sets withField(text, "state", openState) and withField(text, "step", firstLeaf(route.Steps, "")). This is the same pair escalate.go writes when it opens a ticket, and OpensDraft in src/pull/pull_ticket.go writes for ticket open. openState and firstLeaf stand in src/branches/group.go already, so the change adds no constant.

The fix group then reads open on the write branch the dispatch lands. takeable in src/branches/route.go hands its children to the box the next dispatch opens, with no hand running ticket open. The comment above fixGroup names this ticket.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

src/branches/dispatch_write.go (*Doors).writesOf
src/branches/dispatch.go (*Doors).carried (calls writesOf)
src/branches/dispatch.go Dispatch (calls carried)

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

src/branches/dispatch_write_test.go TestFixGroupWritesTheGroupOpenAtItsFirstStep

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

src/branches/dispatch_write.go
src/branches/dispatch_write_test.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

Opened dispatch_write.go (fixGroup, writesOf, processAt, schemas), dispatch.go (carried, Dispatch, opensOf via dispatch_write.go, leftForPerson), group.go (openState, firstLeaf, withField), route.go takeable, escalate.go line writing step and state open, and pull_ticket.go OpensDraft.
Callers came from a grep for fixGroup and writesOf across src; fixGroup has one caller, writesOf, and writesOf has one, carried.
The done_when line 'go test ./src/branches/ passes a case where fixGroup writes the group at state open' meets TestFixGroupWritesTheGroupOpenAtItsFirstStep; ./RUNME.sh check stands as its own command.

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/branches/dispatch_write_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

src/branches/dispatch_write_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The fix group comes back at state draft with no step, which is the stall the ask names. The case reads the real schema and the group process under the tree, and it needs no git, since fixGroup reads those two files alone.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

The done_when line on `go test ./src/branches/` meets TestFixGroupWritesTheGroupOpenAtItsFirstStep, and the check line waits for tests-green.
The case reaches no door: fixGroup reads two tracked files through readFile, and the dispatch case over a real origin already proves that door.

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh check

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change touches no file the ask leaves out: it changes fixGroup in src/branches/dispatch_write.go alone, the file whose test the ask names.
every door the change reaches has a fake: fixGroup reads the route through Doors.processAt, and the case drives it over the tree root with no network.
a comment names the approach the change implements: the comment above fixGroup says the group lands open at its route first step, so its box pulls with no hand running ticket open.
every fact the change adds stands in one place: the change calls firstLeaf and openState from src/branches/group.go, the same pair escalate.go writes.

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh branch test src/branches/dispatch_write_test.go

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The dispatch now writes each fix group open at its route first step. Before, fixGroup minted the group as a draft, and leftForPerson kept that draft for a person, so the group box found nothing to pull. fixGroup in src/branches/dispatch_write.go now sets state and step with openState and firstLeaf, the same pair escalate.go writes.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change touches no file the ask leaves out: it changes fixGroup alone.
every door the change reaches has a fake: the case drives fixGroup over the tree root through Doors, with no network.
a comment names the approach the change implements: the comment above fixGroup names the open first step.
every fact the change adds stands in one place: the change calls openState and firstLeaf from group.go.

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
