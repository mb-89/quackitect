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
    hash_before: d35fd9c6b51161591e17094ebe337b96932ed005
    hash_after: d35fd9c6b51161591e17094ebe337b96932ed005
    inputs:
      - name: ask
        hash: ef340abe75ddfe64
        size: 307
    def: c01ae0f2ace0cecb
  - step: design/tests-red
    hand: box a5167492d95e · claude-code-remote
    hash_before: 38da488332847fd6829d52c47c4e35f7076718a8
    hash_after: 38da488332847fd6829d52c47c4e35f7076718a8
    answered:
      - name: tests
        exit: 1
        said: assertion, a test of src/modules/edits fails
    inputs:
      - name: design/draft
        hash: 0643c3848fc12caf
        size: 1419
    def: 08e16d07b0de477c
  - step: gate
    hand: box a5167492d95e · claude-code-remote · helper-5
    hash_before: 73d86da46fd8f5b298c59d800e48d6a95518323f
    hash_after: c4832da06571e0786781a3159bb6d408fa4a9584
    inputs:
      - name: design/draft
        hash: 0643c3848fc12caf
        size: 1419
      - name: design/tests-red
        hash: 687470fd48202cca
        size: 483
    def: dc4904ab364efa10
  - step: implement/change
    hand: box a5167492d95e · claude-code-remote · helper-12
    hash_before: 33d62e65e8df19dcbbd226defa78d56f0cab4733
    hash_after: 41b53e0d2365b1a9d7f958109a77e3b719fbeade
    answered:
      - name: lint
        exit: 0
        said: "src/quack/verb_split.go:22:1 ExampleCovers: ./RUNME.sh split stands in no example's interface. Write an example under sp"
    def: f150b8c0dc20fe45
  - step: implement/tests-green
    hand: box a5167492d95e · claude-code-remote
    hash_before: 72dada03361af588c8388326fde290d057dd668d
    hash_after: 72dada03361af588c8388326fde290d057dd668d
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/edits passes
      - name: check
        exit: 0
        said: "   85.7  in all"
    inputs:
      - name: design/tests-red
        hash: 687470fd48202cca
        size: 483
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

Two applies landing in the same millisecond each keep their own undo entry.

The second entry overwrites the first, so the first apply can no longer be undone.

- `./RUNME.sh branch test src/modules/edits` passes a case where two entries stamped the same millisecond both stand and sort in order

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

A pure FreeName(at, taken) in journal.go names an entry. It keeps the stamp's seventeen digits and counts in the three padding digits, taking the first name the journal folder does not hold. A second entry in one millisecond lands as the next count, and it sorts after the first, so NewestOn still reads the newest last. Each of the three writers passes a taken check over its own journal folder through its own disk door: the edits writes, the split verb and the rename verb. A check and a write in two processes in one millisecond still meet, and that window is far narrower than the overwrite every same-millisecond pair meets today.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/modules/edits/edits.go Outside.writes
- src/quack/verb_split.go the split's journal entry
- src/quack/rename.go the rename's journal entry

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- src/modules/edits/edits_test.go, the case where two patches at one clock reading leave two entries, and the undo takes back the second

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/modules/edits/journal.go
- src/modules/edits/edits.go
- src/modules/edits/edits_test.go
- src/quack/verb_split.go
- src/quack/rename.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- opened: NameOf, writes, put, NewestOn and both quack writers stand as the approach reads them
- callers: the grep for NameOf names the three writers, and the list carries each
- done_when: the two-patch case decides the one line
- config: the approach adds no key

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test src/modules/edits

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- src/modules/edits/edits_test.go

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The case fails on its own assertion: two patches at one clock reading leave one entry, since the second wrote over the first. The first apply then has no way back.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- done_when: the two-patch case fails today, and the free name turns it green
- doors: the case runs on a temp folder through Outside, the module's own disk door, marked as building its own root

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- journal-note-names-the-count: spec/design_output/apply.md#the-entry-names-its-time says nothing holds a counter, and FreeName counts in the padding digits, so the note takes the change and the draft size leaves that file out
- free-name-reads-missing-folder: the taken check reads an absent journal folder as nothing taken, since the first apply on a root meets no folder before put makes it

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh lint src/modules/edits/journal.go src/modules/edits/edits.go src/quack/verb_split.go src/quack/rename.go spec/design_output/apply.md src/quack/verb_project_test.go src/quack/landing_test.go

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- files: the draft size, the gate note in apply.md, and a split and a move case beside the verbs
- doors: the edits case runs on a temp root, and split and rename stat through the fake disk
- comment: each new comment line ends on the ticket link naming the free name approach
- one place: `FreeName` alone counts, and apply.md links the ticket

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh branch test src/modules/edits

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

Two applies at one clock reading now keep two journal entries. A free name counts in the padding digits of the stamp, and each writer checks its own journal folder through its own disk door. A folder that is not there yet reads as nothing taken. Before, the second entry overwrote the first, and undo lost the first apply.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- files: the edits journal, its three writers, their tests and the apply note
- doors: each case runs over a temp root or the fake disk
- comment: each new line points at this ticket
- one place: the free name stands in the journal alone

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
