---
kind: [[ticket]]
state: closed
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
step: implement/tests-green
record:
  - step: design/draft
    hand: box fcc1ba4a896f · claude-code-remote
    hash_before: 5fed4e85bc0a9bfedf2e5f8570f4e2850fa988f4
    hash_after: 5fed4e85bc0a9bfedf2e5f8570f4e2850fa988f4
  - step: design/review
    hand: box fcc1ba4a896f · claude-code-remote · helper-2
    hash_before: f4b06c455402d30ab538c1adf0f35e1078d59d90
    hash_after: f4b06c455402d30ab538c1adf0f35e1078d59d90
  - step: implement/tests-red
    hand: box fcc1ba4a896f · claude-code-remote
    hash_before: 10635c3a09d5d0a6709e731a0ef139face8fec5d
    hash_after: 10635c3a09d5d0a6709e731a0ef139face8fec5d
    answered:
      - name: tests
        exit: 1
        said: assertion, 4 test(s) fail on their own assertion
  - step: implement/change
    hand: box fcc1ba4a896f · claude-code-remote
    hash_before: aeb4b1de278166a8aafb173a1ef96df9712240d2
    hash_after: aeb4b1de278166a8aafb173a1ef96df9712240d2
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
  - step: implement/tests-green
    hand: box fcc1ba4a896f · claude-code-remote
    hash_before: 5e527f0c39829cb4f476d107f40fbff55e3d48da
    hash_after: 5e527f0c39829cb4f476d107f40fbff55e3d48da
    answered:
      - name: tests
        exit: 0
        said: green, 13 test(s) pass in 3 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/the-owners-words-travel-verbatim.md:154:1: ListItem: A sentence in a list item holds 20 words, and this one"
reason: done
---

# Ask

A one-line change the owner orders lands in one step. A design review weighs a draft's spread against its ask before any code, and the lead takes the next item while the reviewer reads.

The mint takes the standard route by habit, so a one-line config change runs a draft, a review and a build. A draft names no size, so a draft touching many files for one number passes unweighed. The spawn answer holds the lead until the reviewer answers.

- `spec/guidance/tickets.md` carries a rule sending a one-line change the owner orders to `--process=trivial`, with its failure and an `Examples` row
- `design/draft` in `spec/processes/standard.yaml` asks a `size` field naming every file the approach touches, one a line, and `test/contract/process.test.js` holds it
- `spec/guidance/review/design.md` carries a rule weighing the `size` field against the ask, argued in `spec/rationales/design-review.md`, which a case in `test/contract/question-grades.test.js` decides
- `spawnAnswer` in `src/scripts/pull-hand.js` tells the session to spawn the hand in the background and take the next item. A case under `test/level0` decides it
- `./RUNME.sh check` exits 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

Four edits, one a `done_when` line, each beside the test that holds it.

1. `spec/guidance/tickets.md`: a rule after rule 6 sends a one-line change the owner orders to `--process=trivial`, with its failure: a draft, a review and a build spent on one line. An `Examples` row pairs `--process=trivial` on a one-line config change with the standard route on it.
2. `spec/processes/standard.yaml`: `design/draft` gains a `size` evidence field of form `list`, saying every file the approach touches, one a line. `test/contract/process.test.js` asserts the field and its form in the standard route case. `./RUNME.sh ticket update` carries it to the standard tickets still short of `design/draft`.
3. `spec/guidance/review/design.md`: a rule weighs `size` against the ask, and answers `pass with findings` with a row naming the spread where the draft touches files the ask leaves out. It fails nothing, since rule 2 keeps a fail for a fundamental fault. `spec/rationales/design-review.md` argues it under the rule's number. `test/contract/question-grades.test.js` holds one rule naming `size` and the ask.
4. `src/scripts/pull-hand.js` `spawnAnswer`: the second line says to spawn the hand in the background and take the next item, then pull again once it answers. A case under `test/level0` calls `spawnAnswer` and reads the words.

### callers

