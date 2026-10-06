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
group: failures-stand-registered
step: implement/tests-green
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box 83c32b2b4d58 · claude-code-remote
    hash_before: 0e884188e97ecfdf3cbe113cdba38930a86e783f
    hash_after: 4c6146c219d45b66b33f92b30fec857e70e5a02a
    inputs:
      - name: ask
        hash: 2c7231ba7aced856
        size: 1214
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box 83c32b2b4d58 · claude-code-remote
    hash_before: 28a6b1ce18f4b7c928fb73afb16e8e992e2937be
    hash_after: 28a6b1ce18f4b7c928fb73afb16e8e992e2937be
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/quack fails
    inputs:
      - name: design/draft
        hash: d608216124531fde
        size: 2833
      - name: [[spec/design_output/failures]]
        hash: 88bf6a4f020f44dd
        size: 263
    def: 08e16d07b0de477c
  - step: gate
    hand: box 83c32b2b4d58 · claude-code-remote · helper-4
    hash_before: 82c792e07035c55b12db16d5c686d6315098ac0b
    hash_after: 82c792e07035c55b12db16d5c686d6315098ac0b
    inputs:
      - name: design/draft
        hash: d608216124531fde
        size: 2833
      - name: design/tests-red
        hash: 08bd99e184844752
        size: 586
      - name: [[spec/design_output/failures]]
        hash: c263fe950a83d49b
        size: 4620
    def: dc4904ab364efa10
  - step: gate
    hand: the engine
    stale: [[spec/design_output/failures]]
  - step: gate
    hand: box 83c32b2b4d58 · claude-code-remote · helper-6
    hash_before: bee55121b59e65f098cc560e6dc7935a4a143154
    hash_after: bee55121b59e65f098cc560e6dc7935a4a143154
    inputs:
      - name: design/draft
        hash: d608216124531fde
        size: 2833
      - name: design/tests-red
        hash: 08bd99e184844752
        size: 586
      - name: [[spec/design_output/failures]]
        hash: 78b48d5ee9b48235
        size: 4931
    def: dc4904ab364efa10
  - step: implement/change
    hand: box 83c32b2b4d58 · claude-code-remote
    hash_before: 63a8fdf9565ba4e4aa6af92748ffe1ad2433fe6f
    hash_after: 63a8fdf9565ba4e4aa6af92748ffe1ad2433fe6f
    answered:
      - name: lint
        exit: 0
        said: "test/level0/work-stands.test.js:16:1: correctness/noUnusedImports: Several of these imports are unused."
    def: f150b8c0dc20fe45
  - step: implement/tests-green
    hand: box 83c32b2b4d58 · claude-code-remote
    hash_before: 8e2e929d6bec8e08da1a34777ce44a527ec91740
    hash_after: 8e2e929d6bec8e08da1a34777ce44a527ec91740
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "    1.7  test/contract/lint-twins.test.js the Go lint and the check's lint name the same finding lines"
    inputs:
      - name: design/tests-red
        hash: 08bd99e184844752
        size: 586
    def: ec253787263043a7
  - step: accept
    skipped: true
    why: the delivery's acceptance reads this ticket
  - step: view
    skipped: true
    why: the ask names no view the owner reads
depends_on: failure-nodes-stand, failure-door-raises, failure-check-refuses, sentinel-fires-watches, failure-verbs-raise-and-register
reason: done
---

# Ask

Every failure carries a unique id, a node under spec/failures, and at least one remedy. A module raises it, the sentinel fires it on a watch, or an agent raises it by verb.

Refusals are free text written at each site. Many name no fix, two point at each other, and box after box retries the same one.

- A failure module in Go and its JavaScript twin is the one door that raises a refusal, and prints the id, the message and each remedy.
- A failure node names its level, as a log call does, and may name a reaction the engine runs when it fires, such as a wake, a hold release or a rescue push.
- The check refuses a failure node with no remedy, an id in code with no node, and refusal text written outside the failure door.
- A failure node may declare a watch, and the sentinel fires the failure when its event arrives, through the clock door and with no poll.
- A `failure raise <id>` verb lets an agent fire a failure, and `failure new` registers one a hand meets with no id, refusing one with no remedy.
- The pull, take and mint refusals move onto nodes first, and `go test ./src/pull/` reads their ids.
- The log carries the failure id, so the retro counts each failure by id.
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

The design stands in [[spec/design_output/failures]]. The group cuts it into slices, and this ticket is the last of them: it moves the refusals onto nodes, and its ask reads the whole.

