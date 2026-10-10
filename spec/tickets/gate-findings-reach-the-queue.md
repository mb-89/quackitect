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
group: the-engine-fixes-its-faults
step: implement/tests-green
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box 6150d1759159 · claude-code-remote
    hash_before: dc964595ab4910b588eea388d48bf65cb2b95718
    hash_after: dc964595ab4910b588eea388d48bf65cb2b95718
    inputs:
      - name: ask
        hash: af50e45e3390c84c
        size: 648
    def: c01ae0f2ace0cecb
  - step: design/tests-red
    hand: box 6150d1759159 · claude-code-remote
    hash_before: a0059cbd9051d729a3fadc74ea78c3025a12c9cf
    hash_after: a0059cbd9051d729a3fadc74ea78c3025a12c9cf
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/pull fails
    inputs:
      - name: design/draft
        hash: a2bdbd277d1fdbf7
        size: 1364
    def: 08e16d07b0de477c
  - step: gate
    hand: box 6150d1759159 · claude-code-remote · helper-4
    hash_before: 21b88d601fcd12cf9f97e99f964925abaf9c0542
    hash_after: 21b88d601fcd12cf9f97e99f964925abaf9c0542
    inputs:
      - name: design/draft
        hash: a2bdbd277d1fdbf7
        size: 1364
      - name: design/tests-red
        hash: 4f761e24fb6097dd
        size: 495
    def: dc4904ab364efa10
  - step: implement/change
    hand: box 6150d1759159 · claude-code-remote
    hash_before: f5bf822fc7f0a64e6da45658daf250f322b49e7a
    hash_after: f5bf822fc7f0a64e6da45658daf250f322b49e7a
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
    def: f150b8c0dc20fe45
  - step: implement/tests-green
    hand: box 6150d1759159 · claude-code-remote
    hash_before: 2f4764dfb2883de5ef0e569450b9db76dbb7b23c
    hash_after: 2f4764dfb2883de5ef0e569450b9db76dbb7b23c
    answered:
      - name: tests
        exit: 0
        said: green, src/pull passes
      - name: check
        exit: 0
        said: "   99.9  in all"
    inputs:
      - name: design/tests-red
        hash: 4f761e24fb6097dd
        size: 495
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

<!-- gain, as text: what is gained by doing it, and not only what it does -->
gain: a reject at a group's `accept` mints each finding as a child the group waits on, in one hand-back.

<!-- breaks, as text: what breaks if it is never done -->
breaks: `rejected` in `src/pull/pull_gate.go` copies the step before the gate. At a group's `accept` that copy is `children-2`, which passes at once with no child open. A second reject finds only a copy, and refuses as `pull-reject-no-phase`.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
done_when:

- `go test ./src/pull/ -run TestARejectAtAGroupsAcceptMintsItsFindings` passes, reading a child per finding and the group waiting at `children`
- the same case rejects twice, and reads the second findings minted as well
- `./RUNME.sh check` answers 0 on this box

<!-- view, as text: the view the owner reads the change in and the number there, in the owner's words, or none -->
view: none

<!-- from, as text: handover where the ask comes off a handover line, so the owner reads it first, or none -->
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

`rejected` in `src/pull/pull_gate.go` takes a road of its own on a group whose route holds a `by: children` step. Each finding row of the reject, written as a ticket name and its line, mints an open child in the group on the trivial route, with no `todo` tag. The group writes the reject entry, goes back to its `children` step and waits there. It copies nothing, so a second reject takes the same road. A reject naming no ticket on a row is refused, and the hold stands. The cap in `acceptCapped` still turns a reject past it into a question. `minted` in `src/pull/pull_writes.go` lends the loop that builds the children, cut into a helper both call.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- `src/pull/pull_back.go`, `handBack`, the one caller of `rejected`
- `src/pull/pull_writes.go`, `minted`, which shares the child-building helper

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- `src/pull/pull_gate_group_test.go`, `TestARejectAtAGroupsAcceptMintsItsFindings`, over two rejects in a row

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- `src/pull/pull_gate.go`
- `src/pull/pull_writes.go`
- `src/pull/pull_gate_group_test.go`
- `spec/design_output/pull.md`

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- `rejected`, `reworked`, `minted`, `childrenWaiting`, `VerdictIn` and `handBack` stand opened, and the claims hold there
- the callers come off a search over `src`
- both done_when cases meet the named test
- the approach adds no config key

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test src/pull/pull_gate_group_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/pull/pull_gate_group_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The reject lands, copies `children` as `children-2` and mints no child, so the case fails on its first read of `fix-one`. The group fixture needs a `split` step under `on_fail` and a Discussion chapter before the hand-back takes it.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- both done_when lines meet the one case, which rejects twice
- the case drives the cloud pull fakes, so it reaches no real door

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- reject-rows-reach-rejected: `VerdictIn` in `src/pull/pull_chapter.go` folds the rows of a reject into `Reason` joined by semicolons and fills no `Findings`, and `handBack` in `src/pull/pull_back.go` hands `rejected` the reason alone, so the builder carries the parsed rows to `rejected` and adds both files to the size
- nameless-reject-meets-a-case: no case covers the refused reject whose row names no ticket, so the builder adds one beside `TestARejectAtAGroupsAcceptMintsItsFindings`

# implement

## change

<!-- what you change, and what surprises you -->

<!-- the form is text -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

    ./RUNME.sh lint src/pull/pull_gate.go src/pull/pull_writes.go src/pull/pull_chapter.go src/pull/pull_back.go src/pull/pull_gate_group_test.go spec/design_output/pull.md

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches the draft's four files and the two the gate's first point adds, the chapter and the hand-back
- the change reaches no door, and both cases drive the cloud pull fakes
- each new function points at this ticket, and the gate chapter names the new road
- the child-building loop stands once, and both the mint and the reject call it

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

    ./RUNME.sh test src/pull/pull_gate_group_test.go

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

A reject at a group's accept now mints an open child a finding row, in the group, and sends the group back to its children step. It copies no step, so a second reject takes the same road in place of a refusal. A reject row naming no child refuses the reject, and the hold stands. The gate's two points rode into this build: the reject's rows now reach the gate, and a case covers the nameless row.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask and both gate points
- the change reaches no door, and both cases drive the cloud pull fakes
- each new function points at this ticket
- the child-building loop stands once, and the gate chapter names the road

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

The ask moves onto the Go code and keeps the reject alone. The points half closes under `gate-points-pass-the-push`:

- `minted` in `src/pull/pull_writes.go` marks each point `point: gate`
- `TaggedIn` in `src/modules/hooks/command/todo.go` passes it at the push
