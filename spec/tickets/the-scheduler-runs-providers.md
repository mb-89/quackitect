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
step: implement/tests-green
process: [[spec/processes/standard]]
process_hash: 22b42ea1501e8967
group: the-foundation-closes-its-gaps
depends_on: [reads-resolve-in-two-passes]
record:
  - step: design/draft
    hand: box d7e1c5ea2bd1 · claude-code-remote
    hash_before: 0b3fd114a82d34479ba1eef1f81a91d6459c8e49
    hash_after: 0b3fd114a82d34479ba1eef1f81a91d6459c8e49
    inputs:
      - name: ask
        hash: 3e36a5346f801c9a
        size: 522
      - name: [[spec/design_output/model]]
        hash: eb315d7a681bc4e4
        size: 74362
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box d7e1c5ea2bd1 · claude-code-remote
    hash_before: d82d3556976bce8e73c1b274a23f82fdb8c413c8
    hash_after: d82d3556976bce8e73c1b274a23f82fdb8c413c8
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/q fails
    inputs:
      - name: design/draft
        hash: eee784babc19ef92
        size: 2192
    def: 08e16d07b0de477c
  - step: gate
    hand: box d7e1c5ea2bd1 · claude-code-remote · helper-3
    hash_before: 0d06619dbd6f9236e6b1c5eaa21caa473e482e0a
    hash_after: 0d06619dbd6f9236e6b1c5eaa21caa473e482e0a
    inputs:
      - name: design/draft
        hash: eee784babc19ef92
        size: 2192
      - name: design/tests-red
        hash: dda7a3cac8ec23ec
        size: 714
    def: dc4904ab364efa10
  - step: implement/change
    hand: box d7e2ac6b84cc · claude-code-remote
    hash_before: 380b9dca127a94b130c589ef9d42e2de5b954da1
    hash_after: 380b9dca127a94b130c589ef9d42e2de5b954da1
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
    def: f150b8c0dc20fe45
  - step: implement/tests-green
    hand: box d7e2ac6b84cc · claude-code-remote
    hash_before: d58b4c54229fcc738e36ef9d2760a938cae8b975
    hash_after: d58b4c54229fcc738e36ef9d2760a938cae8b975
    answered:
      - name: tests
        exit: 0
        said: green, src/q passes
      - name: check
        exit: 0
        said: "src/q/qtest/suite.go:75:48: MagicNumber: 6 carries a meaning here. Name it in the constants block at the top of this fil"
    inputs:
      - name: design/tests-red
        hash: dda7a3cac8ec23ec
        size: 714
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

The index runs a derived provider when an input moves, and keeps one run pending while one runs. It runs no provider twice at once, per [[spec/design_output/model#the-provider-kinds]].

Nothing runs a provider today when its input moves, so a value stands at its built-in value until a caller runs it by hand.

- `go test ./...` from the root passes
- a case moves an input and reads the provider's new value
- a case moves an input twice during a run, and reads one pending run and no overlap
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

A new `Scheduler` in `src/q/scheduler.go` runs a derived provider when a name it reads moves.
`NewScheduler(s *Store, spawn func(func()), failed func(name string, err error))` hears every commit through `Store.OnCommit`.
`spawn` starts a run, so the index hands it a goroutine and a case hands it one it controls, per rule 8 of the testing guidance.
On a commit, `moved` names every active derived provider with an input whose owner is the owner of a moved name.
`kick` starts a run of each, through `spawn`, where none runs. Where one runs, it marks the provider pending, and a second move during the run keeps the one mark.
The run loop calls `Store.Run`, then runs once more while the mark stands, and clears the running flag after the last run.
So a provider never runs twice at once, and a burst during a run leaves one pending run.
`Settle()` blocks until no provider runs or waits, which a case and the index read.
A run that errs reaches `failed` with the provider name.
`Serve` in `src/index/door.go` builds the scheduler over its store, with `go` as spawn and a hand that writes the error to the log.
Assumption: a derived family provider, keyed by a `<key>`, stays out, since `Store.Run` takes a concrete name. The wave ticket `one-wave-settles-a-change` owns heights, run lists and cutoff.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

src/q/store.go: OnCommit, which the scheduler joins
src/q/store.go: Run, which the run loop calls
src/index/door.go: Serve, which builds the scheduler

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

./...: `go test ./...` from the root
src/q/scheduler_test.go: TestAMovedInputRunsItsProvider
src/q/scheduler_test.go: TestTwoMovesDuringARunLeaveOnePendingRunAndNoOverlap
RUNME.sh: `./RUNME.sh check`

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

src/q/scheduler.go
src/q/scheduler_test.go
src/index/door.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

I opened `Store.Run`, `Store.OnCommit`, `Store.commit`, `Store.owner`, `Serve` and the sweep loop of the index door, and checked each claim there
I grepped every caller of `NewStore`, `OnCommit` and `Run` across `src`, and the callers list names each the change touches
each done_when line names its test in `src/q/scheduler_test.go`, or the command `go test ./...` or `./RUNME.sh check`

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/q/scheduler_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

src/q/scheduler_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Both cases fail on their own assertion over the stub. The stub scheduler hears no commit, so `t/double` stays at its built-in value, and no run of `t/slow` starts within the wait. The surprise: `seed` in the wiring cases commits through `Store.Commit`, so the scheduler hears a case seed as it hears a real move.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

each done_when line meets a case: the moved input and the burst during a run each have one in `src/q/scheduler_test.go`, and the commands decide the rest
the cases run over a catalog and a store in memory, and the spawn hand stands in for the run thread, so no door stands unfaked

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

pass
- the draft says a case hands spawn a run it controls, and both cases hand it `go run()`: the builder aligns the approach line or the cases in place
- Settle has to count a run from the kick, before spawn starts it, or it answers before a `go` run begins: the builder holds that in the run loop
- a derived provider reading its own output, or a cycle of two, reruns without end under the run loop: the builder names the catalog check that refuses it, or leaves it to one-wave-settles-a-change
- Serve starts the scheduler with no stop, so a run goroutine outlives the door: the builder ties it to the stop func Serve answers

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh lint src/q/scheduler.go src/index/door.go src/q/scheduler_test.go src/index/door_test.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change touches the scheduler, the Serve wiring, and a case beside each
the scheduler reaches no door, since spawn is a hand the caller passes, and Serve hands it go and the door stderr
scheduler.go carries a header naming the provider kinds and this ticket, and each function points at its design section
the scheduler reuses the catalog key test and owner lookup, so no catalog rule stands twice. The gate points land in Settle, kick, the catalog Cycle fault and the Serve stop

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh branch test src/q/scheduler_test.go

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

A derived provider now runs when a name it reads moves. The new Scheduler in src/q hears every commit, and starts a run of each provider reading a moved owner. A move during a run leaves one pending run, so a provider never runs twice at once. Serve builds the scheduler over its store, and its stop stops it. A family keyed by a key segment waits on one-wave-settles-a-change.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change touches the scheduler, the Serve wiring, and a case beside each
the scheduler reaches no door, since spawn is a hand the caller passes
scheduler.go and the Serve lines point at the provider kinds section
the rules of the catalog stand in check.go and q.go alone, and the scheduler calls them

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
