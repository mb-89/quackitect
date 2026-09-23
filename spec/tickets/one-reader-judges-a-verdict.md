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
step: design/draft
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

`voiceFaults` in `src/scripts/pull-chapter.js` runs raw Vale over the leaf's
prose and keeps the errors alone. The lint reads a buffer through `heldOver` in
`src/bridge/findings.js`, which awaits the Vale door's `lint`, then runs the
tense reader and names every warning. The pull answers at once, so it awaits
nothing. The road: one reading both sides call, and each runs Vale its own way.

| part | what changes |
|---|---|
| the reading | `proseFound(body, at, found)` in `findings.js` takes Vale's rows, runs `withoutFalsePast` and marks `unreasoned`, and answers the findings |
| the lint | `findingsOver`, which `./RUNME.sh lint` runs, calls `proseFound` over each file |
| the panel | `heldOver` awaits `lint`, then calls `proseFound` over the buffer |
| the pull | `voiceFaults` runs Vale at once, on the config `assemble` writes, then calls `proseFound` |
| the line | `voiceFaults` adds its chapter's first line in the file, so the pull names the line the lint names |
| the level | a finding at error or at warning refuses the hand-back, and names its rule and its line |
| the case | a verdict carrying a semicolon comes back refused, and the lint names the same line of the file |
| the name | `readsProse` in `src/bridge/prose.js` stays the write door's own, which reads a narrower set |

- the cost: two runners of Vale stand, one for the server and one for the command line
- what stays one: the rules, the config and the reading, which is what the ask names
- the road left: a `pull` that awaits changes `work.js`, `retro-new.js` and every pull test
- outside the ask: `askFaults` keeps the same error filter, and a note of its own carries it

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

fail

- Craft: `voiceFaults` drops comment rows, `answered:` rows and headings, so one offset names the wrong line.
- Craft: `prose()` drops a Vale off marker, so the pull runs a rule the lint turns off.
- The pull's `unreasoned` reads text stripped of that marker, so a marker with no reason passes.
- Fix both: keep each row at its file line with its comments, and blank the rows the pull skips.
- Add a case where a field carries a Vale off marker, and the pull and the lint agree.
- Craft: the Vale door's `lint` appends `unreasoned` already, so `heldOver` through `proseFound` names it twice.
- Let the panel's road skip `unreasoned` in `proseFound`, because the door's rows carry it.
- The earlier findings stand answered: the one road, `findingsOver`, the name, the config and the level.

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

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
