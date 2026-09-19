---
kind: [[ticket]]
state: open
urgency: soon
group: the-person-step-holds
step: implement/tests-red
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
    needs: ["work test"]
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
process: [[standard]]
process_hash: d1fd9cd113889f29
depends_on: ["the-hand-carries-the-session"]
record:
  - step: design/draft
    hand: box ca870d4f20f4 · claude-code-remote
    hash_before: 1bbe6425e3ec1e220543c75c1b4f98d7b954c541
    hash_after: 1bbe6425e3ec1e220543c75c1b4f98d7b954c541
  - step: design/review
    hand: box ca870d4f20f4 · claude-code-remote · helper-2
    hash_before: 003a26300982a422dc0386133689d824f5667990
    hash_after: 003a26300982a422dc0386133689d824f5667990
---

# Ask

A step whose `by` is `person` waits for a person. Today nothing stops an agent from handing it back. The approach stands in [[spec/design_output/pull#the-hand-rule]]. The owner's words stand in [[spec/design_input/the-agent-pulls-tickets#hands]]. A person reads the design phase here, because the group behind it waited on one. Done is three things:

- the pull refuses a hand-back on a `by: person` step where the environment names an agent's harness. The refusal names the step.
- a person's hand reads as their git author name off a harness, and the record names it so
- `work.personSigns` switched on makes a person's hand-back on a tracked ticket meet a signed tip. An unsigned tip refuses the hand-back, and the refusal names the tip.

| the piece | where | proves it |
|---|---|---|
| the person's hand | `src/scripts/pull.js` | the verb refuses `by: person` where the environment names an agent's harness |
| `work.personSigns` | the config and `src/scripts/pull.js` | switched on, a person's hand-back needs a signed commit |

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

The design output carries the approach, and this change adds the signing door. For details, see [[spec/design_output/pull#the-hand-rule]].

| the piece | where it stands |
|---|---|
| the refusal on a `by: person` step where the environment names a harness | `handFaults`, standing |
| the hand a box off a harness reads | `handOf`, standing, and it answers the role alone |
| `work.personSigns` | this change, in the config and the hand-back |

The signing door reads the tip through the git door.

- the key reads false where nothing names it, so a tree keeps the door it has
- switched on, a person's hand-back on a tracked ticket reads the tip's signature
- `good` and `untrusted-good` pass, and another word comes back refused, naming the tip
- an agent's hand-back reads no signature, and a private ticket reads none

The second piece of the ask wants a person's git author name in the hand. The hand-rule chapter says both, and the two halves land in different places.

| where the name can stand | what the rule says |
|---|---|
| the hold, which git ignores | the chapter writes the name there |
| the record, which git tracks | the chapter writes the role alone, and the voice rule holds a tracked file to it |

So the hold takes the name and the record takes the role. The review leaf reads whether that answers the ask, because a person owns the call.

<!-- the form is text -->

## review

<!-- reads the approach against the ask -->

### verdict

pass

- the split answers the ask: the hold, which git ignores, takes the name, and the record takes the role
- the voice rule and the hand-rule chapter decide that already, so the call needs no person
- `handOf` feeds the hold's file name and the record's hand alike, so name where the name enters
- the ask names `src/scripts/pull.js`, and the refusal stands in `handFaults` under `src/scripts/pull-chapter.js`
- the `work` group in the config schema carries the other counts alone, so add `personSigns` with its help line
- the git door answers `lastAuthor`, so add the signature read beside it and let a fake process fake it
- the refusal on a `by: person` step stands today, so the first bullet asks for a test
- a person's name in the hand changes the hold's file name, so say what a standing hold does

<!-- the form is verdict -->

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the same tests pass -->

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

- this ticket splits off [[spec/tickets/step-changes-hands]], which waited at a person step. The branch behind it closes, and the branches waiting on it move.
