---
kind: [[ticket]]
state: open
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
group: examples-run-as-tests
depends_on: ["example-schema-reads-steps"]
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box 42197a224bb7 · claude-code-remote
    hash_before: 410e7ae2ec804367dee3ada6e689802373a2fb60
    hash_after: 410e7ae2ec804367dee3ada6e689802373a2fb60
    inputs:
      - name: ask
        hash: afba7a969ff67496
        size: 759
      - name: [[spec/design_output/examples]]
        hash: 5245c4fe35ade37e
        size: 8237
    def: c01ae0f2ace0cecb
  - step: design/tests-red
    hand: box 42197a224bb7 · claude-code-remote
    hash_before: 96cf9c303a0ac49a9c1de4f204ce84b040aff14d
    hash_after: 96cf9c303a0ac49a9c1de4f204ce84b040aff14d
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/example fails
    inputs:
      - name: design/draft
        hash: bcee0b043437dbd6
        size: 2740
    def: 08e16d07b0de477c
  - step: gate
    hand: box 42197a224bb7 · claude-code-remote · helper-4
    hash_before: e47b4bf21e49c4391efc22b0d4cce9c4e0e604eb
    hash_after: e47b4bf21e49c4391efc22b0d4cce9c4e0e604eb
    inputs:
      - name: design/draft
        hash: bcee0b043437dbd6
        size: 2740
      - name: design/tests-red
        hash: 4083b33505207200
        size: 893
    def: dc4904ab364efa10
  - step: implement/change
    hand: box 23ee163eaf36 · claude-code-remote
    hash_before: 4e0c0887abe9a332a6c3b5be2f7555d26bd95827
    hash_after: 7a34c8a1dcf79a187cd8c3990479800965cf652f
    answered:
      - name: lint
        exit: 0
        said: ""
    def: f150b8c0dc20fe45
---

# Ask

Every example runs inside the check over one fixture tree and the doors' fakes, so a broken tutorial is a red check. [[spec/design_output/examples#one-runner-two-drivers]]

The examples drift from the tree unread, and the tutorial teaches behavior the verbs no longer have.

- one Go harness builds the fixture tree once in the fixture home, and runs each example over its own copy, beside every other
- the harness dispatches each call through the action catalog in process, with git, the clock, the process and the model faked
- a planted example with a false expect line fails the harness, naming the file, the step and the line
- the harness writes each verdict to `.se/.runtime/examples.json`
- `./RUNME.sh check` runs the harness and exits 0

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

The harness stands in `src/quack`, where every verb's constructor lives, as `examples_test.go`.

- The existing `TestMain` in `split_test.go` builds the fixture folder once: the tree's `spec/schemas`, `spec/processes`, `spec/config` and a planted group of tickets. No example writes to it.
- Each example runs as a parallel subtest over its own copy of that folder. A `git.FakeRepo` over `files.NewDisk` of the copy commits it whole, and `caseNow` stands for the clock.
- The harness builds a twin table per case off each verb's constructor, such as `ticketPull(rootOf, repoAt)`, with the root and the repo pointed at the copy. A call reaching a verb outside the table fails, naming the verb, so no example reaches the real git, process or model. The table starts with the ticket and mint verbs, and a verb joins it once its constructor takes every door it reaches.
- `src/example` gains `Holds(expect, Outcome, read)`, the one evaluator of an expect line over an exit code, an output and a file read. The run verb reuses it.
- A miss names the file, the step's number and the expect line, as `<path>: step <n>, line <l>: <what it wants>, and <what it got>`.
- The parent test's cleanup writes every verdict to `.se/.runtime/examples.json` at the tree root, keyed by path, with `pass` or `fail` and the miss. `src/example` names the file once, as `VerdictFile`.

The disk stays a real temporary folder, since the ticket verbs read their root in place. The fake disk waits on those verbs taking a disk door, and the harness switches over once they do.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/quack/split_test.go TestMain, which builds the fixture folder
- src/quack/ticket_pull.go ticketPull, which the twin table calls
- src/quack/ticket_note.go ticketNote, which the twin table calls
- src/quack/verb_mint.go mintVerb, which the twin table calls

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/example/expect_test.go TestEachExpectFormHoldsOverAnOutcome
- src/quack/examples_test.go TestEveryExampleHoldsItsSteps
- src/quack/examples_test.go TestAFalseExpectNamesTheFileTheStepAndTheLine
- src/quack/examples_test.go TestTheVerdictsLandInTheRuntimeFile

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/example/expect.go
- src/example/expect_test.go
- src/quack/examples_test.go
- src/quack/split_test.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every function named stands opened: ticketPull, ticketNote, mintVerb, standsInRepo, caseNow, git.NewFakeRepo, files.NewDisk, TestMain in split_test.go
- the callers list names each constructor the twin table calls and the TestMain it extends
- each done_when line names its test: the fixture and the dispatch in TestEveryExampleHoldsItsSteps, the planted miss and the verdict file in their own cases, and the check run itself
- the approach adds no config key

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/example/expect_test.go
- src/quack/examples_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The registry twin of ticket pull reaches time.Now, proc.Real and the live index through pullHere. So the harness builds a pull.It over files.FakeDisk, a FakeRepo clone, a FakeRunner and a fixed clock, as the pull tests build theirs. That meets the fake disk the ask names, which the draft deferred. The method root stays the tree itself, read for its schemas alone. The harness lives in examples_harness_test.go, so it counts as test code of quack.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each done_when line meets a red case: the fixture and the planted pull, the false expect naming file, step and line, the verdict file, and the check at the end
- every door the tests reach has a fake: the disk, git, the process table and the clock, and the model stays out, since no verb in the table reaches it

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- harness-draft-follows-seen: the draft approach keeps a real temporary folder and its size list leaves out src/quack/examples_harness_test.go, while tests-red moves the harness onto files.FakeDisk in that file; the builder follows seen and brings the approach and size in line
- harness-fakes-the-model: the ask names the model faked, and seen leaves it out because no verb in the table reaches it; the builder adds a case where a verb reaching the model misses as outside the table, or answers it through the fake process table
- harness-copies-stand-apart: no red test shows each example runs over its own copy; the builder adds a case where one example's write stays unseen by another run beside it
- harness-meets-a-real-example: spec/examples stands absent, so TestEveryExampleHoldsItsSteps runs no subtest and passes empty, and the check line rests on the tests-green check command alone; the first example lands with the group before the accept reads the check

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

go vet ./src/quack/ ./src/example/

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches the files the size list and the Discussion name, and the pull and note verbs and ticket_doors.go, which the callers list names through ticketPull and ticketNote
- every door has a fake: the disk is files.FakeDisk, git a FakeRepo clone, the process a FakeRunner, the clock fixed, and a verb reaching the model stays outside the table
- the comment on src/quack/examples_harness_test.go names the approach, and links the design
- every fact stands once: Holds is the one evaluator, VerdictFile names the file, and pullOver is the one seam the verbs take

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

The draft follows seen, and this line holds over the approach where the two part:

- the disk: the harness builds a `pull.It` over `files.FakeDisk`, a `FakeRepo` clone, a `FakeRunner` and a fixed clock, as the pull tests build theirs, and no real temporary folder
- the size: `src/quack/examples_harness_test.go` joins the list, and holds the harness as test code of quack
- the copy: `TestEachExampleWritesOverItsOwnCopy` in `src/quack/examples_test.go` holds each example to its own copy of the fixture
