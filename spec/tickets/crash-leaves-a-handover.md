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
step: implement/tests-green
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box 2b095da7efc0 · claude-code-remote
    hash_before: 5883be68dc21ea0376a5a52cb534449dec607e92
    hash_after: 5883be68dc21ea0376a5a52cb534449dec607e92
    inputs:
      - name: ask
        hash: 7985875355c49279
        size: 1353
    def: c01ae0f2ace0cecb
  - step: design/tests-red
    hand: box 2b095da7efc0 · claude-code-remote
    hash_before: 4799d2064aafbc40ea323436c51ddba8f83cfe60
    hash_after: 4799d2064aafbc40ea323436c51ddba8f83cfe60
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/branches fails
    inputs:
      - name: design/draft
        hash: 6b62e90910e5f0c3
        size: 3863
      - name: [[spec/design_output/work]]
        hash: fe7734c5336b7508
        size: 45994
      - name: [[spec/design_output/pull]]
        hash: 3ce642ed632fb96f
        size: 49558
    def: 08e16d07b0de477c
    frozen:
      - path: src/branches/left_test.go
        hash: 44d86ef9fbf532df
      - path: src/pull/pull_next_test.go
        hash: 48f5eee2c7e44fd9
  - step: gate
    hand: box 2b095da7efc0 · claude-code-remote · gate-1
    hash_before: e89705fe9b8955c1936f9ff578c18080df9c796a
    hash_after: e89705fe9b8955c1936f9ff578c18080df9c796a
    inputs:
      - name: design/draft
        hash: 6b62e90910e5f0c3
        size: 3863
      - name: design/tests-red
        hash: 32543ca5851fb50e
        size: 907
      - name: [[spec/design_output/work]]
        hash: fe7734c5336b7508
        size: 45994
      - name: [[spec/design_output/pull]]
        hash: 3ce642ed632fb96f
        size: 49558
    def: dc4904ab364efa10
  - step: implement/change
    hand: box 2b095da7efc0 · claude-code-remote
    hash_before: 340a0e79778ceb31aebcec1f5b1df918e2bc3d63
    hash_after: 340a0e79778ceb31aebcec1f5b1df918e2bc3d63
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
    def: f150b8c0dc20fe45
---

# Ask

A box taking over a dead box's hold starts where the dead one stopped. Its hand-out opens with the last beat, the step in hand and the last record entry. The commits and the rescue work since the dead box's take follow, then the handover the branch carries. A hand-back can carry a `next` line for a stranger, so every claim leaves a baton.

A take-over starts blind, rereads the branch, and repeats or drops the dead box's half step. A session writes a handover at a context clear alone. Clean room B logged far more lease expiries than explicit hand-overs, on `experiment/cleanroom-b`. So a crash is the common hand-over, and today it leaves nothing.

- `./RUNME.sh branch test src/branches` passes a take case: a take over prints the last beat, step and record entry
- a take case: a take over prints the commits since the dead box's take, and the rescue it takes in
- a take case: a take over prints the handover the branch carries, and no handover line where none stands
- a take case: a plain take of a branch at todo prints none of the dead box's lines
- `./RUNME.sh branch test src/pull` passes a pull case: a hand-back with `--next` writes `next` on its entry
- a pull case: the next hand-out of that ticket shows its `next` line
- `spec/examples/110_tickets/pull-next.md` shows a hand-back with `--next` and the hand-out showing it

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

