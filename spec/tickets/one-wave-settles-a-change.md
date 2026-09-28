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
depends_on: [reads-resolve-in-two-passes, the-scheduler-runs-providers]
record:
  - step: design/draft
    hand: box d7e2ac6b84cc · claude-code-remote
    hash_before: e1570ee30e66cb8eaf3f1bd528694a440c99818b
    hash_after: e1570ee30e66cb8eaf3f1bd528694a440c99818b
    inputs:
      - name: ask
        hash: b3163d05e98f7004
        size: 1066
      - name: [[spec/design_output/model]]
        hash: eb315d7a681bc4e4
        size: 74362
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box d7e2ac6b84cc · claude-code-remote
    hash_before: 29b4a748030e83f399fd1cdcae7dc8ec519af5e3
    hash_after: 29b4a748030e83f399fd1cdcae7dc8ec519af5e3
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/q fails
    inputs:
      - name: design/draft
        hash: 1893dad055aa6604
        size: 3020
    def: 08e16d07b0de477c
  - step: design/draft
    hand: the engine
    stale: [[spec/design_output/model]]
  - step: design/draft
    hand: box d7e2ac6b84cc · claude-code-remote
    hash_before: 54ef0f803905268a0f40fdda70865f9f17590f62
    hash_after: 54ef0f803905268a0f40fdda70865f9f17590f62
    inputs:
      - name: ask
        hash: b3163d05e98f7004
        size: 1066
      - name: [[spec/design_output/model]]
        hash: 1717325681c1003e
        size: 74654
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box d7e2ac6b84cc · claude-code-remote
    hash_before: cc7be837a68b4e6f07191b32855a68b5be744cc3
    hash_after: cc7be837a68b4e6f07191b32855a68b5be744cc3
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/q fails
    inputs:
      - name: design/draft
        hash: 1893dad055aa6604
        size: 3020
    def: 08e16d07b0de477c
  - step: gate
    hand: box d7e2ac6b84cc · claude-code-remote · helper-6
    hash_before: 4c9cba807c6eb90227ff466e9bb1c41fbb16f2f4
    hash_after: 4c9cba807c6eb90227ff466e9bb1c41fbb16f2f4
    inputs:
      - name: design/draft
        hash: 1893dad055aa6604
        size: 3020
      - name: design/tests-red
        hash: e03fc55117ad3930
        size: 792
    def: dc4904ab364efa10
  - step: implement/change
    hand: box d7e2ac6b84cc · claude-code-remote
    hash_before: 0dddfe42af05bc349445f8ea12f9717fbb9369e3
    hash_after: 0dddfe42af05bc349445f8ea12f9717fbb9369e3
    answered:
      - name: lint
        exit: 0
        said: ""
    def: f150b8c0dc20fe45
  - step: implement/tests-green
    hand: box d7e2ac6b84cc · claude-code-remote
    hash_before: 2f3b33427bc16a8c82cdff7cd6ad3cba16204fe5
    hash_after: 2f3b33427bc16a8c82cdff7cd6ad3cba16204fe5
    answered:
      - name: tests
        exit: 0
        said: green, src/q passes; green, src/q/qtest passes
      - name: check
        exit: 0
        said: "spec/tickets/the-index-meets-fake-modules.md:306:1: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: design/tests-red
        hash: e03fc55117ad3930
        size: 792
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

