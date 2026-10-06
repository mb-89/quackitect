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
    hash_before: 9c7dedd7188bd81b0137babeed9597d105dda9bd
    hash_after: 9c7dedd7188bd81b0137babeed9597d105dda9bd
    inputs:
      - name: ask
        hash: 19065eb63385a8de
        size: 410
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box 57a5a484096e · claude-code-remote
    hash_before: d5925a0507c50e0c1d2aaaa7e144ae117b1f413c
    hash_after: d5925a0507c50e0c1d2aaaa7e144ae117b1f413c
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/pull fails
    inputs:
      - name: design/draft
        hash: 52abf16de242c557
        size: 1885
    def: 08e16d07b0de477c
  - step: gate
    hand: box 57a5a484096e · claude-code-remote · helper-4
    hash_before: 69bd64b2e1711b581f17b5881e774be0c4545318
    hash_after: 69bd64b2e1711b581f17b5881e774be0c4545318
    inputs:
      - name: design/draft
        hash: 52abf16de242c557
        size: 1885
      - name: design/tests-red
        hash: f6de9d513d415d65
        size: 783
    def: dc4904ab364efa10
  - step: implement/change
    hand: box 57a5a484096e · claude-code-remote
    hash_before: 652294ed547ae8be41197a23e85767752ecb7bf0
    hash_after: 652294ed547ae8be41197a23e85767752ecb7bf0
    answered:
      - name: lint
        exit: 0
        said: "    1.6  test/contract/front.test.js set, drop, entry and after write what se-front writes over tickets of this tree"
    def: f150b8c0dc20fe45
  - step: implement/tests-green
    hand: box 57a5a484096e · claude-code-remote
    hash_before: 5a0daa93532ccd53f5ef184ae6ab89bfd81183f3
    hash_after: 5a0daa93532ccd53f5ef184ae6ab89bfd81183f3
    answered:
      - name: tests
        exit: 0
        said: green
      - name: check
        exit: 0
        said: "  119.7  in all"
    inputs:
      - name: design/tests-red
        hash: f6de9d513d415d65
        size: 783
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

A pull whose plan names a free ticket hands that ticket out, so the box keeps working.

The plan names the ticket the pull is about to hand, the pull answers wait, and the box stalls.

- `go test ./src/pull/` passes a case where the pull hands out the free ticket the plan works on.
- `go test ./src/pull/` passes a case where a working todo that is no ticket still holds the pull.
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

The pull reads the plan's `working` as a todo only where it names no ticket. In src/pull/pull_holds.go, `workingTodo` returns the trimmed name as now. It returns empty where the name finds a ticket under spec/tickets or .se/tickets.

The test for a ticket is a small helper `namesTicket(disk, name)` beside `TicketAt` in src/pull/ticket_at.go. It answers true where `TicketAt` finds a path other than the bare name, so a todo naming a file path stays a todo.

`Pull` in src/pull/pull.go keeps its road unchanged. With the todo empty, the pull reaches `handOut`, and the queue hands the free leaf. On work/engine-verbs-hold, a plan naming the group ticket now hands the group's next child. A plan naming a child hands that child where it heads the queue.

The `--as` road keeps reading `working` through the same function, so a helper naming a ticket stays bound to it.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

src/pull/pull.go (*It).Pull
src/pull/pull_test.go TestPull

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

src/pull/pull_test.go TestPull/a_plan_naming_a_free_ticket_hands_it_out
src/pull/pull_test.go TestPull/a_plan_naming_the_group_ticket_hands_its_child
src/pull/pull_test.go TestPull/a_working_todo_that_is_no_ticket_still_holds_the_pull
src/pull/ticket_at_test.go TestNamesTicket

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

src/pull/pull_holds.go
src/pull/ticket_at.go
src/pull/ticket_at_test.go
src/pull/pull_test.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

pull.go Pull, pull_holds.go workingTodo, ticket_at.go TicketAt, pull_hand.go handOut and its Wanted filter, and pull_test.go cloudPull stand opened and read.
A grep for workingTodo over src names Pull as its one caller; TicketAt keeps its signature, so its caller in src/quack/ticket_set.go sees no change.
The free-ticket case is TestPull/a_plan_naming_a_free_ticket_hands_it_out, the todo case is TestPull/a_working_todo_that_is_no_ticket_still_holds_the_pull, and ./RUNME.sh check runs both.

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/pull/pull_test.go src/pull/ticket_at_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

src/pull/pull_test.go
src/pull/ticket_at_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

A plan naming alpha or the group g answers wait with the todo in hand, which is the stall this box met at its first pull. The case of a todo that names no ticket passes already, and it keeps its guard under the name the ask gives it. A stub namesTicket answering false lets the read compile.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

The first done_when line meets TestPull/a_plan_naming_a_free_ticket_hands_it_out, the second meets TestPull/a_working_todo_that_is_no_ticket_still_holds_the_pull, and the check line waits for tests-green.
The pull cases run on the real-git tree the package already proves its door on, and the name case runs on FakeDisk.

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- helpers-keep-the-plan-ticket: in src/pull/pull.go Pull, `wanted = working` on the --as road reads workingTodo. Once workingTodo answers empty for a ticket name, a helper pulling with --as no longer binds to the ticket the plan names and takes the queue head instead, which contradicts the approach line saying the --as road stays bound. Read the raw plan line for `wanted` and `helps`, filter only the todo hold through namesTicket, and add a TestPull case where a plan naming alpha and a pull with --as hands alpha.

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

The change touches src/pull/pull.go, pull_holds.go, ticket_at.go and pull_test.go: the draft's size list plus Pull, which the gate's child names.
The change reaches the disk alone, through the Disk door, and FakeDisk and the cloudPull clone cover it.
workingTodo and Pull each carry a link to the ticket whose approach they implement.
The plan read stands once in planWorking, and the ticket test reuses TicketAt.

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

CGO_ENABLED=0 go test -count=1 ./src/pull/ -run "^(TestNamesTicket|TestPull)$/^(a_plan_naming|a_helper|a_working_todo)" && echo green

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

A pull whose plan names a ticket no longer reads it as a todo, so the box stops stalling on wait. workingTodo in src/pull/pull_holds.go asks namesTicket in src/pull/ticket_at.go, and a name that finds a ticket holds no pull. A todo that is no ticket still holds it. A helper pulling with --as stays bound to the ticket the plan names. The tests line runs this ticket cases alone, because TestPull also holds the cold path case that running-work-takes-main-fixes keeps red until it lands.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

The change touches src/pull/pull.go, pull_holds.go, ticket_at.go and pull_test.go: the draft's size list plus Pull, which the gate's child names.
The change reaches the disk alone, through the Disk door, and FakeDisk and the cloudPull clone cover it.
workingTodo and Pull each carry a link to the ticket whose approach they implement.
The plan read stands once in planWorking, and the ticket test reuses TicketAt.

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
