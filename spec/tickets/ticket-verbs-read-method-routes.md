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
    gate: does the approach break a rule of the ask, and does a red test decide every done_when line
    does: reads the design phase for the rules of the ask it breaks, fixes what it finds within its own diff, names the rest as points, and leaves the rest of the ask alone
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
        does: makes the change the ask names, with the red tests as its floor, so a rule of the ask lands where no red test names it
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
process_hash: 3fd2a7591c5044cf
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box 1ad094d8843c · claude-code-remote
    hash_before: fe50bd4079c058737879ec2e86e8f4dfe0489503
    hash_after: fe50bd4079c058737879ec2e86e8f4dfe0489503
    inputs:
      - name: ask
        hash: b506441e9f8fd28c
        size: 631
    def: c01ae0f2ace0cecb
  - step: design/tests-red
    hand: box 1ad094d8843c · claude-code-remote
    hash_before: dfab5999c60feed58f64e317e4d3f09654083128
    hash_after: dfab5999c60feed58f64e317e4d3f09654083128
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/quack fails
    inputs:
      - name: design/draft
        hash: 36b75deaec55f13b
        size: 1875
    def: 08e16d07b0de477c
group: tickets-keep-their-chapters
---

# Ask

ticket update, fill, set and urgent read processes and the ticket schema from the method root, so a ticket minted under a vehicle can be filled, updated, set and marked urgent, as one under the self-driving tree can.

Under a vehicle, ticket fill and update refuse with spec/processes holds no <name>, and ticket set and urgent answer that the key stands in no ticket's front, so a vehicle's tickets stand frozen at their mint.

- go test ./src/quack -run 'TestTicketUpdate|TestTicketFill|TestTicketSet' passes one vehicle case a verb, with the method and the work root in separate temp dirs
- ./RUNME.sh check is green

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

A helper `methodDisk` beside `workDisk` in `src/quack/ticket_set.go` answers the disk under the method root that `rootsOf` names. Fill, update, set and urgent then read the method root for their method files, and the ticket itself off the work root. `ticket fill` reads `pull.ProcessAt`, `withRoute` and the schemas through the method disk. `ticket update` reads `pull.ProcessAt`, `copiedBase` with the method repository, and the schema through it. `ticketWritten`, which set and urgent share, takes the method disk for the schema it weighs a value against, off `it.Method`. The JSON case harness takes `spec/processes/` beside `spec/schemas/` into the method root of a vehicle case.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- `src/quack/ticket_fill.go` `ticketFill`
- `src/quack/ticket_update.go` `ticketUpdate` and `copiedBase`
- `src/quack/ticket_set.go` `ticketSet` and `ticketWritten`
- `src/quack/ticket_urgent.go` `ticketUrgent`
- `src/quack/verb_mint.go` `withRoute`, which fill calls with the method disk

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- `src/quack/testdata/ticket_fill.json` a vehicle case under `TestTicketFillVerb`
- `src/quack/testdata/ticket_update.json` a vehicle case under `TestTicketUpdateVerb`
- `src/quack/ticket_set_test.go` a vehicle case under `TestTicketSet`, for set and urgent

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- `src/quack/ticket_set.go`
- `src/quack/ticket_fill.go`
- `src/quack/ticket_update.go`
- `src/quack/ticket_urgent.go`
- `src/quack/ticket_route_test.go`
- `src/quack/ticket_set_test.go`
- `src/quack/testdata/ticket_fill.json`
- `src/quack/testdata/ticket_update.json`

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the four verbs, `workDisk`, `rootsOf`, `withRoute`, `copiedBase` and `ticketWritten` stand opened, and each claim checked there
- the callers list names each verb and helper the method disk reaches
- each done_when line names its case under tests
- the approach adds no config key

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test src/quack/ticket_fill_test.go src/quack/ticket_update_test.go src/quack/ticket_set_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/quack/ticket_fill_test.go
- src/quack/ticket_update_test.go
- src/quack/ticket_set_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Fill and update refuse under a vehicle on the schema the work root lacks. Set and urgent refuse that the key stands in no ticket's front. Each vehicle case copies a passing case of its verb, so the case differs from it by the two roots alone.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each done_when line meets its failing vehicle case, one a verb, and urgent rides beside set
- the cases reach git through the fake repository the harness stands in, and the disk through two temp roots

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
