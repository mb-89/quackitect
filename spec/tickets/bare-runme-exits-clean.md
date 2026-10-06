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
group: engine-verbs-hold
step: implement/tests-green
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box 57a5a484096e · claude-code-remote
    hash_before: 92ffdec01fbd47ecfc40678b9be9b257514e22e6
    hash_after: 92ffdec01fbd47ecfc40678b9be9b257514e22e6
    inputs:
      - name: ask
        hash: eea6d816b58614e1
        size: 323
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box 57a5a484096e · claude-code-remote
    hash_before: 1de9acb28a9827394606b88f4acdeae741f7bf9e
    hash_after: 1de9acb28a9827394606b88f4acdeae741f7bf9e
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/quack fails
    inputs:
      - name: design/draft
        hash: 109d1abe6f2ad25a
        size: 1605
    def: 08e16d07b0de477c
  - step: gate
    hand: box 57a5a484096e · claude-code-remote · helper-4
    hash_before: c20c7e8c4810998b23b12d8cf3b0cf3dee63da60
    hash_after: c20c7e8c4810998b23b12d8cf3b0cf3dee63da60
    inputs:
      - name: design/draft
        hash: 109d1abe6f2ad25a
        size: 1605
      - name: design/tests-red
        hash: da25498fea11bdac
        size: 688
    def: dc4904ab364efa10
  - step: implement/change
    hand: box 57a5a484096e · claude-code-remote
    hash_before: 0e28860425a70a72c869219566a2edd14e78d987
    hash_after: 0e28860425a70a72c869219566a2edd14e78d987
    answered:
      - name: lint
        exit: 0
        said: "test/level0/work-stands.test.js:16:1: correctness/noUnusedImports: Several of these imports are unused."
    def: f150b8c0dc20fe45
---

# Ask

A bare `./RUNME.sh` on a cloud box prints the verbs and exits 0, so a box reads no false fault.

Every box that runs it bare meets an exit of 1 and a note to install an editor no cloud box uses.

- `./RUNME.sh test` passes a case where a bare `./RUNME.sh` on a cloud box with no editor exits 0.
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

`RUNME.sh` runs the install, then reads a bare call. On a cloud box, where `CLAUDE_CODE_REMOTE` or `SE_CLOUD` stands set, the bare call becomes `help`. The script runs `set -- help` and falls through to the verb road, so the binary prints the usage and exits 0. A desk keeps its road: the panel flag, then `code`, or the note and exit 1.

A new Go test runs the real script once by `sh`, in a temporary root. That root holds a copy of `RUNME.sh`, a no-op `src/scripts/install.sh`, and a fake `.se/.runtime/bin/se-index` printing its words. The PATH holds `dirname` and `mkdir` alone, so `code` stands nowhere. The cloud case reads exit 0 and the words `verb <root>/src/scripts help`. The desk case reads exit 1 and the note.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

RUNME.sh the bare branch, which a person runs
src/quack/doctor_verb.go toolRow and its siblings, whose hint names a bare ./RUNME.sh
src/quack/lspprobe.go lspProbe, whose hint names a bare ./RUNME.sh

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

src/quack/runme_test.go TestABareRunmeOnACloudBoxPrintsTheVerbs
src/quack/runme_test.go TestABareRunmeOnADeskWithNoEditorNamesIt

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

RUNME.sh
src/quack/runme_test.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

RUNME.sh, usageDoor in src/quack/verbs.go, cloudVariables in src/quack/command.go and runShim in src/vehicle/shim_contract_test.go stand opened, and `./RUNME.sh help` exits 0 here.
A grep for a bare RUNME.sh over src, the workflows and the hooks finds a person and the doctor's hints alone.
The done_when line on `./RUNME.sh test` meets TestABareRunmeOnACloudBoxPrintsTheVerbs, and the check line meets the check at tests-green.

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/quack/runme_test.go

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

src/quack/runme_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The cloud case answers 1 and the editor note under both cloud variables, which is the fault the ask names. The desk case passes already, so it guards the desk road through the change. The script calls `sh` by name for the install, so the PATH folder links `sh` beside `dirname` and `mkdir`.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

The done_when line on `./RUNME.sh test` meets TestABareRunmeOnACloudBoxPrintsTheVerbs, red on its assertion; the check line waits for tests-green.
The test drives the real script once, and its install and binary are fakes in a temporary root, so no real install or index runs.

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

pass
- the approach answers the ask: a bare call on a cloud box becomes `set -- help` and reaches the binary, which exits 0, and the desk road stands unchanged; the install still runs first, so the doctor and lspProbe hints naming a bare ./RUNME.sh hold on both roads
- TestABareRunmeOnACloudBoxPrintsTheVerbs decides the test line and fails here on its own assertion under both cloud variables (exit 1 and the editor note); TestABareRunmeOnADeskWithNoEditorNamesIt passes and guards the desk road; the check line waits for tests-green
- fix in place at implement: the approach reads a cloud variable as set where it stands non-empty, while cloudVariables in src/quack/command.go reads empty, 0 and false as a desk; match that rule in RUNME.sh, and add a desk case under SE_CLOUD=false to runme_test.go

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

The change touches RUNME.sh and src/quack/runme_test.go, the two files the draft names, and nothing past them.
The test runs the real script with a fake install and a fake binary in a temporary root, so no real install, index or editor runs.
A comment above cloud_box names the approach and links the ticket, and the bare branch carries its own line.
The cloud rule points at cloudVariables in src/quack/command.go, and the script follows that rule: a trimmed value, with empty, 0 or false reading as a desk. The desk test now covers SE_CLOUD=false, a padded 0 and an empty value.

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
