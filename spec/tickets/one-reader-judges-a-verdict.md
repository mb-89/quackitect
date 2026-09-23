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
    hand: box d6f05e3a585030 · claude-code
    hash_before: 6388bfc8c7744c1601fc2c8c2903b7c987b3f8a1
    hash_after: 6388bfc8c7744c1601fc2c8c2903b7c987b3f8a1
  - step: design/review
    hand: box d6f05e3a585030 · claude-code · helper-2
    hash_before: f8399f297b77c05f6b11b20af2cb5cc81d57a959
    hash_after: f8399f297b77c05f6b11b20af2cb5cc81d57a959
    returns: 1
    why: "Design: `pull` returns its exit at once, and `heldOver` waits on the Vale door's `lint`. The approach names no bridge.; Name one road in the approach, and its cost.; The first road makes `pull` wait, and `work.js`, `retro-new.js` and the pull tests wait on it.; The second road keeps `voiceFaults` returning at once, and calls the pieces `heldOver` puts together.; Those pieces are the config `assemble` writes, `withoutFalsePast` and `unreasoned`.; The level and the case match the ask. The semicolon rule `Characters` stands at warning.; Outside the ask, `askFaults` in `ticket-ask-lint.js` keeps the same error filter. Park it on a ticket of its own."
  - step: design/draft
    hand: box d6f05e3a585030 · claude-code
    hash_before: 082f659ecaa2e66253b7ccc773a15bfc7607d4fa
    hash_after: 082f659ecaa2e66253b7ccc773a15bfc7607d4fa
  - step: design/review
    hand: box d6f05e3a585030 · claude-code · helper-4
    hash_before: 53ec88cd6ece1657a8e62a431d1719dbd2880035
    hash_after: 53ec88cd6ece1657a8e62a431d1719dbd2880035
    returns: 2
    why: "Design: `./RUNME.sh lint` runs `findingsOver` through `cli-read.js`, and `heldOver` serves the editor panel alone.; `findingsOver` reads through `readThrough`, so the lint keeps a reader of its own on this road.; Name `findingsOver` as a caller of the shared reading, beside `heldOver` and `voiceFaults`.; Design: a `readsProse(box, text, found)` stands in `prose.js` already, and the write door calls it.; That reader holds vetoes the lint lacks: the sentence length and the word outside the vocabulary.; Give the shared reading a name apart from `readsProse`, so one name reads one thing.; Craft: `voiceFaults` counts a line from its chapter, and the lint counts it from the file.; Add the chapter's offset in the case, so the pull and the lint name the same line.; The road, its cost, the level and the case match the ask."
  - step: design/draft
    hand: box d6f05e3a585030 · claude-code
    hash_before: c8fa599fb6c6adb54cde39041f9065aaeb3a5fd3
    hash_after: c8fa599fb6c6adb54cde39041f9065aaeb3a5fd3
  - step: design/review
    hand: box d6f05e3a585030 · claude-code · helper-6
    hash_before: bbec4828850a918d39ea6f10e5a74b681e1c204c
    hash_after: bbec4828850a918d39ea6f10e5a74b681e1c204c
    returns: 3
    why: "Craft: `voiceFaults` drops comment rows, `answered:` rows and headings, so one offset names the wrong line.; Craft: `prose()` drops a Vale off marker, so the pull runs a rule the lint turns off.; The pull's `unreasoned` reads text stripped of that marker, so a marker with no reason passes.; Fix both: keep each row at its file line with its comments, and blank the rows the pull skips.; Add a case where a field carries a Vale off marker, and the pull and the lint agree.; Craft: the Vale door's `lint` appends `unreasoned` already, so `heldOver` through `proseFound` names it twice.; Let the panel's road skip `unreasoned` in `proseFound`, because the door's rows carry it.; The earlier findings stand answered: the one road, `findingsOver`, the name, the config and the level."
  - step: design/draft
    hand: box d6f05e3a585030 · claude-code
    hash_before: d249c7ad3c9e636993efcbf6a332fc35f94524b9
    hash_after: d249c7ad3c9e636993efcbf6a332fc35f94524b9
  - step: design/review
    hand: box d6f05e3a585030 · claude-code · helper-8
    hash_before: d7f0f03da88d7e7a7c5d60d27640541cd4451032
    hash_after: d7f0f03da88d7e7a7c5d60d27640541cd4451032
    returns: 4
    why: "Design: `./RUNME.sh lint` reads through `findingsOver` in `cli-read.js`, and `lintText` serves the write door and the panel.; So the pull matches the door's reading, and the lint keeps a reader of its own.; Fix the opening line, and name `findingsOver` as the reading the pull matches.; Hand `valeArgv` the config `assemble` writes, as `configOf` in `findings.js` does.; Hold the marker case with `linesNamed`: the pull's list against `findingsOver` over the same ticket.; The rest stands answered: the split, the whole file, the chapter's lines, the markers, the level and the panel."
  - step: design/draft
    hand: box d6f05e3a585030 · claude-code
    hash_before: 0837bf964c36de8122ba7944723ed7dcf64d4726
    hash_after: 0837bf964c36de8122ba7944723ed7dcf64d4726
  - step: design/review
    hand: box d6f05e3a585030 · claude-code · helper-10
    hash_before: 68fe23a594f6f1c4fe8c5c29e65bfe2ca67a2f2d
    hash_after: 68fe23a594f6f1c4fe8c5c29e65bfe2ca67a2f2d
  - step: implement/tests-red
    hand: box d6f05e3a585030 · claude-code
    hash_before: a2854316e3e489f43a376e674999ce1a43a69e2e
    hash_after: a2854316e3e489f43a376e674999ce1a43a69e2e
    answered:
      - name: tests
        exit: 1
        said: assertion, 6 test(s) fail on their own assertion
  - step: implement/reflect
    skipped: true
    why: the ticket arrives here by no on_fail
  - step: implement/change
    hand: box d6f05e3a585030 · claude-code
    hash_before: c73124fb3c3b4734cbe93b97542d61080513749e
    hash_after: c73124fb3c3b4734cbe93b97542d61080513749e
    answered:
      - name: lint
        exit: 0
        said: The rules pass.
  - step: implement/tests-green
    hand: box d6f05e3a585030 · claude-code
    hash_before: dd6175bdfc702c29f62e2726960d3831bcd6df26
    hash_after: d1d33433cfc66bf6d1b45dd9b72616446ab9f487
    answered:
      - name: tests
        exit: 0
        said: green, 6 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: The rules pass.
