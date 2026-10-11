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
    hash_before: 1742510cd5248fb3e816c441f20f9ff6ce0c32ae
    hash_after: 27f986ab2902bb1c862214a425eacf622109405a
    inputs:
      - name: ask
        hash: 0ed00b31dadca36d
        size: 761
    def: c01ae0f2ace0cecb
  - step: design/tests-red
    hand: box 1ad094d8843c · claude-code-remote
    hash_before: 99012cd5455a4ba5f23ea7c8638be03b94ffd41c
    hash_after: 99012cd5455a4ba5f23ea7c8638be03b94ffd41c
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/modules/check fails
    inputs:
      - name: design/draft
        hash: ab2e1e1551e664fe
        size: 1595
    def: 08e16d07b0de477c
  - step: gate
    hand: box 1ad094d8843c · claude-code-remote · helper-4
    hash_before: 50466109d3ce2e5315788b355ba20c83541d23bc
    hash_after: 50466109d3ce2e5315788b355ba20c83541d23bc
    inputs:
      - name: design/draft
        hash: ab2e1e1551e664fe
        size: 1595
      - name: design/tests-red
        hash: 266fbcd3763fadef
        size: 705
    def: dc4904ab364efa10
  - step: design/draft
    hand: the engine
    stale: ask
  - step: design/draft
    hand: box 1ad094d8843c · claude-code-remote
    hash_before: 3b1377138fffb0fea5cf4b42a0d7df0cf5d3922f
    hash_after: 3b1377138fffb0fea5cf4b42a0d7df0cf5d3922f
    inputs:
      - name: ask
        hash: 3e3db88775c09a0a
        size: 769
    def: c01ae0f2ace0cecb
  - step: design/tests-red
    skipped: true
    kept: ca6940d705586fd74d18608ab30c92cb76210740
    why: its red tests stand as ca6940d70 landed them, and a later leaf passed since
group: tickets-keep-their-chapters
---

# Ask

A rerouted or updated ticket keeps its Ask and every chapter under a vehicle, because ticket route and ticket update read the ticket schema from the method root, as the pull and the mint do, and a missing schema refuses instead of writing a body with no chapters.

Under a vehicle, ticket route answers exit 0 and leaves the ticket holding only its front matter, so the Ask and every written chapter are lost without a word.

- go test ./src/quack -run TestTicketRoute passes a vehicle case, with the method and the work root in separate temp dirs, where the routed note keeps its Ask text and every chapter
- go test ./src/modules/check -run TestReRouted passes a case where a nil schema refuses with an error and writes nothing
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

`ReRoute` in `src/modules/check/rerouted.go` writes the rerouted text, and answers `ErrNoSchema` where the schema stands nil, writing nothing. `ReRouted` stays as the text `ReRoute` writes, for the three callers that guard a nil schema themselves. `ticket route` and `ticket update` read the ticket schema off the method root through `methodDisk`, beside `workDisk`, and stop on the refusal before any write. The processes `ticket update` reads stay with the sibling `ticket-verbs-read-method-routes`. The change stands in 476871014, and the ask's done_when line now names `./src/modules/check`.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- `src/quack/ticket_route.go` `ticketRoute`
- `src/quack/ticket_update.go` `ticketUpdate`
- `src/pull/pull_stale.go` the stale route write
- `src/pull/pull_person.go` `reRouted`
- `src/branches/escalate.go` the person step insert

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- `src/quack/ticket_route_test.go` a vehicle case under `TestTicketRoute`, the method and the work root in two temp folders
- `src/modules/check/rerouted_test.go` the nil schema row under `TestReRouted`, which calls `ReRoute`

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- the gate's point on the update case: the sibling's vehicle update case answers it, and update-keeps-chapters-under-vehicle closes answered by that sibling
- the gate's point on the seeded text: the vehicle route case seeds text under the draft chapter and expects it back
- the gate's point on the package: the done_when line names `./src/modules/check`

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- `src/modules/check/rerouted.go`
- `src/modules/check/rerouted_test.go`
- `src/quack/ticket_route.go`
- `src/quack/ticket_update.go`
- `src/quack/ticket_set.go`
- `src/quack/ticket_route_test.go`
- `src/quack/testdata/ticket_route.json`

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- `ReRouted`, both verbs, `ticketSchema`, `workDisk`, `rootsOf` and the three other callers stand opened, and each claim checked there
- the callers list names every caller of `ReRouted` and of `ticketSchema`
- each done_when line names its case under tests
- the approach adds no config key

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test src/modules/check src/quack/ticket_route_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/modules/check/rerouted_test.go
- src/quack/ticket_route_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Under a vehicle the route writes the front alone, since the work root holds no schema, and the case shows the Ask and every chapter gone. A nil schema writes a whole front today, so the row asks for no text. The error return lands with the change, since a new signature would stop the build before any assertion.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each done_when line meets its failing case: the vehicle route case and the nil schema row
- the route case reaches git through the fake repository the harness stands in, and the disk through two temp roots

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- update-keeps-chapters-under-vehicle: the ask names ticket update beside ticket route, and the draft changes both. But no case runs `ticket update` under a vehicle, so nothing proves the update keeps its chapters. Add a vehicle case to `testdata/ticket_update.json` once the sibling `ticket-verbs-read-method-routes` lands its process reads.
- vehicle-case-seeds-chapter-text: the vehicle case seeds `slow-lint.md` with text under the Ask alone, and its `draft`, `review` and `do` chapters stand empty. The case proves the headings come back, not that a written chapter keeps its words. Seed text under `draft` and want it back.
- ask-names-the-check-package: the second `done_when` line runs `go test ./src/check`, a package the tree lacks. The test stands in `./src/modules/check`, so the line should name that path.

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
