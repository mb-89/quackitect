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
process: [[spec/processes/standard]]
process_hash: 22b42ea1501e8967
group: failures-stand-registered
depends_on: ["failure-nodes-stand, failure-door-raises"]
step: implement/change
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box 83c32b2b4d58 · claude-code-remote
    hash_before: 3cfe6fbebe40cc66c162824a327f9ddfc87fc2ac
    hash_after: 3cfe6fbebe40cc66c162824a327f9ddfc87fc2ac
    inputs:
      - name: ask
        hash: 8ad39b0f4c3e5a2b
        size: 624
      - name: [[spec/design_output/failures]]
        hash: 8955ba9cf023e089
        size: 4419
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box 83c32b2b4d58 · claude-code-remote
    hash_before: 2c4a0b4d465524ff498603b5c4fcd0997343443b
    hash_after: 2c4a0b4d465524ff498603b5c4fcd0997343443b
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/quack fails
    inputs:
      - name: design/draft
        hash: d0546c92d5536e9c
        size: 2418
      - name: [[spec/design_output/failures]]
        hash: 8955ba9cf023e089
        size: 4419
    def: 08e16d07b0de477c
  - step: gate
    hand: box 83c32b2b4d58 · claude-code-remote · helper-6
    hash_before: 23fa5b8d8a656a731a86b241a137eefd3bdb3be4
    hash_after: 5ff1dcd0126d8157306e4f77cbd96093889c4543
    inputs:
      - name: design/draft
        hash: d0546c92d5536e9c
        size: 2418
      - name: design/tests-red
        hash: 797be04a68e55ea3
        size: 832
      - name: [[spec/design_output/failures]]
        hash: 8955ba9cf023e089
        size: 4419
    def: dc4904ab364efa10
  - step: design/draft
    hand: the engine
    stale: [[spec/design_output/failures]]
  - step: design/tests-red
    hand: the engine
    stale: [[spec/design_output/failures]]
  - step: gate
    hand: the engine
    stale: [[spec/design_output/failures]]
  - step: design/draft
    hand: box 83c32b2b4d58 · claude-code-remote
    hash_before: 65817e9703ba1b2317bbef90d351fe4914677d71
    hash_after: 65817e9703ba1b2317bbef90d351fe4914677d71
    inputs:
      - name: ask
        hash: 8ad39b0f4c3e5a2b
        size: 624
      - name: [[spec/design_output/failures]]
        hash: 8e785cc94e2e32f9
        size: 4503
    def: 7883b3d10633c780
  - step: design/tests-red
    skipped: true
    kept: e9d8483c071e36155534056c8b2d9585613ec702
    why: its red tests stand as e9d8483c0 landed them, and a later leaf passed since
  - step: gate
    hand: box 83c32b2b4d58 · claude-code-remote · helper-10
    hash_before: a79a17ba8769cd411dd36df2477253322c2e93fe
    hash_after: a79a17ba8769cd411dd36df2477253322c2e93fe
    inputs:
      - name: design/draft
        hash: 9e75a7e530f66117
        size: 3889
      - name: design/tests-red
        hash: 797be04a68e55ea3
        size: 832
      - name: [[spec/design_output/failures]]
        hash: 8e785cc94e2e32f9
        size: 4503
    def: dc4904ab364efa10
---

# Ask

