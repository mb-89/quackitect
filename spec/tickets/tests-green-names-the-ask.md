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
group: handovers-and-light-work
step: implement/change
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box 2b095da7efc0 · claude-code-remote
    hash_before: 16fe7cdf9d3c207d3c418de12c5720e56f242ca5
    hash_after: 16fe7cdf9d3c207d3c418de12c5720e56f242ca5
    inputs:
      - name: ask
        hash: 18a5b9b7df4d1843
        size: 1074
    def: c01ae0f2ace0cecb
  - step: design/tests-red
    hand: box 2b095da7efc0 · claude-code-remote
    hash_before: b06b7a2dedfb09fc4214d1c487a22687d3eba3a8
    hash_after: b06b7a2dedfb09fc4214d1c487a22687d3eba3a8
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/pull fails
    inputs:
      - name: design/draft
        hash: 7e005849172a56f2
        size: 2824
    def: 08e16d07b0de477c
    frozen:
      - path: src/pull/pull_stale_test.go
        hash: aa273832af6fad50
  - step: gate
    hand: box 2b095da7efc0 · claude-code-remote · helper-9
    hash_before: 6572ba8503728d27a4af2b8c4b66cfcab8934c7f
    hash_after: 6572ba8503728d27a4af2b8c4b66cfcab8934c7f
    inputs:
      - name: design/draft
        hash: 7e005849172a56f2
        size: 2824
      - name: design/tests-red
        hash: 56fb3f5adf2f128b
        size: 882
    def: dc4904ab364efa10
---

# Ask

The hand at tests-green aims at the ask, and reads the red tests as its floor. A rule the ask states lands even where no red test names it. The gate reviewer reads the rules of the ask the work breaks, and leaves the rest. Clean room B measured the old wording making the tests the target, on `experiment/cleanroom-b`. A rule the ask stated went missing in most chains, and in few after the rewording.

A hand at tests-green stops at green, and a rule the ask states with no red test behind it ships missing.

- `spec/processes/standard.yaml` has tests-green make the change the ask names, with the red tests as the floor
- the gate step and its review guidance scope the reviewer to rules of the ask the work breaks
- `./RUNME.sh branch test src/pull` passes a pull case: a ticket on the old hash past tests-green keeps its step
- a pull case: a ticket on the old hash at tests-green hands out the new wording
- `spec/examples/110_tickets/pull-tests-green.md` shows the tests-green hand-out naming the ask and the floor
- `./RUNME.sh check` passes on the commit

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

The rewording lands in the route and the review guidance, and the pull keeps the step a rewording leaves alone.

- `spec/processes/standard.yaml`: `implement/tests-green` says it makes the change the ask names, with the red tests of `design/tests-red` as its floor, so a rule of the ask lands where no red test names it. Its input gains `ask`.
- `spec/processes/standard.yaml`: the `gate` question asks which rules of the ask the work breaks, and its `does` scopes the reviewer to those.
- `spec/guidance/review/design.md` rule 1 names each rule of the ask the approach breaks, and leaves the rest.
- `src/pull/pull_stale.go` `processRead`: a leaf whose `def` moved, and whose fresh entry differs from the ticket's own copy in `does` and `gate` alone, counts as unmoved. One list, `wordingFields`, names the two keys. So a ticket past tests-green keeps its step and the wording it answered, which `UpdatedRoute` already keeps on a reached leaf. A ticket at tests-green takes the new wording, since `UpdatedRoute` copies the route ahead of the reached leaves.
- `spec/design_output/pull.md`, chapter An input marks its steps: the process-edit table gains the row for a leaf moved in its wording alone.
- `spec/examples/110_tickets/pull-tests-green.md`: the pull hands out a ticket at tests-green, and the hand-out names the ask and the floor.

Without the pull change, every open standard ticket past the gate goes back to the gate at its next pull, which the two pull lines of the ask forbid. A change to `evidence`, `input` or any other key still sends a ticket back, so the rule narrows nothing the stale read guards.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/pull/pull_stale.go staleRead calls processRead
- src/pull/pull_bless.go readAgain calls staleRead
- src/pull/pull_route.go UpdatedRoute keeps the reached leaves processRead copies
- src/quack/examples_harness_test.go plantedTickets plants the ticket the example pulls

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/pull/pull_stale_test.go TestATicketPastTestsGreenKeepsItsStepOnAReword
- src/pull/pull_stale_test.go TestATicketAtTestsGreenTakesTheNewWording
- src/pull/pull_stale_test.go TestAnEvidenceMoveStillSendsATicketBack
- spec/examples/110_tickets/pull-tests-green.md, run by TestEveryExampleHoldsItsSteps

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- spec/processes/standard.yaml
- spec/guidance/review/design.md
- src/pull/pull_stale.go
- src/pull/pull_stale_test.go
- spec/design_output/pull.md
- spec/examples/110_tickets/pull-tests-green.md
- src/quack/examples_harness_test.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- opened processRead, staleRead, UpdatedRoute, FieldsOf, SameStep, standard.yaml, review/design.md and the pull design note
- the callers list names every reader of processRead and of the route it copies
- each done_when line names its case, the example, or the check
- the change adds no config key

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

    ./RUNME.sh branch test src/pull/pull_stale_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/pull/pull_stale_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Both pull cases fail on their own assertion. A ticket on the old hash goes back to the gate at its first pull, since the reworded gate moves its def. That holds at tests-green and past it. The evidence-move case passes, and guards the stale read the change keeps. Surprise: the bare pull reroutes through the queue scan, so no hand-back is needed to see the fault.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the two pull lines meet the two red cases, and the evidence case guards the rest
- the route line, the gate line and the check line stand as checkpoints the change answers
- the example line meets TestEveryExampleHoldsItsSteps once pull-tests-green.md lands at the change
- the doors: the cases run on cloudPull, a fake disk and a fake git, with the process read off the fake disk

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- reworded-input-keeps-the-step: the draft adds `ask` to the `input` of implement/tests-green in spec/processes/standard.yaml, yet `wordingFields` in processRead names `does` and `gate` alone, so on the real route that leaf's def moves outside the wording and a ticket past tests-green still goes back, against done_when line 3; drop the input change or count `input` as unmoved, and make the case in src/pull/pull_stale_test.go reword the leaf's input as the real route does
- stale-callers-name-hand-out: the callers list skips src/pull/pull_hand.go, whose hand-out calls readAgain and so staleRead

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

- The change keeps `input: design/tests-red` on `implement/tests-green`, and adds no `ask` there. The hand-out prints the Ask on every leaf already, so the new `does` names the ask without the input. Then `does` and `gate` stay the only keys the reword moves, and `wordingFields` covers both. [[spec/tickets/reworded-input-keeps-the-step]]
- The callers list gains `src/pull/pull_hand.go`, whose queue scan calls `readAgain` and so `staleRead`. [[spec/tickets/stale-callers-name-hand-out]]
