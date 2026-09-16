---
kind: [[ticket]]
state: open
urgency: whenever
steps:
  - name: design
    reads: [[spec/guidance/voice]]
    steps:
      - name: draft
        does: writes the approach the ask calls for
        from: anyone
        by: anyone
        input: ask
        evidence:
          - name: approach
            form: text
            says: the approach here where it takes minutes, or a link to the design output where it takes a note
      - name: review
        does: reads the approach against the ask
        not: draft
        on_fail: draft
        reads: [[spec/guidance/review/reviewing]]
        input: design/draft
        evidence:
          - name: verdict
            form: verdict
            says: pass or fail, with findings one a line
  - name: implement
    reads: [[spec/guidance/code/testing]]
    needs: ["branch test"]
    input: design/draft
    checklist: ["the change touches no file the ask leaves out", "every door the change reaches has a fake", "a comment names the approach the change implements"]
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
      - name: reflect
        does: names the class of error in the findings, and the fix for the class
        when: returned
        input: verdict
        evidence:
          - name: class
            form: text
            says: the class of error the findings describe, and the fix for the class
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
  - name: verdict
    does: reads every hunk against the ask and the approach
    not: implement
    on_fail: implement/reflect
    reads: [[spec/guidance/review/reviewing]]
    input: ["diff", "implement"]
    to: retro
    checklist: ["every fact the change adds stands in one place, and a note points at the file instead of repeating it"]
    evidence:
      - name: read
        form: files
        says: every file you read, one a line
      - name: verdict
        form: verdict
        says: pass or fail, findings one a line
process: [[spec/processes/standard]]
process_hash: 838dd6d003506639
step: verdict
record:
  - step: design/draft
    hand: box d42624a67d18a8
    hash_before: 2b279908840f5dbc02099e199cae2c4d1cf702c4
    hash_after: ad8fa8964fcda9701c09020569303d2ffc2a4c68
  - step: design/review
    hand: box d42624a67d18a8 · helper-2
    hash_before: b5beaec62548f3d5293fa7dfb7260476a7519109
    hash_after: b5beaec62548f3d5293fa7dfb7260476a7519109
    returns: 1
    why: Name the word `namesNote` reads off the prompt. Both done_when cases wait on it, and neither stands decidable meanwhile.; `namesNext` stands nowhere in the tree. Point at `opensATurn` and `questionsIn` in `lib/answer.js`, which read a prompt the same way.; Say which `note` row pays. A growing count pays on any note, so a note on another matter clears the prompt.; Say what the `reply` line carries where a note pays. The demand after it reads `spoken` as the text it saw.; The disk read holds. The box carries the disk door, a fake stands beside it, and `ticket note` writes the row.; `./RUNME.sh check` answers 0.
  - step: design/draft
    hand: box d42624a67d18a8
    hash_before: 5b321a32db7820ab4e93b5c5c58a3822c25be3cf
    hash_after: 0f968e6f463d0daf6b7997dba237973161af09a1
  - step: design/review
    hand: box d42624a67d18a8 · helper-4
    hash_before: 6853a76e6e4c0494805f7f84fda8691753db2091
    hash_after: 6853a76e6e4c0494805f7f84fda8691753db2091
  - step: implement/tests-red
    hand: box d42624a67d18a8
    hash_before: 655c1a96a49b95167e9862e0cf8c3a083fe47400
    hash_after: 4b5637c3a298f441b08b10fafce582e2e6112969
    answered:
      - name: tests
        exit: 1
        said: assertion, 3 test(s) fail on their own assertion
  - step: implement/reflect
    skipped: true
    why: the ticket arrives here by no on_fail
  - step: implement/change
    hand: box d42624a67d18a8
    hash_before: f907cdf6f00146b86b5d0843ff5bf7dceacf0da9
    hash_after: 87f26a61c37275f722adfa03bb3f07b49490d96b
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
  - step: implement/tests-green
    hand: box d42624a67d18a8
    hash_before: 136662ac66923e8145bc4ef070e7e06a27efd304
    hash_after: 2c2789787206d1d15fabacb5f242e371b4c2377d
    answered:
      - name: tests
        exit: 0
        said: green, 5 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: 64 stand at warning, which the panel draws and check allows.
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

The answer door reads the `note` row off the log where the prompt names a note. So a prompt that parks a note meets its answer in the log, and the readback stays owed everywhere else.

Today a note answers a prompt on paper alone. The door sees the session's text, so a noted prompt still counts as unanswered and the gate holds the turn.

