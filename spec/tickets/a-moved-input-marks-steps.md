---
kind: [[ticket]]
state: closed
steps:
  - name: design
    reads: [[spec/guidance/voice]]
    steps:
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
      - name: review
        does: reads the approach against the ask
        not: draft
        on_fail: draft
        reads: [[spec/guidance/review/design]]
        input: design/draft
        evidence:
          - name: verdict
            form: verdict
            says: pass, pass with findings naming a child a line, or fail with findings one a line
  - name: implement
    reads: [[spec/guidance/code/testing]]
    needs: ["branch test"]
    input: ["design/draft", "design/review"]
    checklist: ["the change touches no file the ask leaves out", "every door the change reaches has a fake", "a comment names the approach the change implements", "every fact the change adds stands in one place, and a note points at the file instead of repeating it", "every row the design review passes with stands fixed in the change"]
    steps:
      - name: tests-red
        does: writes the tests the ask calls for
        evidence:
          - name: tests
            form: command
            expects: assertion
            says: the tests you write fail on their own assertion
          - name: seen
            form: text
            says: what you see, and what surprises you
      - name: change
        does: makes the change
        reads: [[spec/guidance/code/code]]
        evidence:
          - name: lint
            form: command
            expects: 0
            says: the tree builds and lints
      - name: tests-green
        does: makes the tests pass
        input: tests-red
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
process: [[spec/processes/standard]]
process_hash: 9d870e3fd3c577a6
group: the-process-stays-editable
step: implement/tests-green
record:
  - step: design/draft
    hand: box d7d8cca563b1 · claude-code-remote
    hash_before: 37121f76c6fc6552e82d6eeb72f418a6a6bf03ed
    hash_after: 37121f76c6fc6552e82d6eeb72f418a6a6bf03ed
  - step: design/review
    hand: box d7d9b0d5dfcf · claude-code-remote
    hash_before: faad7c206edabd9c8a3d276f9671f9e12f3eebd8
    hash_after: faad7c206edabd9c8a3d276f9671f9e12f3eebd8
  - step: implement/tests-red
    hand: box d7d9b0d5dfcf · claude-code-remote
    hash_before: 660f728105f49c6e69ce32872b0bcc88cedea573
    hash_after: 660f728105f49c6e69ce32872b0bcc88cedea573
    answered:
      - name: tests
        exit: 1
        said: assertion, 5 test(s) fail on their own assertion
  - step: implement/change
    hand: box d7d9b0d5dfcf · claude-code-remote
    hash_before: 5cddadd94c9ce6ba4beba59743e65871cc655c85
    hash_after: 5684a6d831ca4664cc9db8cfd8c301227d29e94f
    answered:
      - name: lint
        exit: 0
        said: "spec/tickets/the-retro-reads-the-backlog.md:145:1: Sentence: A sentence holds 25 words. Cut this one in two."
    def: 21d63335f32dfcda
  - step: implement/tests-green
    hand: box d7d9b0d5dfcf · claude-code-remote
    hash_before: 9858b4b7b1cf2b0389ae530371db3f363f75c486
    hash_after: e84a5158d681f84aab41f200d30c19f11795577d
    answered:
      - name: tests
        exit: 0
        said: green, 9 test(s) pass in 1 file(s); green, src/index passes
      - name: check
        exit: 0
        said: "test/level0/pull-stale.test.js:322:37: Modal: This register holds the modals can, must, will. Say what is, or name the o"
    inputs:
      - name: implement/tests-red
        hash: ea622bb3399ff93c
        size: 1017
    def: a27db29c1d1562f2
reason: done
---

# Ask

A moved input marks exactly the steps that read it, and a process stays editable while it runs. [[spec/design_input/level-two]] asks it in its chapter Evidence and stale steps.

Today a changed input leaves every step that read it standing as done, and a route edit reaches a ticket through `ticket update` alone.

- the ticket file holds the hash of each input and of each step definition. The engine asks the index for them. A case under `test/level0` decides it
- a moved input marks exactly the steps whose checks read it. A case under `test/level0` decides it
- an append moves the hash of a node on, and the steps reading it stay whole. A case under `test/level0` decides it
- an edit downstream of the step in hand keeps the earlier steps. An edit upstream sends the process back to the last whole step. A case under `test/level0` decides it
- `./RUNME.sh check` exits 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->
<!-- the form is text -->

