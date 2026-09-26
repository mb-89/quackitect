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
    hash_before: 0358075ccf3188c52d5fc0d024d2aa4d63b8b50c
    hash_after: 0358075ccf3188c52d5fc0d024d2aa4d63b8b50c
  - step: design/review
    hand: box fcc1ba4a896f · claude-code-remote · helper-2
    hash_before: a840802db4ca6b1b887cc84c022c3c7ecd6b5889
    hash_after: a840802db4ca6b1b887cc84c022c3c7ecd6b5889
  - step: implement/tests-red
    hand: box fcc1ba4a896f · claude-code-remote
    hash_before: 2ed52ea596e1c12f46a2caaba0dcb5aec95320fd
    hash_after: 2ed52ea596e1c12f46a2caaba0dcb5aec95320fd
    answered:
      - name: tests
        exit: 1
        said: assertion, 6 test(s) fail on their own assertion
---

# Ask

The owner's words reach the ask, the helper and the next session as the owner says them. A build then answers the ask the owner makes.

A handover and a brief carry the agent's reading under the owner's name. An ask minted off a handover reaches a build with no owner read. The owner then asks what a coined word means.

- `spec/schemas/handover.schema.yaml` asks a chapter of the owner's words, each a verbatim quote with its session and line. A case in `test/level0/schema.test.js` draws a finding over a handover lacking that chapter
- `spec/processes/note.yaml` carries an ask field for the owner's quoted words with their transcript line. A case in `test/level0/process.test.js` holds it
- a ticket minted off a handover line carries a person leaf the owner passes before `design/draft`. A case in `test/level0/pull-person.test.js` decides it
- the vocabulary rule of `spec/guidance/voice.md` takes the owner's word for a thing before a coined word. `spec/vocabulary/terms.yml` carries the owner's words for the sidebar button, the work tab and its brackets
- `./RUNME.sh check` exits 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

Each carrier gains a place for the owner's quoted words, and a read of the owner's own gates a ticket minted off a handover.

| carrier | change |
|---|---|
| `spec/schemas/handover.schema.yaml` | a required section `The owner's words` |
| `spec/processes/note.yaml` | an ask field `said`, of form `list` |
| `spec/processes/standard.yaml` | an ask line `from:`, and a person leaf `owner-read` |
| `src/scripts/pull-hand.js` | a `handed` condition in `holdsHere` |
| `spec/guidance/voice.md` | rule 15 takes the owner's word first |
| `spec/vocabulary/terms.yml` | the owner's words for three things |

The handover section says: each line a verbatim quote, with its session and transcript line.

The note field `said` says: the owner's quoted words, with their transcript line.

The `owner-read` leaf stands first under `design`, before `draft`. It carries `by: person` and `when: handed`, with one `verdict` field `read`.

The `handed` condition holds where the Ask carries a line `from: handover`. It reads the Ask through the same line reader the `view` condition of `the-owner-view-decides-done` adds, so this ticket depends on that one.

Rule 15 gains a sentence: take the owner's word for a thing before a coined word.

The owner's words for the sidebar button, the work tab and its brackets stand in no file on this box. The build mints a question ticket asking the owner for them. The three terms land when the answer does.

### callers

- `src/scripts/pull-hand.js` `advanced`, which calls `holdsHere` on the leaf it stands on
- `src/scripts/pull-writes.js` the skip pass after a hand-back, which calls `holdsHere` on each next leaf
- `src/scripts/ticket.js` `opensDraft`, whose first leaf becomes `design/owner-read` on a standard ticket
- `.claude/skills/level0/lib/schema-mint.js` `mintedNote`, which renders the new handover section and ask fields
- `test/contract/process.test.js` the standard route case, whose leaf list gains `design/owner-read`
- every writer of `.se/HANDOVER.md`, which the build finds with `./RUNME.sh find HANDOVER`

### tests

- `test/level0/schema.test.js` "a handover lacking the owner's words draws a finding"
- `test/level0/process.test.js` "the note route asks for the owner's quoted words with their transcript line"
- `test/level0/pull-person.test.js` "a ticket minted off a handover waits on the owner's read before its draft"
- `test/level0/pull-person.test.js` "a ticket minted off no handover skips the owner's read"
- `test/contract/question-grades.test.js` "the voice note takes the owner's word before a coined word"

### answers

- first on a first draft

### checked

- every file, function and verb named stands opened, and the handover schema, the note route and rule 15 read as the table says
- the callers list names both callers of `holdsHere`, the mint, the open and the handover writers the build finds
- every `done_when` line names its test above, and the terms line waits on the owner's answer

## review

<!-- reads the approach against the ask -->

### verdict

pass with findings

- handed-condition-in-pull-when: `holdsHere` stands in `src/scripts/pull-when.js` now, and `src/scripts/pull-hand.js` only re-exports it. `viewOf` reads the `view:` line alone, so the `handed` condition lands in `pull-when.js` with a `from:` reader beside `viewOf`, or one Ask-line reader both share
- handover-mark-has-no-writer: no code writes `from: handover` on a ticket minted off a handover, so the minting agent decides whether the owner's read gates it. Name the writer that stamps the line, or the door that refuses a mint off a handover without it
- owner-terms-await-question: the build leaves the `done_when` line on `spec/vocabulary/terms.yml` unmet, because the owner's three words stand in no file. The child asks the owner for them and lands the three terms
- draft-size-past-ask: the draft carries no `size` list, and its route copy predates the `size` field of `spec/processes/standard.yaml`. The approach reaches files the ask leaves out: `spec/processes/standard.yaml`, `src/scripts/pull-when.js`, `.claude/skills/level0/lib/schema-mint.js`, `test/contract/process.test.js`, `test/contract/question-grades.test.js`, and every handover writer

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

    ./RUNME.sh branch test test/contract/handover-words.test.js test/contract/process.test.js test/level0/pull-when.test.js test/level0/pull-person.test.js test/contract/question-grades.test.js

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

- the handover schema names no chapter of the owner's words, so the finding case fails
- the note and standard routes carry no `said`, `from` or `owner-read`, so both route cases fail
- `holdsHere` names no `handed`, and a cloud agent writes the read, so those cases fail
- the voice note names no owner's word, so the grade case fails
- what surprises the hand: the handover and route cases read shipped files, so they stand in `test/contract`

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the cases touch the test files the ask names, and a contract file for the shipped handover schema
- the level zero cases take fakes, and the contract cases read the real tree
- each case carries the pointer at this ticket
- each case reads the note, the schema or the route that states the fact
- the review rows ride in: `handed` in `pull-when.js`, a mint writer for `from: handover`, and the size; the terms wait on `the-owner-names-three-things`

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
