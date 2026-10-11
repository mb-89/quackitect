---
kind: [[ticket]]
state: closed
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
    hand: box 2b095da7efc0 · claude-code-remote
    hash_before: e89705fe9b8955c1936f9ff578c18080df9c796a
    hash_after: b2f8ba5a5cb82f756106d29f923a6229ee460fec
    inputs:
      - name: ask
        hash: 93f43e6e0d6cbad9
        size: 1103
    def: c01ae0f2ace0cecb
  - step: design/tests-red
    hand: box 2b095da7efc0 · claude-code-remote
    hash_before: 146d62cd8a9707e447aa1806f49ca9be68b52562
    hash_after: 146d62cd8a9707e447aa1806f49ca9be68b52562
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/quack fails
    inputs:
      - name: design/draft
        hash: 629f9b2b6b972396
        size: 2693
    def: 08e16d07b0de477c
    frozen:
      - path: src/quack/verb_mint_light_test.go
        hash: 2bdabddefdbca065
  - step: gate
    hand: box 56610d6296ee · claude-code-remote
    hash_before: 2dc55bc6bb86d5327bb80a591efe65648dd09728
    hash_after: 2dc55bc6bb86d5327bb80a591efe65648dd09728
    inputs:
      - name: design/draft
        hash: 629f9b2b6b972396
        size: 2693
      - name: design/tests-red
        hash: 6aed32223962e7cb
        size: 933
    def: 7cea74295027d571
  - step: implement/change
    hand: box 56610d6296ee · claude-code-remote
    hash_before: 9426c4261bee7a785d0682619c26aee344467638
    hash_after: 9426c4261bee7a785d0682619c26aee344467638
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
    def: f150b8c0dc20fe45
  - step: implement/tests-green
    hand: box 56610d6296ee · claude-code-remote
    hash_before: c0fe1a89bcdf81d45c80a9d374f8ac0eddb273b9
    hash_after: c0fe1a89bcdf81d45c80a9d374f8ac0eddb273b9
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes; green, src/pull passes
      - name: check
        exit: 0
        said: "   71.6  in all"
    inputs:
      - name: design/tests-red
        hash: 6aed32223962e7cb
        size: 933
    def: ebccfd52b1111bbe
    reopen:
      - path: src/quack/verb_mint_light_test.go
        why: a sibling rewrote it after the freeze, and its t.Parallel beside the t.Setenv in runsVerb panicked before the assertion ran, so the case drops t.Parallel and keeps every assertion
    next: accept reads the diff, then view, then the group reaches accept
  - step: accept
    skipped: true
    why: the delivery's acceptance reads this ticket
  - step: view
    skipped: true
    why: the ask names no view the owner reads
group: handovers-and-light-work
reason: done
---

# Ask

Work one session can hold takes a light route by default. Its one step lands the change with its tests, committed and green on a clean tree. A stopping line closes it: stop when the tests cover every rule of the ask and pass, and leave working code alone. The full route stays for everything else. Clean rooms B and C both measured the full harness costing a multiple of the tokens on tasks up to an hour. A single agent told when to stop matched its quality.

Small work pays for the full route's draft, gate and accept. An agent with no stopping line polishes working code past the ask.

- `spec/processes/trivial.yaml` carries the stopping line on its step, and `./RUNME.sh check` passes
- `./RUNME.sh branch test src/quack` passes a mint case: a ticket minted with no `--process` takes the trivial route
- a mint case: a ticket minted with `--process=standard` keeps the full route
- the tickets guidance names which tickets take the light route, and `./RUNME.sh lint` passes on it
- `spec/examples/110_tickets/mint-light.md` shows a mint with no `--process` landing on the trivial route

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

The light route is the trivial route, and it gains the stopping line.

- `spec/processes/trivial.yaml`: the `do` step says it makes the change with tests covering every rule of the ask, commits both on a clean tree, and stops once they pass. A checklist line carries the stopping line word for word.
- `src/quack/verb_mint.go`: a ticket minted with no `--process` takes the trivial route. The name comes from one exported constant, `pull.LightRoute`, which the finding route in `childrenOf` reads too.
- `spec/guidance/tickets.md` rule 6: a ticket one session holds whole mints with no `--process`. That is one module, the ask as the design, no open design question and no view. Anything else names `--process=standard`.
- The example harness wires no mint verb, and the mint reads the real disk. So the example shows the pull handing out a trivial leaf with its stopping line. The planted alpha names the trivial route on a stale hash, and the pull reroutes it onto the shipped file.