For details, see [[spec/design_output/pull#an-input-marks-its-steps]].

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

src/scripts/pull-writes.js passed, which writes inputs and def into the record entry,src/scripts/pull-hand.js handOut, which runs the stale read before it takes a leaf,src/scripts/pull.js pull, which reaches handOut,src/scripts/ticket.js update and updated, which the process edit reuses,src/doors/index.js ask, which gains the hashes method,src/index/door.go the method switch, which gains hashes,spec/schemas/ticket.schema.yaml the record entry, which gains inputs, def and stale

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

test/level0/pull-stale.test.js a passed leaf records the hash of each input and of its definition,test/level0/pull-stale.test.js a note input takes its hash from the index,test/level0/pull-stale.test.js a moved input marks exactly the leaves reading it,test/level0/pull-stale.test.js an append to an input keeps the leaves reading it whole,test/level0/pull-stale.test.js a process edit past the step keeps the earlier leaves,test/level0/pull-stale.test.js a process edit before the step sends it back to the last whole leaf,src/index/files_test.go TestHashesAnswersTheHashOfEachPath

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

first

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

processAt, updated, reachedOf, handOut, the index door and Files stand opened, and each claim checked there
the callers list names each function the stale read and the record fields change
each done_when line maps to a pull-stale case: hashes, marks, append, edit

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass, pass with findings naming a child a line, or fail with findings one a line -->
<!-- the form is verdict -->

pass with findings
- stale-shares-the-bless-hash: hashText in src/scripts/pull-bless.js hashes a chapter for the bless already, so the stale read takes its chapter hash from one function both modules import
- stale-fields-reach-test-schema: SCHEMA in test/level0/pull-schema.js copies the record shape of the ticket schema, so inputs, def and stale land there beside spec/schemas/ticket.schema.yaml

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test test/level0/pull-stale.test.js src/index

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

- Five engine cases and the Go case fail on their own assertion, and the append case passes against the stub, because it guards against a mark.
- The input schema admits ask, diff and an earlier step, and no note link. A note link inside an input chapter counts as an input node, and the index hashes it.
- The front writer drops an empty list, so the def field marks an entry the stale read reads.
- The CLI doors hold no index, so cli-doors.js gains one.
- A fake index behaves over the fake disk, so a moved note moves its hash.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the tests touch the files the draft names, plus the fake index
every door the tests reach runs on a fake, and the index takes one in src/doors/fake/index.js
the header of each new file links the design section
the hash stands once in hash.js, and the Go side ports it with a case pinning both to one value
the two review rows meet the change: the bless hash and the test schema copy

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh check

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change touches the files the draft callers name, plus cli-doors.js for the index door, the fake index, and the bless module the review row names
the index takes a fake in src/doors/fake/index.js, and the Go door takes a case over the real method
each new function carries a pointer at the design section on inputs
the hash stands once in hash.js, and the Go port names its constants beside a pointer at that file
both review rows stand fixed: the bless reads chapterText from pull-stale.js, and the test schema copy carries inputs, def, stale and blessed

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh branch test test/level0/pull-stale.test.js src/index

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

A passed leaf now records the hash and size of each input it reads, the hash of each note an input chapter links, and the hash of its own definition. The index answers a hashes method, which ports hashText to Go so both sides agree. Before a hand-out the pull reads each passed leaf again. An input whose text no longer opens with the text its hash read marks the leaf stale, naming the input, and the first stale leaf takes the step. An append keeps the leaf whole, because only the head the hash read counts. A process whose hash moves gives the ticket its new route where the step and every recorded leaf stand in it: an edit past the step copies onto the leaves ahead, and an edit at or before the step sends the step to the first leaf whose definition moves. A route that strands a recorded leaf waits for ticket update. The bless reads its chapters through the same chapterText, and the record schema admits blessed, stale, def and inputs.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change touches the files the draft names, plus the index door on the CLI hand and the fake index
every door the cases reach runs on a fake, and the Go door takes its own case
each new function points at the design section on inputs
the hash stands once in hash.js, and the Go port points at it
both review rows stand fixed

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

The split of the-engine-holds-the-route leaves one line of [[spec/design_input/level-two#gates]] to this ticket. The commit of a gate counts as the output of the gate, and moves no input of the phase it closes.
