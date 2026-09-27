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
group: the-engine-holds-the-route
step: implement/tests-green
record:
  - step: design/draft
    hand: box d7d6cb0fb1105 · claude-code-remote
    hash_before: e62c46fa9c1ce125d64867fb5b4f7989d4af09ea
    hash_after: e62c46fa9c1ce125d64867fb5b4f7989d4af09ea
  - step: design/review
    hand: box d7d809305dcf · claude-code-remote
    hash_before: 93de6ad203c16d608808bfe7316f782346ecc4d3
    hash_after: 93de6ad203c16d608808bfe7316f782346ecc4d3
  - step: implement/tests-red
    hand: box d7d809305dcf · claude-code-remote
    hash_before: 68816f0d90e9ccc32bb563eef721bc924733b903
    hash_after: 68816f0d90e9ccc32bb563eef721bc924733b903
    answered:
      - name: tests
        exit: 1
        said: assertion, 4 test(s) fail on their own assertion
  - step: implement/change
    hand: box d7d809305dcf · claude-code-remote
    hash_before: d77b4471fd3a216a3112039b8c9c2f2df499bac0
    hash_after: ce28196ea03894b0d0f8384333989f9d5df0a1b2
    answered:
      - name: lint
        exit: 0
        said: "spec/tickets/the-queue-moves-to-plan.md:121:99: Sentence: A sentence holds 25 words. Cut this one in two."
  - step: implement/tests-green
    hand: box d7d809305dcf · claude-code-remote
    hash_before: 6894ad0411ed02fe3ab8b45a5d25c0d4aab12e58
    hash_after: 6894ad0411ed02fe3ab8b45a5d25c0d4aab12e58
    answered:
      - name: tests
        exit: 0
        said: green, 8 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/the-queue-moves-to-plan.md:121:99: Sentence: A sentence holds 25 words. Cut this one in two."
reason: done
---

# Ask

One acceptance at the top reads the whole work and every prose criterion under it, and the process closes on its verdict. [[spec/design_input/level-two]] asks it in its chapter The final acceptance.

Today a process closes on the claim of its last hand, and a prose criterion stays unread.

- a final acceptance waits until every step and fix ticket under it closes. A case under `test/level0` decides it
- its second run reads the diff since the tip of its last verdict, with the merges, and runs every command. A case under `test/level0` decides it
- past its cap, the process closes `became` onto a question ticket. A case under `test/level0` decides it
- a process inside a delivery ends after implement, and the final acceptance of the delivery reads it. A case under `test/level0` decides it
- `./RUNME.sh check` exits 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

The final acceptance is a gate carrying `final: true`, on the gate [[spec/tickets/a-gate-reviews-and-fixes]] lands. The change lands the chapter The final acceptance in `spec/design_output/pull.md`.

| piece | the change |
|---|---|
| the step | the schema admits `final`, a boolean on a gate. `spec/processes/standard.yaml` ends implement with the gate `accept`, and `spec/processes/group.yaml` puts one after `children` |
| the backlog | `holdsHere` in `src/scripts/pull-when.js` reads the new condition `backlog`, which holds where the ticket names no group. The standard `accept` carries it, so a process inside a delivery skips it |
| the wait | `takeable` in `src/scripts/pull-hand.js` holds a final gate back while a ticket naming this one as `parent` or `group` stands open |
| the rerun | `workAnswer` in `src/scripts/pull-chapter.js` names the diff from the `hash_after` of the gate's last verdict to the tip, merges and all. The hand-back runs every command field of the route, and the record keeps each answer |
| the points | accept with points mints the fix tickets and leaves the step on the gate, so it waits again |
| the cap | past `work.failsBeforePerson` verdicts short of accept, a new `acceptCapped` in `src/scripts/pull-gate.js` mints a question ticket and closes the process `became` onto it |

Weighed: the cap reuses the key the fail reads, so the config grows no key. Assumed: a group's own route carries its gate, so a delivery reads every child it holds.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->

<!-- the form is list -->

- `src/scripts/pull-hand.js` `handOut` and `offer`, which call `takeable`
- `src/scripts/pull-writes.js` `passed`, which calls `holdsHere`
- `src/scripts/pull.js` `handBack`, which calls `commandsRun` and the gate roads
- `src/scripts/pull-hand.js` `handed`, which prints `workAnswer`
- every ticket on the standard and group routes, which `./RUNME.sh ticket update` moves onto the new route

### tests

<!-- every test the change adds, one a line, as a file and a test name -->

<!-- the form is list -->

- `test/level0/pull-accept.test.js` a final acceptance waits while a fix ticket under it stands open
- `test/level0/pull-accept.test.js` a rerun names the diff since its last verdict, and runs every command
- `test/level0/pull-accept.test.js` past its cap the process closes became onto a question ticket
- `test/level0/pull-accept.test.js` a process inside a delivery skips its acceptance, and the delivery's gate reads it

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->

<!-- the form is list -->

- first

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- every file and function named stands opened: the condition reader, the hand-out, the hand-back and both processes
- the callers list follows each changed function to the file calling it
- every done_when line maps to a test row above, and `./RUNME.sh check` decides the last

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass, pass with findings naming a child a line, or fail with findings one a line -->
<!-- the form is verdict -->

pass with findings
- first-accept-names-its-base: the approach bases the rerun diff on the hash_after of the gate last verdict, and names no base for the first run, where no verdict stands. The first run reads the diff since the first take of the ticket, and a group reads it since its merge base with trunk

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test test/level0/pull-accept.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

All four cases fail on their own assertion. Today the pull hands the final gate out while a fix ticket under it stands open, the hand-out names no base for the diff, a reject past the cap inserts the phase again instead of closing, and holdsHere reads backlog as a condition it does not know. The fixture schema in pull-schema.js takes the final key today without a refusal.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

The change touches one new test file, which the draft names.
The cases reach the disk, git and the shell through the fakes pull-doors.js builds.
The file header links this ticket, which names the approach.
The cases add no fact, and point at this ticket.
The one review row, the first base, stands in the parent Discussion, and the change step carries it.

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh check

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

The change touches the files the draft names, the fixture of the route contract case, and no other.
The cases reach the disk, git and the shell through the fakes pull-doors.js builds, and the route shape stands in the contract case.
src/scripts/pull-accept.js links the chapter The final acceptance, which names the approach.
The chapter owns the bases and the moments, and each code comment points at it.
The one review row, the first base, stands in acceptBase and in the chapter, and a case decides it.

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh test test/level0/pull-accept.test.js

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

A gate carrying final now reads the whole work before a process closes. It waits while a ticket naming it as parent or group stands open, and names the diff since its last verdict, or since the first take on a first run. The hand-back runs every command field of the route. Points leave the step on the gate, and a verdict short of accept past work.failsBeforePerson closes the process onto a question ticket. The standard route carries it under when: backlog, so a ticket in a delivery skips it, and the group route carries it after its children. The chapter The final acceptance in spec/design_output/pull.md holds the rules.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

The change touches the files the draft names, the fixture of the route contract case, and no other.
The cases reach the disk, git and the shell through the fakes pull-doors.js builds, and the route shape stands in the contract case.
src/scripts/pull-accept.js links the chapter The final acceptance, which names the approach.
The chapter owns the bases and the moments, and each code comment points at it.
The one review row, the first base, stands in the code and the chapter, and a case decides it.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

The first run of a final acceptance finds no verdict to base its diff on. It reads the diff since the first take of the ticket. A group reads it since its merge base with trunk. The rerun code and the chapter The final acceptance carry this base, under first-accept-names-its-base.