---

# Ask

A hand-back and the lint read one evidence field the same way. A verdict that
passes the pull leaves no warning for the refactoring hand. Today the pull's
voice check passes a verdict carrying semicolons and long list items.
`./RUNME.sh lint` names each line at warning the moment the hand-back lands.

So a review hand writes what the pull takes, and the next lint over the tree
carries the debt. The evidence a ticket holds is prose the tree tracks, and one
reader over it costs less than two readers disagreeing. For details, see
[[spec/design_output/pull#the-voice-reads-the-evidence]].

- the pull reads a hand-back's fields with the rules the lint holds over a ticket, at the same level
- a case feeds the pull a verdict carrying a semicolon. The hand-back comes back refused where the lint would warn
- `./RUNME.sh check` answers 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

`voiceFaults` in `src/scripts/pull-chapter.js` runs raw Vale over a copy of the
leaf's chapter, on the method's `.vale.ini`, and keeps the errors alone.
`./RUNME.sh lint` runs `findingsOver` in `src/bridge/findings.js`, through
`readingFor` in `src/scripts/cli-read.js`. That reads the files on disk, on the
config `configOf` has `assemble` write, then runs `readThrough` and
`unreasoned`. The road: the pull reads its ticket through the parts of
`findingsOver`, and hands them its text in memory.

| part | what changes |
|---|---|
| the call | `valeArgvOf(it)` in `findings.js` builds Vale's argument list on `configOf`, and `findingsOver` takes it |
| the reading | `readsText(it, file, text, rows)` runs `withoutFalsePast` and `unreasoned` over one file's text, and `findingsOver` calls it per file |
| the pull | `voiceFaults` runs `valeArgvOf` with the whole ticket on stdin and `--path` naming it, then `readsText` |
| the text | the pull lays its fields into the ticket text in memory, so lines and Vale markers read as the lint reads them |
| the lines | the pull keeps the findings on its chapter's lines |
| the level | a finding at error or at warning refuses the hand-back |
| the cases | a semicolon refuses, and `linesNamed` holds the pull's list against `findingsOver` over the same ticket, a marker included |

- the cost: `findingsOver` awaits its run, and the pull runs Vale at once, so two runners stand
- what stays one: the argument list, the config, the per-file reading and the lines
- the panel: `heldOver` keeps its road
- outside the ask: `askFaults` keeps the same error filter, and a note of its own carries it

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

pass

- The opening line names `findingsOver` through `readingFor` as the reading the pull matches.
- `valeArgvOf` hands the pull and the lint one config, the one `configOf` has `assemble` write.
- `readsText` gives the pull and `findingsOver` one reading over a file's text.
- The case holds the pull's list against `findingsOver` with `linesNamed`, a marker included.
- The level covers every rule the tree holds, because no rule stands at suggestion.
- The cost stands named: two runners over one argument list.

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

    ./RUNME.sh branch test test/level0/one-reader.test.js

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

Six cases fail, each on its own assertion. The pull passes a verdict carrying a
semicolon, and hands Vale the chapter alone. It runs Vale on the method's
`.vale.ini`, where the lint runs it on `.vale.ini` under its root.

- the fake disk lists nothing for a file path, where the real disk throws, and a note carries it
- `pull-fields.test.js` holds the voice off the `files` field, so the change blanks the rows the pull skips
- a Vale marker with no reason refuses the hand-back through `ExemptionCarriesAReason`, beside the warning level

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the tests touch one new file, which the ask names through its case
- every door the cases reach has a fake: the disk, the process and the Vale run
- a comment above each case names the approach through its pointer

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

    ./RUNME.sh lint src/bridge/findings.js src/scripts/pull-chapter.js src/scripts/pull.js spec/design_output/pull.md

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches the two readers the ask names, their one caller, and the chapter
- every door the change reaches has a fake: the disk, the process and the Vale run
- a comment names the approach on each changed function, through its pointer

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->

<!-- the form is command -->

    ./RUNME.sh branch test test/level0/one-reader.test.js

### check

<!-- the check is green on the commit -->

<!-- the form is command -->

    ./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

The pull and the lint read a hand-back's prose one way. `valeArgvOf` opens
Vale on the config the assembly writes, and `readsText` reads one file's text
through the tense reader and the marker rule. `findingsOver` calls both for the
lint. `voiceFaults` hands Vale the whole ticket, with the fields laid in and the
rows it skips blanked, and keeps the findings on its chapter's lines. A warning
now refuses the hand-back, where an error alone did before.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches the two readers the ask names, their one caller, and the chapter
- every door the change reaches has a fake: the disk, the process and the Vale run
- a comment names the approach on each changed function, through its pointer

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
