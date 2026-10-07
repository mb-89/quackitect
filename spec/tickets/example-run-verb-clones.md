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
    hash_before: c228f0b29d9b35421dbc4e6e5e7380f2afefc34b
    hash_after: c228f0b29d9b35421dbc4e6e5e7380f2afefc34b
    inputs:
      - name: ask
        hash: 6c68752c49fe8075
        size: 667
      - name: [[spec/design_output/examples]]
        hash: 5245c4fe35ade37e
        size: 8237
    def: c01ae0f2ace0cecb
  - step: design/tests-red
    hand: box 42197a224bb7 · claude-code-remote
    hash_before: fb04502049b3d0cbb6984fcf94a934ee0106cb33
    hash_after: fb04502049b3d0cbb6984fcf94a934ee0106cb33
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/quack fails
    inputs:
      - name: design/draft
        hash: 38bc371b8dffa4b7
        size: 2120
    def: 08e16d07b0de477c
  - step: gate
    hand: box 23ee163eaf36 · claude-code-remote
    hash_before: 1e361f08e8892feef759ea2a9838c12fde27746b
    hash_after: 1e361f08e8892feef759ea2a9838c12fde27746b
    inputs:
      - name: design/draft
        hash: 38bc371b8dffa4b7
        size: 2120
      - name: design/tests-red
        hash: 38211288a03a4098
        size: 763
    def: dc4904ab364efa10
  - step: implement/change
    hand: box 23ee163eaf36 · claude-code-remote
    hash_before: a5e24345266e2fca8d4b4572312f700e5f5613b9
    hash_after: fe1a5bddc28da44802095932a63755d1de3b31e3
    answered:
      - name: lint
        exit: 0
        said: ""
    def: f150b8c0dc20fe45
---

# Ask

A user runs an example against the real system and watches it, with the tree they work in left as it stands. [[spec/design_output/examples#one-runner-two-drivers]]

A user learns a verb only by running it on their own tree, and a tutorial step changes their tickets.

- `./RUNME.sh example run <path>` clones the tree into `.se/.runtime/examples/<name>` and runs each step there, detached in its own process
- the run prints each step's prose, its call, the output and each expect verdict
- a case proves the user's tree stands byte for byte after a run
- `./RUNME.sh check` exits 0

the owner runs an example from the command line and reads each step's verdict

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

A new verb file `src/quack/example_verb.go` registers `example` whole, as `ticket` stands, so `wholeOf` routes it to Go under every mode. `example run <path>` takes these steps:

1. It reads the file under the root, and `example.Read` parses it. A fault exits 1, naming the line.
2. It clears `.se/.runtime/examples/<name>`, where the name is the file's base, and clones the tree there with `git clone --local` through the process door.
3. Each step runs in its own process, `./RUNME.sh <words>` with the clone as its folder. The verb prints the step's prose, the call, the output and one line per expect line. The verdict comes from `example.Holds`, which reads files under the clone. That evaluator is the harness ticket's, so both drivers judge alike.
4. The run exits 1 where any expect misses, and 0 otherwise. The clone stays for the user to read.

The verb takes its root and its runner as arguments: `exampleVerb(index.Root, proc.Real)`. A case hands it a temporary root and a `FakeRunner` whose `git` copies the tree and whose `./RUNME.sh` answers by its words.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/quack/registry.go register, which takes the verb at init
- src/quack/verbs.go wholeOf and verbs, which route example to Go

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/quack/example_verb_test.go TestARunPrintsEachStepAndItsVerdicts
- src/quack/example_verb_test.go TestARunLeavesTheUsersTreeByteForByte
- src/quack/example_verb_test.go TestAMissExitsOneAndASecondRunClearsTheClone

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/quack/example_verb.go
- src/quack/example_verb_test.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every function named stands opened: register and goAnswer in registry.go, twinOf, roadOf and wholeOf in verbs.go, ticketUsageVerb as the whole-word model, proc.Command, proc.Runner and proc.FakeRunner, and example.Read with the Holds the harness ticket adds
- the callers list names the registry and the road, the one way a verb is reached
- each done_when line names its test: the clone and the detached steps, the printed prose, call, output and verdicts, the tree left byte for byte, and the check run itself
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

- src/quack/example_verb_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The byte-for-byte case passes over the stub, since a verb doing nothing leaves the tree whole. It holds the real verb once the change lands, and the two other cases stand red on their own assertions. The fake box clones by copying the tree, and its ./RUNME.sh writes a ticket into the folder it runs in, so a write landing outside the clone shows.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each done_when line meets a case: the clone and the step in it, the printed prose, call, output and verdicts, the tree byte for byte, and the check at the end
- every door the tests reach has a fake: the process through FakeRunner, and the disk is the case temporary folder, as the ticket verb cases hold it

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- example-run-pauses-between-steps: the owner says an interactive run shows each command before it runs and pauses between steps until the user presses Enter, and the approach runs every step straight through; the builder prints the call before it runs, waits on a line of input between steps, runs straight through where the input is no terminal, and adds a case feeding the input

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

go vet ./src/quack/

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches the files the size list names: example_verb.go and example_verb_test.go
- every door has a fake: the process through FakeRunner, the disk a case temporary folder, and the pause an argument the case records
- the comment on src/quack/example_verb.go names the approach, and links the design
- every fact stands once: example.Holds judges each expect line, as the harness does

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
