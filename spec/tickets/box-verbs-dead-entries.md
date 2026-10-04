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
group: box-verbs-run-in-go
step: implement/tests-green
record:
  - step: design/owner-read
    skipped: true
    why: the ask comes off no handover
  - step: design/draft
    hand: box 660db8e33adc · claude-code-remote
    hash_before: b80df296af81ba3f1621d5e3a5e757563084f7e8
    hash_after: b80df296af81ba3f1621d5e3a5e757563084f7e8
    inputs:
      - name: ask
        hash: 8abfe25c5bf1aab8
        size: 896
    def: 7883b3d10633c780
  - step: design/tests-red
    hand: box 660db8e33adc · claude-code-remote
    hash_before: 4eee5abcb7d7a7e34c78b0292c2e9f91dd224443
    hash_after: 4eee5abcb7d7a7e34c78b0292c2e9f91dd224443
    answered:
      - name: tests
        exit: 1
        said: assertion, 14 test(s) fail on their own assertion
    inputs:
      - name: design/draft
        hash: c6855abd1fef5fb4
        size: 1650
    def: 08e16d07b0de477c
  - step: gate
    hand: box 660db8e33adc · claude-code-remote · helper-4
    hash_before: 33ad960976ee2484c08996fdfc79d024e4851f8b
    hash_after: 33ad960976ee2484c08996fdfc79d024e4851f8b
    inputs:
      - name: design/draft
        hash: c6855abd1fef5fb4
        size: 1650
      - name: design/tests-red
        hash: bee400f3585a4666
        size: 549
    def: dc4904ab364efa10
  - step: implement/change
    hand: box 660db8e33adc · claude-code-remote
    hash_before: 5a8882ac62672df5d065a338ca2a449091c3200d
    hash_after: 64dc382347a9e704f1df1a94f8d11daf9be4ef97
    answered:
      - name: lint
        exit: 0
        said: "   49.4  in all"
    def: f150b8c0dc20fe45
  - step: implement/tests-green
    hand: box 660db8e33adc · claude-code-remote
    hash_before: 3ea9c9b9f32f9c903df581d23aa0cee56b882331
    hash_after: 3ea9c9b9f32f9c903df581d23aa0cee56b882331
    answered:
      - name: tests
        exit: 0
        said: green, 14 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "   73.9  in all"
    inputs:
      - name: design/tests-red
        hash: bee400f3585a4666
        size: 549
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

The JavaScript the setup and the doctor reached leaves with them, so phase 11 leaves no road a box takes into Node behind.

The Go setup links the editor and finds the browser in process, and the Go doctor prints the browser row itself. So the program entry at the foot of `src/scripts/editor.js` loses its caller. The same holds for the one in `src/scripts/browser.js` and for `browserSays`. Left alone, each reads as a road the setup still takes, and the next port reads code nothing runs.

- `src/scripts/editor.js` carries no program entry, and every export nothing past its own tests imports leaves with it; a search of `src`, `test` and `.claude` decides it
- `src/scripts/browser.js` carries no program entry and no `browserSays`; the same search decides it
- `node --test test/level0/browser.test.js` and every test of `editor.js` pass
- `./RUNME.sh check` exits 0

view: none

from: none

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

Only homeIn leaves editor.js through a real import, so editor.js shrinks to homeIn. Its program entry, main, the link and list code and their helpers leave. browser.js loses its program entry and browserSays. browserFrom stays, since the drawing-page contract drives it. The editor and browser tests drop the cases of removed code. outside-in-doors drops editor.js from its roots, since editor.js reaches no door any more.

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->
<!-- the form is list -->

- src/scripts/browser.js, trust.js, vehicle.js, probe-cold.js, cli-doors.js import homeIn, which stays
- test/level0/editor.test.js imports the exports that leave
- test/level0/browser.test.js imports browserSays
- test/contract/drawing-page.test.js imports browserFrom, which stays
- test/contract/outside-in-doors.test.js names editor.js in ROOTS
- no Go file, shell script, RUNME.sh or workflow runs editor.js or browser.js as a program

### tests

<!-- every test the change adds, one a line, as a file and a test name -->
<!-- the form is list -->

- test/contract/dead-entries.test.js, editor.js carries no program entry
- test/contract/dead-entries.test.js, browser.js carries no program entry
- test/contract/dead-entries.test.js, one case for each export that leaves

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->
<!-- the form is list -->

- first

### size

<!-- every file the approach touches, one a line -->
<!-- the form is list -->

- src/scripts/editor.js
- src/scripts/browser.js
- test/level0/editor.test.js
- test/level0/browser.test.js
- test/contract/outside-in-doors.test.js
- test/contract/dead-entries.test.js

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- editor.js, browser.js and every importer stand opened, and each import line checked
- the callers come off a search of import lines in src, test, .claude, .github and the shell scripts
- each done_when line meets a case in dead-entries.test.js, the two named test files, and the check

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->
<!-- the form is command -->

./RUNME.sh branch test test/contract/dead-entries.test.js

### red

<!-- every test file standing red until tests-green closes, one a line, which the check leaves out -->
<!-- the form is list -->

- test/contract/dead-entries.test.js

### seen

<!-- what you see, and what surprises you -->
<!-- the form is text -->

Every case fails on its own assertion: both modules read process.argv, and each dead export stands. The export check matches export function and export const both, since LIST and KEPT are constants.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- each done_when line meets a case: the two entry cases, one case for each export, the two module tests, and the check
- the test reads the real tree through the disk door, so it stands under test/contract

# gate

<!-- reads the design phase against the ask, fixes what it finds within its own diff, and names the rest as points -->

## verdict

<!-- accept, accept with points naming a fix ticket a line, or reject with findings one a line -->
<!-- the form is verdict -->

accept with points
- extension-link-note-names-go: spec/design_output/extension.md says src/scripts/editor.js makes the link. After this change editorlink.go makes it. Point both sections at the Go file.

# implement

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->
<!-- the form is command -->

./RUNME.sh check

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches the files the draft names, plus the .vale.ini line that switched the doors rule off for editor, brand and browser. None of the three reads process any more
- the change reaches no door past the disk door the browser test fakes
- the editor.js and browser.js headers link the design section they serve
- homeIn stays the one owner of the home folder order in JavaScript

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->
<!-- the form is command -->

./RUNME.sh branch test test/contract/dead-entries.test.js

### check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The Go setup links the editor and finds the browser in process, and the Go doctor prints the browser row. So the JavaScript that did this lost every caller. editor.js now holds homeIn alone, which five scripts still import. browser.js keeps browserFrom for the drawing test, and loses its program entry and browserSays. Their tests drop the cases of removed code, and the doors rule holds over editor, brand and browser again.

### checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches the files the draft names, plus one .vale.ini line
- the browser test runs over the fake disk
- each header links its design section
- homeIn stays the one owner of the home folder order in JavaScript

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