The trivial hash moves, so an open trivial ticket at `do` takes the new route at its next pull and keeps its step. The group route stays as it stands, so no open group moves back to its split.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- `src/quack/verb_mint.go` `mintVerb` calls `withRoute`
- `src/pull/pull_writes.go` `childrenOf` reads the trivial route
- `src/pull/pull_stale.go` `processRead` reroutes an open trivial ticket
- `src/quack/examples_harness_test.go` `plantedTickets` plants alpha

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- mint line: `src/quack/verb_mint_light_test.go` `TestAMintWithNoProcessTakesTheTrivialRoute`, which reads the stopping line in the minted route
- standard line: `src/quack/verb_mint_light_test.go` `TestAMintWithStandardKeepsTheFullRoute`
- trivial line: the stopping line in the minted route, and the example
- guidance line: a checkpoint, `./RUNME.sh lint spec/guidance/tickets.md`
- example line: `spec/examples/110_tickets/pull-light.md`, run by `TestEveryExampleHoldsItsSteps`

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first
- the ask names `mint-light.md`, and the harness wires no mint, so `pull-light.md` proves the light route through the pull

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- spec/processes/trivial.yaml
- src/quack/verb_mint.go
- src/quack/verb_mint_light_test.go
- src/pull/pull_writes.go
- src/quack/examples_harness_test.go
- spec/examples/110_tickets/pull-light.md
- spec/guidance/tickets.md
- spec/rationales/tickets.md

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- opened `verb_mint.go`, `withRoute`, `childrenOf`, `processRead`, `trivial.yaml`, the tickets guidance and the harness fixture
- the callers list names every reader of the trivial route and the mint's route choice
- each done_when line names its case or its checkpoint
- the change adds no config key

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

    ./RUNME.sh branch test src/quack/verb_mint_light_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/quack/verb_mint_light_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

`TestAMintWithNoProcessTakesTheTrivialRoute` fails on its own assertion: with no `--process`, the mint takes no route, so it refuses `--gain` as no field of a ticket note. `TestAMintWithStandardKeepsTheFullRoute` passes, and guards the full route through the change. The trivial case reads `leave working code alone` in the minted route, so the trivial step's checklist carries those words.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the done_when lines: the mint line meets the red trivial case, the standard line its guard, the trivial line the stopping line read in the same case, the guidance line the lint checkpoint, and the example line TestEveryExampleHoldsItsSteps once pull-light.md lands at the change
- the doors: both cases run on mintTree, a temp tree with git, seeded with the shipped trivial and standard routes

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept

- The approach breaks no rule of the ask. The trivial route gains the stopping line. A bare mint takes it through one constant, and the guidance names who takes it.
- A red test decides every done_when line. The light case in src/quack/verb_mint_light_test.go fails on its own assertion. The standard case stands as one assertion in the first mint subtest of `src/quack/verb_mint_test.go`. A sibling moved it there, so the draft names a stale test and the guard still holds.
- The ask names mint-light.md, and the draft lands pull-light.md, since the example harness wires no mint. I take that departure, and the implementer records it under says.

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

    ./RUNME.sh lint spec/guidance/tickets.md spec/rationales/tickets.md spec/processes/trivial.yaml src/quack/verb_mint.go src/pull/pull_writes.go src/quack/examples_harness_test.go spec/examples/110_tickets/pull-light.md

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches the files the draft names, and two sibling examples whose alpha now meets the trivial route
- the change reaches no new door, and the mint reads the disk it read before
- each change carries a comment linking the ticket
- the light route stands once, as `pull.LightRoute`, and the mint and the finding route both read it

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

    ./RUNME.sh branch test src/quack/verb_mint_light_test.go src/quack/verb_mint_test.go src/pull

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

A ticket minted with no `--process` now takes the trivial route, the light one. Its one step carries the stopping line: stop when the tests cover every rule of the ask and pass, and leave working code alone. The route name stands once, as `pull.LightRoute`, read by the mint and by the route a finding child takes. Rule 6 of the tickets guidance names the tickets that take it, and the rationale carries the clean-room measure.

The ask names `mint-light.md`, and the example harness wires no mint, so `pull-light.md` shows the pull handing out a trivial leaf with its stopping line. Alpha in the harness names the trivial route on a stale hash, so the pull takes the shipped route in. Two sibling examples hand alpha back, so each now carries the check and the checklist lines the trivial route asks.

The red light test panicked on `t.Parallel` beside `t.Setenv`, so it drops `t.Parallel` under a reopen. The minted golden and the projected output style follow the route and the guidance.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches the drafted files, the two sibling examples alpha meets, the golden and the projection
- the change reaches no new door
- each change carries a comment linking the ticket
- the light route stands once, as `pull.LightRoute`

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