The beat carries what a box leaves, and a take over reads it before it beats itself. `writeBeat` lands the beat as today, then, where this box holds a step or `.se/HANDOVER.md` stands, lands a child commit through `CommitFiles` holding `step` (the ticket path and step `holdOf` names) and `HANDOVER.md` (that file's text). `beatsSeen` still reads the tip's time and subject, so the hold verdicts stand. `claimGroup` reads what the box before left ahead of its own `writeBeat`, since that beat overwrites the old one, and on a take over alone prints a block `What the box before left:` ahead of the ask: the last beat's age, the step in hand off the beat's `step` file, the last record entry of that ticket on the branch, every commit subject since the open take's `hash_before`, the rescue line `takesRescue` prints, and the beat's `HANDOVER.md`, or `no handover` where the beat carries none. A plain take prints none of it. On the pull, `--next "<line>"` joins `takes`, and every entry a hand writes at a hand-back (a pass, a fail, a gate verdict) carries `next`. `workAnswer` prints the latest `next` on the ticket's record under the leaf line as `The hand before left: <line>`. The ticket schema gains `next` on a record entry. The change writes the design into [[spec/design_output/work]] under a take over reads what the box left, and [[spec/design_output/pull]] under a hand-back leaves a next line. A beat inside half the span writes nothing, so the step a beat names can trail the hold by that much, and the block names the beat's age beside it.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- `src/branches/beat.go` `beatVerb` calls `writeBeat`
- `src/branches/take.go` `claimGroup` calls `writeBeat`, `takesRescue` and `brief`
- `src/branches/take.go` `take` calls `claimGroup`
- `src/branches/beat.go` `takeOver` calls `claimGroup`
- `src/branches/beat.go` `beatsSeen` reads the beat commit
- `src/pull/pull_writes.go` `passed` and the fail writers write a hand's entry
- `src/pull/pull_gate.go` the gate verdict writers write a hand's entry
- `src/pull/pull.go` `positionalOf` reads `takes`, which gains `--next`
- `src/pull/pull_back.go` `handBack` and `src/pull/pull_hand.go` `handed` call `workAnswer`

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- beat line: `src/branches/left_test.go` `TestABeatCarriesTheStepAndTheHandover`
- first take line: `src/branches/left_test.go` `TestATakeOverPrintsWhatTheBoxBeforeLeft`
- second take line: `src/branches/left_test.go` `TestATakeOverPrintsTheCommitsSinceTheDeadTake`
- third take line: `src/branches/left_test.go` `TestATakeOverPrintsTheHandoverTheBeatCarries` and `TestATakeOverWithNoHandoverSaysNone`
- fourth take line: `src/branches/left_test.go` `TestAPlainTakePrintsNothingLeft`
- first pull line: `src/pull/pull_next_test.go` `TestAHandBackWritesItsNextLine` and `TestAFailHandBackWritesItsNextLine`
- second pull line: `src/pull/pull_next_test.go` `TestTheNextHandOutShowsTheNextLine`
- example line: `spec/examples/110_tickets/pull-next.md`, run by `src/quack/examples_test.go` `TestEveryExampleHoldsItsSteps`

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/branches/beat.go
- src/branches/take.go
- src/branches/left.go
- src/branches/left_test.go
- src/pull/pull_next.go
- src/pull/pull_next_test.go
- src/pull/pull_writes.go
- src/pull/pull_gate.go
- src/pull/pull.go
- src/pull/pull_chapter.go
- spec/schemas/ticket.schema.yaml
- spec/design_output/work.md
- spec/design_output/pull.md
- spec/examples/110_tickets/pull-next.md

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- opened `beat.go`, `take.go`, `held.go`, `hand.go`, `group.go`, `rescue.go`, `pull_writes.go`, `pull_chapter.go`, `pull_frozen.go` and the git door's `CommitFiles` and `EmptyCommit`, and checked each claim there
- the callers list names every caller of `writeBeat`, `claimGroup`, the entry writers and `workAnswer`
- each done_when line names its case in the tests list
- the change adds no config key

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

    ./RUNME.sh branch test src/branches/left_test.go src/pull/pull_next_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/branches/left_test.go
- src/pull/pull_next_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Every new take case fails on its own assertion. The take over prints the rescue line and the ask, and nothing of the beat, the step, the record or the handover. The plain take case passes, since it guards what stands today. The pass and the fail write no next field, and the hand-out shows no next line. The example harness runs every example and skips no red file. So `spec/examples/110_tickets/pull-next.md` lands with the change, and fails before it on exit 1 at the hand-back.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every done_when line meets a failing case in `left_test.go` or `pull_next_test.go`, and the example line lands at the change
- the take cases reach git, the disk and the clock through the fake tree, and the pull cases through `cloudPull`

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

    ./RUNME.sh lint src/branches/left.go src/branches/beat.go src/branches/take.go src/pull/pull_next.go src/pull/pull_writes.go src/pull/pull_gate.go src/pull/pull.go src/pull/pull_chapter.go spec/schemas/ticket.schema.yaml spec/examples/110_tickets/pull-next.md src/quack/examples_harness_test.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change stands in the files the draft names, plus the harness fixture, whose alpha refused every hand-back
- the take cases run on the fake tree, and the pull cases and the example on the fakes of the pull
- each function and constant in `left.go` and `pull_next.go` points at its design section
- the beat files and the next field stand once, in `left.go`, `pull_next.go` and the ticket schema

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