- The pull's `It` takes a `failure.Registry`, and `it.Refuse(id, rows...)` takes the place of each `it.Say(Refused, ...)`. Each refusal keeps the message it builds, and the door adds the id and the remedies.
- The take's `Doors` takes the registry, and `d.refuse(id, format, args...)` takes the place of each refusal `d.warn` in `src/branches/take.go`.
- The mint verb raises each refusal through the door, and the schema's refusal takes one id.
- `failure new` writes one node a refusal, each with a remedy the message names or implies.
- `Moved` in `src/failure` names the three files, so the check refuses a refusal past the door there.
- The pull cases hand in the fake registry, and read the ids the fake door keeps.

Weighed: messages on the nodes against messages at the site. A message builds off the site's values, so it stays there, and the node holds the id, the level and the remedies.
Assumed: `src/scripts/work.js` stays, since the Go take answers first, and its refusals move with a later slice.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

src/pull/pull.go: every it.Say(Refused, ...)
src/pull/pull_back.go: every it.Say(Refused, ...)
src/pull/pull_bless.go: every it.Say(Refused, ...)
src/pull/pull_branch.go: deskRefused
src/pull/pull_ephemeral.go: every it.Say(Refused, ...)
src/pull/pull_gate.go: the refusal it says
src/pull/pull_writes.go: every it.Say(Refused, ...)
src/branches/take.go: openGroup, take and claimGroup
src/quack/verb_mint.go: mintVerb
src/quack/ticket_doors.go: the doors the pull and the take build, which hand in the registry

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

src/pull/pull_failure_test.go: TestRefusalsNameTheirIds
src/branches/take_failure_test.go: TestTakeRefusalsNameTheirIds
src/quack/verb_mint_failure_test.go: TestMintRefusalsNameTheirIds
src/failure/moved_test.go: TestMovedFilesRefuseThroughTheDoor
./...: go test ./src/pull/
RUNME.sh: ./RUNME.sh check

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

spec/design_output/failures.md
spec/failures/*.md, one node a refusal
src/pull/pull.go
src/pull/pull_back.go
src/pull/pull_bless.go
src/pull/pull_branch.go
src/pull/pull_ephemeral.go
src/pull/pull_gate.go
src/pull/pull_writes.go
src/pull/pull_route.go
src/branches/take.go
src/branches/doors.go
src/quack/verb_mint.go
src/quack/ticket_doors.go
src/failure/moved.go
the four test files above

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

I opened the pull's Say and its refusal sites, the take's warn sites, the mint verb and the log module, and checked each claim there.
The callers come off a grep for `Say(Refused`, `d.warn` in take.go and `Fprint` in verb_mint.go.
Each done_when line names its case, `go test ./src/pull/` or the check, and the earlier slices hold the rest.

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/quack/refusals_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

src/quack/refusals_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The case fails, since the pull, the take and the mint still write each refusal past the door.
The case reading the ids under `go test ./src/pull/` takes the failure package, which an earlier slice adds. So it lands at implement, and the slices ahead decide every other done_when line.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

The refusal line meets a red case here, and the slices ahead hold the node, door, check, sentinel, verb and log lines.
The case reads the tree alone, so no door needs a fake.

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

./RUNME.sh lint

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches the files the size list names, plus src/branches/stands.go and merge.go, which the take reaches through its guards, and src/quack/branch.go, which wires the take's registry
- every door the change reaches has a fake: the pull and the take read failure.Fake in their cases, and failure.Dir has FakeDir
- each file the change touches carries a header line and a link to spec/design_output/failures#the-refusals-move-onto-nodes
- every fact stands in one place: remedies stand on their nodes under spec/failures, the moved places stand in failure.Moved alone

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh branch test src/quack/refusals_test.go

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The red case TestMovedRefusalsPassTheFailureDoor passes: the pull, the take and the mint raise every refusal through failure.Raise with a literal id, and failure.Moved names the three places. go test ./src/pull/ and ./src/branches/ read the ids off failure.Fake, and the bless and mint cases read the line the door prints. Each id stands as a node under spec/failures with a remedy.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches the files the size list names, plus src/branches/stands.go and merge.go, which the take reaches through its guards, and src/quack/branch.go, which wires the take's registry
- every door the change reaches has a fake: the pull and the take read failure.Fake in their cases, and failure.Dir has FakeDir
- each file the change touches carries a header line and a link to spec/design_output/failures#the-refusals-move-onto-nodes
- every fact stands in one place: remedies stand on their nodes under spec/failures, the moved places stand in failure.Moved alone

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

- the-fleet-verb-watches-boxes: `./RUNME.sh cloud fleet` prints a `wake <branch> <why>` line for each idle, stopped or failed box, and exits 1 where one stands. The sentinel takes that over as a watch on a failure node. Until it lands, the verb's lines and exit code carry the wake.