An agent raises a failure by verb, registers a failure it meets with no id, and counts the failures the log holds by id, as [[spec/design_output/failures#an-agent-raises-by-verb]] says.

Without it, an agent meeting a fault writes free text, and the retro reads no count by id.

- `go test ./src/quack/` passes a case where failure raise prints the node's lines and writes its row
- `go test ./src/quack/` passes a case where failure new writes the node, and refuses one with no remedy
- `go test ./src/quack/` passes a case where failure count answers each id with its count off the session log
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

[[spec/design_output/failures#an-agent-raises-by-verb]] holds the approach. src/quack/verb_failure.go registers one verb, failure, and reads its subverb off the first word. failureDoors holds the root and the clock, failureHere answers them off index.Root and the wall clock, and failureVerb(doors) answers the twin, so a case hands in a temp root and a fixed now.

- raise <id> [said...] joins the words into one message, raises the id through failure.Raise over failure.Load(failure.Dir{Root}), and prints its Lines. It feeds level, kind and said off Raised.Row into sayLine, the failure id under extra, and appends the line onto the session log through appendsLine. An id no node carries still prints and logs, and answers exitFailed.
- new <id> --level=<level> --remedy=<line>... --when=<line> parses each flag through fieldFlag, writes the node through check.Minted in the shape the failure schema names, and reads it back through failure.NodeOf before pull.OSDisk writes it. It refuses an id off the shape, an id a node carries, a level off logmodule.Ladder, no remedy and no when, each with exitUsage.
- count reads the session file alone, keeps the rows of kind failure.RowKind holding a non-empty failure.IDField, and prints `<count> <id>`, the most first, then by id. A row naming no id counts nowhere, and the rotated files stay out.
- src/modules/verbs/tree.go names the failure row in Commands, so help and the verb tools name it.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/quack/registry.go register, through init in src/quack/verb_failure.go
- src/modules/verbs/tree.go Commands, the row help and the verb tools read
- the agent, which runs failure new, then failure raise, on a fault with no id

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/quack/verb_failure_test.go TestFailureRaisePrintsTheNodesLinesAndWritesItsRow
- src/quack/verb_failure_test.go TestFailureRaiseOfAnUnregisteredIdLogsItAtErrorAndFails
- src/quack/verb_failure_test.go TestFailureNewWritesTheNode
- src/quack/verb_failure_test.go TestFailureNewRefusesANodeWithNoRemedy
- src/quack/verb_failure_test.go TestFailureNewRefusesEachShapeOffTheSchema
- src/quack/verb_failure_test.go TestFailureCountAnswersEachIdWithItsCount

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- failure-verb-in-help: the approach names the Commands row in src/modules/verbs/tree.go, and the fix ticket closed it
- failure-raise-row-off-door: raise feeds level, kind and said off Raised.Row into sayLine, the id under extra, and the fix ticket closed it
- failure-raise-joins-said: raise joins the words into one message before Raise, and the fix ticket closed it
- failure-raise-unregistered-case: TestFailureRaiseOfAnUnregisteredIdLogsItAtErrorAndFails decides the row and the exit, and the fix ticket closed it
- failure-new-shape-once: new writes through check.Minted and parses through fieldFlag, and the fix ticket closed it
- failure-new-refusals-tested: TestFailureNewRefusesEachShapeOffTheSchema decides each refusal, the note names --when, and the fix ticket closed it
- failure-count-skips-no-id: count skips a row with no id and reads the session file alone, and the fix ticket closed it

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/quack/verb_failure.go
- src/quack/verb_failure_test.go
- src/modules/verbs/tree.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- opened src/quack/verb_failure.go, src/quack/verb_mint.go fieldFlag, src/modules/check/export.go Minted and SchemasIn, src/failure/raise.go RowKind, IDField and Row, src/failure/node.go Folder, src/quack/registry.go register and src/modules/verbs/tree.go, and checked each claim there
- the callers list names register, the Commands row and the agent, and a search over src finds no other caller of failureVerb, failureRaises, failureWrites or failureCounts
- raise maps to the two TestFailureRaise cases, new to the two TestFailureNew refusal cases and TestFailureNewWritesTheNode, count to TestFailureCountAnswersEachIdWithItsCount, and ./RUNME.sh check decides the last line

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test src/quack/verb_failure_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/quack/verb_failure_test.go TestFailureRaisePrintsTheNodesLinesAndWritesItsRow
- src/quack/verb_failure_test.go TestFailureNewWritesTheNode
- src/quack/verb_failure_test.go TestFailureNewRefusesANodeWithNoRemedy
- src/quack/verb_failure_test.go TestFailureCountAnswersEachIdWithItsCount

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Each case fails on its own assertion. The stub verb answers exitFailed and prints nothing, so raise, new and count each miss the exit and the text the case names, and the refusal misses exitUsage and its line.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each go test line of the ask meets its case: raise, new and its refusal, and count, and ./RUNME.sh check decides the last
- each case reaches the disk under a temp root and the clock through failureDoors, as the log verb's cases do

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
