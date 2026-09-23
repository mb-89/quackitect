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
`src/bridge/findings.js`, which runs Vale through the tense reader and the code
faults, and names every warning.

| part | what changes |
|---|---|
| the reader | `voiceFaults` hands the chapter text to `heldOver` at the ticket's own path, through the Vale door's `lint` |
| the level | a finding at error or at warning refuses the hand-back, and names its rule and its line |
| the case | a verdict carrying a semicolon comes back refused, and the same text passes the lint once mended |
| the note | the chapter in `spec/design_output/pull.md` names the one reader and the level |

So the push door meets no warning a hand-back wrote, and one reader holds both.

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

fail

- Design: `pull` returns its exit at once, and `heldOver` waits on the Vale door's `lint`. The approach names no bridge.
- Name one road in the approach, and its cost.
- The first road makes `pull` wait, and `work.js`, `retro-new.js` and the pull tests wait on it.
- The second road keeps `voiceFaults` returning at once, and calls the pieces `heldOver` puts together.
- Those pieces are the config `assemble` writes, `withoutFalsePast` and `unreasoned`.
- The level and the case match the ask. The semicolon rule `Characters` stands at warning.
- Outside the ask, `askFaults` in `ticket-ask-lint.js` keeps the same error filter. Park it on a ticket of its own.

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
