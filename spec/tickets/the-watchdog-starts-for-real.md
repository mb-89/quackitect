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
step: design/tests-red
process: [[spec/processes/standard]]
process_hash: 22b42ea1501e8967
group: the-foundation-closes-its-gaps
depends_on: [the-scheduler-runs-providers]
record:
  - step: design/draft
    hand: box d7e2ac6b84cc · claude-code-remote
    hash_before: 09dec5e6bc344458da4622fba6c1423c34bcc14f
    hash_after: 09dec5e6bc344458da4622fba6c1423c34bcc14f
    inputs:
      - name: ask
        hash: 0166fa6e285204cc
        size: 416
    def: 7883b3d10633c780
---

# Ask

The index starts `ops` and the watchdog when it runs for real. The heartbeat comes off the index's own work loop, and `Fault(nil)` answers with no panic.

A watchdog nothing starts watches nothing, so a hung part looks healthy.

- `go test ./...` from the root passes
- a case starts the index and reads its lease renewing off the work loop
- a case calls `Fault(nil)` and reads no panic
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

Serve builds the watchdog over its store, with the writer watchdog.Registers hands back, and the index takes a lease under the part index.
The beat comes off the work loop. A ticker at watchdog.beat pushes a tick into the dirty queue, and each step of sweeps beats the lease before it settles.
So an idle loop beats through the same queue as its work, and a hung loop beats nothing while the ticker runs, per the lease chapter of the model.
Each step then runs Dog.Check, which marks an expired lease stale, and Book.Expire, which fails an operation past its deadline.
Assumption: the ask's start of ops reads as that deadline watch, since Serve opens the book and sweeps it already.
The ticker stops with the stop func Serve answers.
Serve wraps a new serves, which answers the door too, so a case reads the lease through a new Dog.Lease.
Two config keys join the watchdog block: watchdog.beat for the tick and watchdog.lease for the term, in seconds.
Fault answers a nil error with an empty error text in place of a panic.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

src/index/door.go: Serve, which builds the dog and starts the ticker
src/index/door.go: sweeps, which beats, checks and expires on each step
src/watchdog/lease.go: Fault, which takes a nil error
src/watchdog/lease.go: Lease, which a case reads
src/ops/ops.go: Expire, which the loop calls

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

./...: go test ./... from the root
src/index/door_test.go: TestTheIndexLeaseRenewsOffItsWorkLoop
src/watchdog/lease_test.go: TestAFaultWithNoErrorRaisesNoPanic
RUNME.sh: ./RUNME.sh check

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

src/index/door.go
src/index/door_test.go
src/watchdog/lease.go
src/watchdog/lease_test.go
spec/config/level0.json
spec/config/level0.schema.json

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

I opened Serve, sweeps, guards, opensBook, the Dog and Book.Expire, and checked each claim there
I grepped Hold, Beat, Check and Expire across src, and none has a caller past its tests, so the callers list names the new ones
each done_when line names its case, or the command go test or the check

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->

<!-- the form is list -->

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

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
