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
process: [[spec/processes/standard]]
process_hash: 22b42ea1501e8967
step: implement/tests-green
group: loose-fixes-99f4547
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box d84e33ce20f7 · claude-code-remote
    hash_before: a9d1f95bb1c8a3d43e44860f77ca4d8785ff8ee5
    hash_after: a9d1f95bb1c8a3d43e44860f77ca4d8785ff8ee5
    inputs:
      - name: ask
        hash: 05e7db43ad340a67
        size: 581
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box d84e33ce20f7 · claude-code-remote
    hash_before: 6b48ecec417a46a47c63750b51a1d7dd7712a2b1
    hash_after: 6b48ecec417a46a47c63750b51a1d7dd7712a2b1
    answered:
      - name: tests
        exit: 1
        said: assertion, 1 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: 9ef7c2e96a66b47f
        size: 1411
    def: 08e16d07b0de477c
  - step: gate
    hand: box d84f325b2110d · claude-code-remote
    hash_before: 15a6e864a69047ac7ec040015fed14e3330e68ee
    hash_after: 15a6e864a69047ac7ec040015fed14e3330e68ee
    inputs:
      - name: design/draft
        hash: 9ef7c2e96a66b47f
        size: 1411
      - name: design/tests-red
        hash: d30bab38f96a35c2
        size: 589
    def: dc4904ab364efa10
  - step: implement/change
    hand: box d84f325b2110d · claude-code-remote
    hash_before: dcba88dc2c81d144730ee98403cff474bed5d647
    hash_after: dcba88dc2c81d144730ee98403cff474bed5d647
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
    def: f150b8c0dc20fe45
  - step: implement/tests-green
    hand: box d84f325b2110d · claude-code-remote
    hash_before: 44dbbefede9e761a3d305965406fc5a41034dfd2
    hash_after: 44dbbefede9e761a3d305965406fc5a41034dfd2
    answered:
      - name: tests
        exit: 0
        said: green, 5 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/vale-ls-windows-trial.md:41:1: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: design/tests-red
        hash: d30bab38f96a35c2
        size: 589
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

A list field a hand-back carries as a JSON array lands on the ticket one item a line. Each reader of a list field then reads one item a row, as the red list does.

Today such an array lands as one line joined by commas. The red list then names one file that stands nowhere, and the check runs the red tests.

- a case in `test/level0/pull-fields.test.js` hands back a list field as an array, and the ticket carries one item a line
- a case there hands back the red list as an array, and `expectedRed` names each file
- `./RUNME.sh check` exits 0

The view: none.

The source: none.

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

formatted in src/scripts/pull-format.js turns a field value into text with String, and String joins an array by commas. It now joins an array one item a line before its other rules run. withPayload in src/scripts/pull-chapter.js calls it for every field, so a list field handed back as an array lands one item a line, and redListOf reads each row as one file. Assumption: an array means a list, whatever form the field names, since a text field has no use for commas between items. Cost: a hand passing an array to a text field gets lines in place of commas.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

src/scripts/pull-chapter.js: withPayload, the one caller of formatted
src/scripts/pull.js: the hand-back, the one caller of withPayload
src/scripts/red-list.js: redListOf, which reads the rows formatted writes and stays unchanged

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

test/level0/pull-fields.test.js: a list field handed back as an array lands one item a line
test/level0/pull-fields.test.js: a red list handed back as an array names each file to expectedRed

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

first on a first draft

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

src/scripts/pull-format.js
test/level0/pull-fields.test.js

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- formatted, withPayload, withFieldText and redListOf stand opened, and String over an array joins by commas
- the callers come off a grep of formatted and withPayload
- each done_when line names its case in pull-fields.test.js, and the check stays for tests-green

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh test test/level0/pull-fields.test.js

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

test/level0/pull-fields.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The array case fails on its own assertion: the red field lands as one comma-joined line. The expectedRed case passes already, because this group split comma-joined red rows in redListOf to green the check. It stays as the guard on the reader side.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the array case decides the first done_when line and fails, the expectedRed case decides the second, and the check stays for tests-green
- withPayload and expectedRed read text alone, so the cases reach no door

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

./RUNME.sh lint test/level0/pull-fields.test.js

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches test/level0/pull-fields.test.js alone, since main already carries the formatted change in src/scripts/pull-format.js
- the change reaches no door: withPayload and expectedRed read text alone
- the comment in formatted on main names the approach, and the case links this ticket
- the bullet form stands once, in formatted and its test in pull-format.test.js, and this case reads it

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh test test/level0/pull-fields.test.js

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

A list field handed back as a JSON array lands one item a line, as a bullet row, and expectedRed names each file of a red list handed back that way. The formatted change landed on main first, under the-guidance-topic-lands, so this ticket brings its cases onto main's bullet form and keeps them as the guard on both sides: the write and the red list reader.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches test/level0/pull-fields.test.js alone, since main carries the formatted change
- the change reaches no door: withPayload and expectedRed read text alone
- the comment in formatted on main names the approach, and the cases link this ticket
- the bullet form stands once, in formatted and its test, and these cases read it

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

This ticket waits on nobody. `design/owner-read` holds `when: handed`, and the ask says the source is none, so the next pull skips that step and hands out `design/draft`. The dispatch hands the ticket to a box like other open work.
