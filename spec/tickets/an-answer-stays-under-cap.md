---
kind: [[ticket]]
state: open
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
group: guidance-rides-each-step
step: implement/tests-green
record:
  - step: design/draft
    hand: box d7d8cca5d3cd · claude-code-remote
    hash_before: fa5a46b626147f54ea022bc86ae22494ccf7e30e
    hash_after: fa5a46b626147f54ea022bc86ae22494ccf7e30e
  - step: design/review
    hand: box d7d8cca5d3cd · claude-code-remote · helper-2
    hash_before: 720e1907f4f48d37bb382e6c2516b989a860333b
    hash_after: 720e1907f4f48d37bb382e6c2516b989a860333b
  - step: implement/tests-red
    hand: box d7d8cca5d3cd · claude-code-remote
    hash_before: 7f6e20750882f74e462a1b22e394a0efbeac3434
    hash_after: 7f6e20750882f74e462a1b22e394a0efbeac3434
    answered:
      - name: tests
        exit: 1
        said: assertion, 2 test(s) fail on their own assertion
  - step: implement/change
    hand: box d7d8cca5d3cd · claude-code-remote
    hash_before: 1e9be65e307d19744e23ca82b67dce9ab9c0c9f2
    hash_after: 1e9be65e307d19744e23ca82b67dce9ab9c0c9f2
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
---

# Ask

Every answer of the pull reaches the model whole. [[spec/design_input/level-two]] asks it in its chapter The size cap.

Today a step with long guidance lands on disk as a preview, and the hand works from a fragment.

- `spec/config/level0.json` names the cap and its margin, and `spec/config/level0.schema.json` declares both. A case under `test/level0` reads them
- the pull splits a hand-out past the margin, and the next pull on the same step prints the rest. A case under `test/level0` decides it
- `./RUNME.sh check` exits 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->
<!-- the form is text -->

- `spec/config/level0.json` gains a `pull` key holding `cap`, the bytes one tool answer reaches the model whole, and `margin`, the bytes the engine keeps free below it. `spec/config/level0.schema.json` declares both as numbers in bytes.
- `src/scripts/cli-doors.js` `doorsHere` reads both into `it.cap`, as `{ bytes, margin }`.
- `src/scripts/pull-chapter.js` gains `partOf(text, room)`: it answers the text whole where it fits in `room` bytes, and else cuts at the last line ending inside `room` and answers the rest.
- `src/scripts/pull-hand.js` `handed` renders `workAnswer`, cuts it at the cap less the margin, prints the head with a closing line naming the pull that prints the rest, and writes the rest into the hold under `rest`.
- `src/scripts/pull-route.js` `stillHeld` prints the next part where the hold carries `rest`, writes the hold again with what stays, and answers 0. The step stays whole: the hold, the leaf and the hand-back stand as before.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

src/scripts/pull-hand.js handOut, which calls handed,src/scripts/ephemeral-pull.js ephemeralPull, which calls handed,src/scripts/pull.js pull, which calls stillHeld,src/scripts/cli-doors.js doorsHere, which builds it for every verb

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

test/level0/pull-cap.test.js the config names the cap and its margin, and the schema declares both,test/level0/pull-cap.test.js a hand-out past the margin splits, and the next pull on the same step prints the rest

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

first

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- every file, function and verb the approach names stands opened: handed, stillHeld, workAnswer, doorsHere, configOf
- the callers list names handOut, ephemeralPull, pull and doorsHere, found by a search for handed and stillHeld
- each done_when line names a case in test/level0/pull-cap.test.js, and the check line names ./RUNME.sh check

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass, pass with findings naming a child a line, or fail with findings one a line -->
<!-- the form is verdict -->

pass with findings
- rest-line-names-plain-pull: the closing line of a cut hand-out names the plain pull, with --as where the hold carries one, and no ticket name, because pull in src/scripts/pull.js sends a name with a held leaf to handBack, and stillHeld stands behind that road
- long-line-cuts-by-bytes: partOf in src/scripts/pull-chapter.js cuts at a UTF-8 boundary inside room where one line alone runs past room, because a cut at the last line ending finds none there
- refusals-stay-under-cap: the refusals of stillHeld and handBack print the guidance again through notesSaid, and the draft cuts the work answer alone, so a refusal past the margin still lands on disk as a preview
- the-callers-name-dueHandOut: the callers list names ephemeralPull as a caller of handed, and dueHandOut in src/scripts/ephemeral-pull.js makes that call

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test test/level0/pull-cap.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

The config case fails on the missing pull key, and the split case fails on the missing closing line, since the pull prints the hand-out whole. The case under the margin passes already, which holds the plain hand-out as it stands. The fixture carries the cap on it, so the case reads no config and no box.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the tests touch test/level0/pull-cap.test.js alone
- the cases drive the fake disk, git and clock of test/level0/pull-doors.js
- the file header names the chapter The size cap it implements
- the cap and its margin stand once, in spec/config/level0.json, and the case reads them there
- the review's rows ride the implement step: the closing line names the plain pull, a long line cuts at a character, and the refusal stays under the cap

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh lint src/scripts/pull-cap.js src/scripts/pull-route.js src/scripts/pull-hand.js src/scripts/cli-doors.js test/level0/pull-cap.test.js spec/config/level0.json spec/config/level0.schema.json

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches the config, its schema, the doors, the pull's hand-out and still-held answer, and one new module, each named in the approach
- the change reaches the disk through writeHold alone, and the fake disk answers it in every case
- the header of src/scripts/pull-cap.js names the chapter The size cap, and each function links it
- the cap and its margin stand once, in spec/config/level0.json, and the doors read them there
- the review's rows stand fixed: the closing line names the plain pull with its --as, a long line cuts at a character, and the still-held refusal stays under the cap; the callers row answers dueHandOut in src/scripts/ephemeral-pull.js

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

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
