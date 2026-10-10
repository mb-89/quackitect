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
group: edits-and-files-hold
step: implement/tests-green
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box a5167492d95e · claude-code-remote
    hash_before: 82aed49ef512b1c02fb745c80d19c88accd96deb
    hash_after: 82aed49ef512b1c02fb745c80d19c88accd96deb
    inputs:
      - name: ask
        hash: 3a2ac63c047b0776
        size: 375
    def: c01ae0f2ace0cecb
  - step: design/tests-red
    hand: box a5167492d95e · claude-code-remote
    hash_before: 1498ee7b92ea6f04a3b3de4b0ac526b1b40973e7
    hash_after: 1498ee7b92ea6f04a3b3de4b0ac526b1b40973e7
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/modules/git fails
    inputs:
      - name: design/draft
        hash: ee11e19875f11b5d
        size: 1038
    def: 08e16d07b0de477c
  - step: gate
    hand: box a5167492d95e · claude-code-remote · helper-11
    hash_before: 264218ee8514cf7462ff3d7658682a1c8b14f4fa
    hash_after: 264218ee8514cf7462ff3d7658682a1c8b14f4fa
    inputs:
      - name: design/draft
        hash: ee11e19875f11b5d
        size: 1038
      - name: design/tests-red
        hash: 6566cd5d7522602f
        size: 508
    def: dc4904ab364efa10
  - step: implement/change
    hand: box a5167492d95e · claude-code-remote · helper-16
    hash_before: 55d5aa33808b307bc34b5ad7b5dfea95177ced7b
    hash_after: 55d5aa33808b307bc34b5ad7b5dfea95177ced7b
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
    def: f150b8c0dc20fe45
---

# Ask

A git read that fails once leaves the last good branches, trunk, stood and tracked standing until a read succeeds.

One failed read commits an empty value, so every branch, trunk ticket and finding vanishes from the index for a span.

- `./RUNME.sh branch test src/modules/git` passes a case where a tick whose read fails commits nothing and the last value stands

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

In Start's send, a read that answers an error leaves its port out of that tick. The port then commits nothing, last[port] keeps the value it sent before, and the index keeps the last good value until a read succeeds. A read answering no trunk, which Trunk already turns into an empty list with no error, still commits as it does. The empty defaults Registers declares still stand for a box whose first read fails.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/modules/git/git.go Start, which src/quack wires as the git module's start

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/modules/git/git_test.go, the case where a tick whose tips read fails commits nothing and the tips stand

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/modules/git/git.go
- src/modules/git/git_test.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- opened: Start, send, Tips, Trunk, Stood, Tracked and Registers stand as the approach reads them
- callers: Start is the one function the change touches, and its one caller is the module's wiring
- done_when: the failed-read case decides the one line
- config: the approach adds no key

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/modules/git

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/modules/git/git_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The case fails on its own assertion: the failed tick commits an empty tips list after the one branch, so the index drops every branch for a span. The wrapper fails the tips read alone, and the fake answers every other read.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- done_when: the failed-read case fails today, and the fix turns it green
- doors: the case runs on FakeGit, wrapped to fail one read, and the fake stands as it does

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept
In the send of Start in src/modules/git/git.go, a failed read becomes an empty value that commits. Leaving the failed port out of that tick keeps the last value. Trunk and Stood answer an empty list with no error where no trunk or HEAD stands, so those cases commit as before. Registers declares empty defaults for all four ports. The one caller is src/quack/modules.go. TestAFailedReadKeepsTheLastValue decides the done_when line and fails on its own assertion. Implement rewrites the Start comment saying a refused read commits no branch.

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh lint src/modules/git/git.go src/modules/git/git_test.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- files: the change touches git.go alone, which the draft size names
- doors: the tests run on the git fake, wrapped to fail one read
- approach: the doc comment and the send comment link this ticket
- one place: the send owns the rule, and each comment points at the ticket

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