- `src/scripts/pull-hand.js` `handOut`, the one caller of `spawnAnswer`
- `test/level0/level1.test.js` `spawnPromptIn`, which reads the prompt out of a spawn answer, and keys on the `spawn` word the change leaves standing
- `.claude/skills/level0/lib/schema-mint.js` `mintedNote`, which renders the `size` heading on every standard ticket it mints
- `src/scripts/pull-route.js` `leavesOf`, which reads the draft leaf's evidence for the hand-out
- `test/contract/process.test.js` the case minting every route through real Vale, which reads the new `says` line

### tests

- `test/contract/process.test.js` "the standard route reviews the design once, and its last leaf hands on to the retro", asserting `size` of form `list`
- `test/contract/question-grades.test.js` "the design review note weighs the draft's size against the ask"
- `test/contract/question-grades.test.js` "the tickets note sends a one-line change the owner orders to the trivial route"
- `test/level0/spawn-answer.test.js` "the spawn answer tells the session to spawn in the background and take the next item"

### answers

- first on a first draft

### checked

- every file, function and verb named stands opened: `spawnAnswer`, `handOut`, `spawnPrompt`, both notes, both tests and `standard.yaml`
- the callers list names the one caller of `spawnAnswer`, and the readers of the draft leaf's evidence
- every `done_when` line names its test above, and `./RUNME.sh check` decides the last

## review

<!-- reads the approach against the ask -->

### verdict

pass with findings

- the-hook-awaits-the-spawn: the callers list misses the `tool.call` handler in `.claude/skills/level0/hooks/pull-tool.js`, which reads the spawn answer through `spawnPromptIn` in `.claude/skills/level0/lib/pull.js`, awaits `spawned` and pulls again. The new words tell the session to spawn in the background, so name that handler and keep what it does in step with the words
- the-new-rule-appends: a rule placed after rule 6 in `spec/guidance/tickets.md` renumbers rules 7 to 15, and `spec/rationales/tickets.md` sections 8 to 15 and the `Examples` rows 11 and 14 key on those numbers. Append the rule as rule 16, or renumber every reference with it

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

    ./RUNME.sh branch test test/contract/question-grades.test.js test/contract/process.test.js test/level0/spawn-answer.test.js

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

- the review note names no `size`, and the tickets note names no trivial route, so both cases fail on their match
- the standard draft carries no `size` field, so the route case fails on its form
- the spawn answer says nothing of the background, so its case fails on that match
- what surprises the hand: `spawnAnswer` prints through `console.log`, so the case reads it by swapping that call

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the cases touch the two contract files the ask names and one new file under `test/level0`
- `spawnAnswer` reaches the console door alone, and the case stands a fake in its place
- each case carries the pointer at this ticket
- no fact repeats: each case reads the note that states the rule
- the review rows ride as children: `the-new-rule-appends` shapes the change, and `the-hook-awaits-the-spawn` stands on its own ticket

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->

<!-- the form is command -->

    ./RUNME.sh lint spec/guidance/tickets.md spec/rationales/tickets.md spec/guidance/review/design.md spec/rationales/design-review.md spec/processes/standard.yaml src/scripts/pull-hand.js

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches the four notes, the route and `spawnAnswer`, each one the ask names
- the change reaches no door: the notes and the route are text, and `spawnAnswer` prints
- the rationale sections name the approach, and `pull-hand.js` stands at its line ceiling, so the case carries the pointer
- each rule stands once, and the rationale argues it under the rule's number
- `the-new-rule-appends` holds: the tickets note stands at its rule cap, so the trivial route joins rule 6 and no number moves

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->

<!-- the form is command -->

    ./RUNME.sh branch test test/contract/question-grades.test.js test/contract/process.test.js test/level0/spawn-answer.test.js

### check

<!-- the check is green on the commit -->

<!-- the form is command -->

    ./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

A small ask now stays small at three points.

- Rule 6 of the tickets note sends a one-line change the owner orders to the trivial route.
- The standard draft lists every file it touches under `size`, and rule 7 of the design review weighs that list against the ask.
- The spawn answer tells the lead to spawn the hand in the background and take the next item.

The hook reading the spawn answer still waits on the hand. `the-hook-awaits-the-spawn` carries that.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches the files the ask names, and the rationales arguing its rules
- no door stands in the change, and the spawn case fakes the console
- the rationale sections and the case pointers name this ticket
- each rule stands once, under its note, and the rationales argue it by number
- the review's rule-number row holds, and the hook row rides on its own ticket

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
