---
kind: [[ticket]]
state: open
group: the-owners-word-reaches-work
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
step: implement/change
record:
  - step: design/draft
    hand: box fcc1ba4a896f · claude-code-remote
    hash_before: c46c5879b5ca7e1de8e6fcf186f8d471d1525c5f
    hash_after: c46c5879b5ca7e1de8e6fcf186f8d471d1525c5f
  - step: design/review
    hand: box fcc1ba4a896f · claude-code-remote · helper-2
    hash_before: 71706063de906881fc2866d5dcd92934730d636b
    hash_after: 71706063de906881fc2866d5dcd92934730d636b
  - step: implement/tests-red
    hand: box fcc1ba4a896f · claude-code-remote
    hash_before: ff64d784ca9f476ebbe3b351a66949afeac3624c
    hash_after: ff64d784ca9f476ebbe3b351a66949afeac3624c
    answered:
      - name: tests
        exit: 1
        said: assertion, 4 test(s) fail on their own assertion
---

# Ask

A claim of done over a thing the owner sees rests on that view, so the owner meets the fix on the first look.

A ticket changing the sidebar or a tab closes on a count verb or a test over a fake. The owner then finds the wrong number after the close. The standard route ends on tests-green, so no step hands the owner's view a say.

- `spec/processes/standard.yaml` carries an ask field naming the view and the number there, in the owner's words. A case in `test/level0/process.test.js` holds it
- a ticket whose ask names a view carries a person leaf after its last leaf. The owner passes that leaf in the editor, and a case in `test/level0/pull-person.test.js` decides it
- `spec/guidance/tickets.md` carries the rule, with a row under `Examples`
- a change to `src/extension` meets a case that loads `src/extension/extension.js` as the editor loads it. The case fails where the load throws
- `./RUNME.sh check` exits 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

The ask names the view, a condition reads it, and a person leaf closes the route where it holds.

1. `spec/processes/standard.yaml` gains an ask field `view`, form `text`: the view the owner reads the change in and the number there, in the owner's words, or `none`. `askRows` in `src/scripts/process.js` renders it as a comment like every field. The author writes it as a line opening `view:` under `# Ask`.
2. `spec/processes/standard.yaml` gains a top-level step `view` after `implement`: `by: person`, `when: view`, `does: reads the change in the view the ask names`, and one `verdict` evidence field `seen`, saying what the view shows against the ask's number.
3. `holdsHere` in `src/scripts/pull-hand.js` reads a `view` condition. It takes the ticket text as a fourth argument, and holds where the Ask chapter carries a `view:` line whose value is not `none`. Where it fails, the pull skips the leaf as it skips a `cloud` leaf, and the ticket closes on tests-green as it does today.
4. `spec/guidance/tickets.md` gains a rule: an ask changing a thing the owner sees names the view and its number under `view:`, and a claim of done rests on the owner's pass at the `view` leaf. An `Examples` row pairs the sidebar count named under `view:` with a close on a count verb alone.
5. `test/level0/extension-load.test.js` loads `src/extension/extension.js` through `createRequire`, with a fake `vscode` module standing in the require cache, and calls `activate` with a fake context and no door. It fails where the load or `activate` throws.

### callers

- `src/scripts/pull-hand.js` `advanced`, which calls `holdsHere` on the leaf it stands on, and passes the ticket text
- `src/scripts/pull-writes.js` the pass that skips leaves after a hand-back, which calls `holdsHere` on each next leaf, and passes the text it holds
- `src/scripts/process.js` `askRows` and `withRoute`, which render the new ask field at the mint
- `src/scripts/pull-hand.js` `handFaults` in `src/scripts/pull.js`, which refuses an agent on the `by: person` leaf at a desk
- `src/scripts/pull-hand.js` `withEngineReader`, which reads person steps named `person` alone, so the `view` step stays outside it
- `test/contract/process.test.js` the standard route case, whose leaf list gains `view`
- `./RUNME.sh ticket update`, which carries the new step onto every open standard ticket short of it

### tests

- `test/level0/process.test.js` "the standard route asks for the view the owner reads, in the owner's words"
- `test/level0/pull-person.test.js` "a ticket whose ask names a view closes on the owner's pass at the view leaf"
- `test/level0/pull-person.test.js` "a ticket whose ask says view: none skips the view leaf and closes on tests-green"
- `test/contract/question-grades.test.js` "the tickets note rests a claim of done on the owner's view"
- `test/level0/extension-load.test.js` "the extension loads and activates as the editor loads it"

### answers

- first on a first draft

### checked

- every file, function and verb named stands opened: `holdsHere`, `advanced`, the skip pass in `pull-writes.js`, `askRows`, `withEngineReader`, `activate` and the `vscode` requires under `src/extension`
- the callers list names both callers of `holdsHere`, the mint path for the ask, and the readers of person steps
- every `done_when` line names its test above, and `./RUNME.sh check` decides the last

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass, pass with findings naming a child a line, or fail with findings one a line -->

<!-- the form is verdict -->

pass with findings
- the-view-fails-to-implement: the `view` step names no `on_fail`, so `failed` in `src/scripts/pull-writes.js` holds the ticket at `view` and the owner's fail reaches no code; the step carries `on_fail: implement`
- the-cloud-waits-for-owners: the hand rule admits a hand on a cloud box at a `by: person` leaf, so a cloud agent passes the `view` leaf the owner passes in the editor; the leaf waits for the owner's desk or `--owner-says`
- the-callers-name-their-files: `handFaults` stands in `src/scripts/pull-chapter.js`; the case in `test/contract/process.test.js` asserts no verdict step after the code, and `to: retro` moves from `implement/tests-green` to `view`
- the-fake-vscode-resolves: `vscode` resolves to no file, so an entry in the require cache alone meets no `require("vscode")`; the case in `test/level0/extension-load.test.js` hooks `Module._load` or `Module._resolveFilename`
- the-draft-names-its-size: the draft carries no `size`, and the ask leaves out `src/scripts/pull-hand.js`, `src/scripts/pull-writes.js`, `test/contract/process.test.js` and `test/contract/question-grades.test.js`

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

    ./RUNME.sh branch test test/level0/extension-load.test.js test/level0/pull-person.test.js test/level0/process.test.js test/contract/question-grades.test.js

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

- the route carries no `view` field or step, so the process case fails on its find
- `holdsHere` names no `view` condition, and a cloud agent writes a person leaf, so the pass case fails
- the tickets note names no `view:` line, so the grade case fails
- the load case passes: it guards the load, and fails where it throws
- what surprises the hand: a fake `vscode` built on an arrow cannot construct, and the load calls `new vscode.RelativePattern`

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the cases touch the test files the ask names, and one grade case in the contract file
- the load case stands a fake `vscode` in `Module._load`, since the name resolves to no file
- each case carries the pointer at this ticket
- each case reads the note or the route that states the fact
- the review rows ride into the change: `on_fail`, the cloud wait, the fake's road and the callers each hold a case or a line

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

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