- `./RUNME.sh branch test` passes a case where a prompt naming a note clears the owed answer
- `./RUNME.sh branch test` passes a case where a note leaves every other prompt owed
- `./RUNME.sh check` answers 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

| what changes | how |
|---|---|
| the answer library | answers whether a prompt names a note, and counts the `note` rows a log holds |
| the answer door | counts at the prompt, counts again before it refuses, and pays on a new row |
| the level zero note | says which prompt a note answers, under the owner's prompt chapter |

A prompt naming a note opens a demand that a note row pays. `namesNote` in
`lib/answer.js` reads the prompt for the word `note`, beside `questionsIn` and
`opensATurn`, which read a prompt the same way. A prompt naming none opens the
demand it opens today, and a note row leaves that one standing.

| what the prompt carries | whether the demand reads a note |
|---|---|
| `note`, `notes` or `noted`, as a word | yes |
| the word inside a fenced block | no, the way `questionsIn` skips a fence |
| no such word | no |

The note row lands from the shell, so the server's own rows miss it. The door
reads the session log off the disk instead, at the path the log door names,
and counts the rows of kind `note`. The demand keeps the count it reads at the
prompt, and a row past that count pays it. So a note on another matter pays
the demand too, because a hand parking a note answers the prompt that asks for
one.

The reply line the payment writes carries the note's own text, off the row,
and `detail` names the prompt it answers. So `spoken` reads the note, and the
next demand sees what the log carries. The door's box carries the disk, and a
fake disk stands beside it, so each case runs in memory.

For details, see [[spec/design_output/level0#the-owners-prompt-comes-first]].

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

pass

- `namesNote` reads `note`, `notes` or `noted` as a word outside a fence, so both cases decide.
- `questionsIn` and `opensATurn` stand in `lib/answer.js`, where the approach points.
- The row that pays stands named: a `note` row past the count the prompt reads. The approach owns the consequence that any note pays.
- The payment's reply line carries the note's text and names the prompt under `detail`. So the next demand reads `spoken` as that text.
- The disk read holds: the box hands the door its disk and its root. A fake disk goes in beside them, and `ticket note` writes the row.
- `./RUNME.sh check` answers 0.
- `./RUNME.sh branch review` finds the branch nowhere, because this ticket reaches code at implement.
- Carry into the change: the count lands at the prompt door, and the recount at the spoke door.

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

    ./RUNME.sh branch test test/level0/note-answer.test.js

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

Five cases stand, and three fail on their own assertion. The two readers answer a stub each, so the reading cases fail and the door cases follow. What surprises me is the fourth case: a prompt asking for no note already leaves the demand standing, so it passes green from the start. It holds the change honest, because a reader that pays every prompt turns that case red.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches no file the ask leaves out. One test file stands new, and the library takes two stubs
- every door the change reaches has a fake. The case builds the box on `fakeDisk`, and the log door is a list
- a comment names the approach the change implements. The test header points at the chapter the change writes

## reflect

<!-- names the class of error in the findings, and the fix for the class -->

### class

<!-- the class of error the findings describe, and the fix for the class -->

<!-- the form is text -->

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->

<!-- the form is command -->

    ./RUNME.sh lint .claude/skills/level0/lib/answer.js src/bridge/answer.js test/level0/note-answer.test.js spec/design_output/level0.md

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches no file the ask leaves out. The library, the door, the test and the level zero note
- every door the change reaches has a fake. The reader takes the disk door, and each case builds it fake
- a comment names the approach the change implements. Each new function points at the note's new chapter

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->

<!-- the form is command -->

    ./RUNME.sh branch test test/level0/note-answer.test.js

### check

<!-- the check is green on the commit -->

<!-- the form is command -->

    ./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

A prompt asking for a note now takes a parked note as its answer. Two readers stand in the answer library. One reads the prompt for the word `note` outside a fence. The other counts the `note` rows the session log carries. The door keeps that count on the demand, counts again at every call, and a new row pays with the note's own text. Every other prompt still owes a text answer, because the door counts nothing for it.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches no file the ask leaves out. The library, the door, one test and the level zero note
- every door the change reaches has a fake. The reader takes the disk door, and each case builds it fake
- a comment names the approach the change implements. Each new function points at the note's new chapter

# verdict

<!-- reads every hunk against the ask and the approach -->

## read

<!-- every file you read, one a line -->

<!-- the form is files -->

## verdict

<!-- pass or fail, findings one a line -->

<!-- the form is verdict -->

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