The start gives every module a height, and a name builds its run list the first time it changes. A change settles as one wave, per [[spec/design_output/model#one-wave-settles-a-change]]. Early cutoff and demand stand, and `quack why` names a value a wave holds as `pending since r`.

A module fed twice by one change then runs once, off inputs of one settled state. A reader sees no half-settled mix. A read waits on nothing, except the read of an unwatched pending name, which waits for its run and for no write.

- `go test ./...` from the root passes
- a `qtest` case runs the diamond X, A and B, and reads B run once, after A
- a `qtest` case commits X during a wave, and reads the change wait for the next wave
- a case changes a name twice, and reads the second wave reuse the kept list
- a case commits a value equal to the old one, and reads no run and no push below it
- a case leaves a pending name unwatched, and reads it run only when a reader asks
- a case reads `quack why` answer `pending since r` for a value a wave holds
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

The scheduler in src/q/scheduler.go settles each change as one wave, per the wave chapter of the model, in place of its mark a provider.
At start it gives each derived provider a height: 0 with no input, else one past the highest height among the owners of its inputs. A given stands at 0. The cycle fault of the catalog check refuses a start where no height stands.
The first time an owner moves, it builds that owner's run list, every derived provider downstream sorted by height, and keeps it while the process lives.
A commit from outside a wave marks the run lists of its moved owners pending at its revision, and starts a wave where none runs. A commit during a wave joins the next one.
The wave runs lowest height first. A provider runs where an input owner moves in this wave, and clears where none does, which is early cutoff.
The store gains a quiet run for the wave: it computes the value, compares the hash of its JSON form to the old one, and commits where it moves, with no hand heard. The wave then pushes once, through the hands OnCommit holds.
A commit from outside reaches the scheduler through a hook of its own on the store, with the names whose JSON form moves, so an equal value starts no wave.
Demand: every name starts watched. Unwatch drops one, and a provider stays watched while a watched provider stands below it. A wave skips an unwatched provider and keeps it pending, and Scheduler.Read runs its pending upstream and then it, waiting for no write.
Why reads a hook the scheduler sets on the store, and answers pending since r for a value a wave holds.
qtest builds a scheduler whose spawn runs in place, so a seed settles its wave before it answers.
A keyed family stays out of the waves, as the scheduler keeps it today.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

src/q/scheduler.go: NewScheduler, kick, runs and Settle, which the waves replace
src/q/store.go: Commit and Run, which gain the quiet run and the move hook
src/q/why.go: Why, which reads the pending hook
src/q/qtest/qtest.go: New and Over, which build the scheduler
src/index/door.go: Serve, which builds the scheduler as it does

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

./...: go test ./... from the root
src/q/qtest/wave_test.go: TestTheDiamondRunsBOnceAfterA
src/q/qtest/wave_test.go: TestAChangeDuringAWaveWaitsForTheNext
src/q/scheduler_test.go: TestASecondChangeReusesTheKeptList
src/q/scheduler_test.go: TestAnEqualCommitRunsNothingBelow
src/q/scheduler_test.go: TestAnUnwatchedPendingNameRunsWhenRead
src/q/scheduler_test.go: TestWhyNamesAPendingValue
RUNME.sh: ./RUNME.sh check

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

src/q/scheduler.go
src/q/scheduler_test.go
src/q/store.go
src/q/why.go
src/q/qtest/qtest.go
src/q/qtest/wave_test.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

I opened the scheduler, Store.Commit, Store.Run, OnCommit, Why, qtest.New and Over, and the cycle walk, and checked each claim there
I grepped every caller of NewScheduler, OnCommit and Run, and the callers list names each the change touches
each done_when line names its case, or the command go test or the check

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/q/scheduler_test.go src/q/qtest/wave_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

src/q/scheduler_test.go
src/q/qtest/wave_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The four scheduler cases fail on their own assertion: the stubs keep no list, an equal commit runs again, an unwatched name runs with no reader, and why reads no pending. The two qtest cases read B never run, since the fake index builds no scheduler. The surprise: the change during a wave needs the provider to seed the fake index from inside its run, so the case holds the index in a variable the run closes over.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

each done_when line meets a red case in scheduler_test.go or wave_test.go, and the commands decide the rest
the cases run over a catalog and a store in memory, and the fake index, so no door stands unfaked

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept
- src/q/qtest/suite.go: the case commits read every commit of the run seeds cfg/width and then runs t/wide by hand. Once New and Over build a scheduler, the wave runs t/wide on the seed and pushes it, so the hand run adds one more commit, and qtest_test.go and TestTheIndexKeepsTheContract in src/index/contract_test.go go red. The callers list and the size leave suite.go out, and the builder rewrites that case in place
- src/index/door.go: Serve keeps scheduler.Settle as its drains and calls scheduler.Stop at the stop, and the cases call Settle too, so the waves keep both where the callers line says they replace them
- src/q/scheduler_test.go: TestAnEqualCommitRunsNothingBelow reads the runs alone, and the ask names no push below it too, so the builder adds a counting hand on OnCommit to the case
- src/q/scheduler_test.go: TestWhyNamesAPendingValue reads State and Pending, and the ask names the text pending since r, which lines writes as a time today, so the builder adds a read of said.Text

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

    go vet ./src/...

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

The change stays inside the draft's size list, and the gate's first point adds src/q/qtest/suite.go, whose case now reads the seed and the wave it settles.
The store, the scheduler and the fake index stand in memory, and go test with the race detector over src/q reads no race.
The scheduler's comments name the wave, the early cutoff, the view a wave reads and the demand, each with a link to the wave chapter of the model.
The gate's second point holds: Settle and Stop stand, and the door calls them as before. The third and fourth points land in the equal-commit case, which counts the pushes, and in the why case, which reads the text.

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

    ./RUNME.sh branch test src/q/scheduler_test.go src/q/qtest/wave_test.go src/q/qtest/qtest_test.go

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The scheduler settles each change as one wave.
At start each derived provider takes a height, one past the highest among the owners of its inputs. An owner's run list is built on its first move and kept after.
A commit from outside names the values whose JSON form moves, so an equal commit starts nothing. A commit during a wave joins the next one.
A wave runs lowest height first, over the snapshot it started from plus the values it settles. A provider whose inputs all stand still clears. The wave commits quietly and pushes once.
An unwatched provider with no watched provider below it stays pending, and Scheduler.Read runs its pending upstream and then it. Why names such a value pending since r, with the revision.
The fake index builds a scheduler whose spawn runs in place, so a seed settles its wave before it answers. The suite's commits case reads the seed and the wave.
go test over the root still shows the red cases of the config, catalog and fake-module tickets, whose red lists hold their files.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

The change stays inside the draft's size list and the gate's added suite.go, plus one case in qtest_test.go for the fake's own wave.
Everything stands in memory, and no door takes part.
The comments link the wave chapter of the model.
The wave's rules stand once, in that chapter, and the code points at it.

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
