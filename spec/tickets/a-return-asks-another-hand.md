---
kind: [[ticket]]
state: open
urgent: true
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
group: the-verbs-take-the-shell
process: [[spec/processes/standard]]
process_hash: 838dd6d003506639
step: implement/tests-red
record:
  - step: design/draft
    hand: box b99ea8ab11a8 · claude-code-remote
    hash_before: 2346bfb7671515923bd92ed5f63ac859dc7ac4db
    hash_after: 2346bfb7671515923bd92ed5f63ac859dc7ac4db
  - step: design/review
    hand: box b99ea8ab11a8 · claude-code-remote · helper-2
    hash_before: 4aa828834db0bf2c6100e02af8049a6186484955
    hash_after: 4aa828834db0bf2c6100e02af8049a6186484955
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->

A step returning twice asks another agent hand. A person answers what a person
owns.

<!-- breaks, as text: what breaks if it is never done -->

| what the engine reads | what it writes |
|---|---|
| a count of returns | a step stamped `by: person` |

`withPersonStep` in `src/scripts/pull-hand.js` holds that. Two disagreements
between an agent drafter and an agent reviewer read as a question for a human.

The count says the two hands disagree. It says nothing about who settles it. So
a group loses a child to a person over a call the box owns.

The rename reaches further than the one stamp:

- `withEngineReader` repairs a step named `person-N` carrying `by: person`
- `branch unblock` demands `by: person` on the successor's first step
- the step name `person-N` reads wrong for a hand that is no person

[[spec/rationales/cloud]] carries the argument.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

- a step returning twice inserts a step an agent takes, and the pull hands it out
- a step returning past the split cap inserts the person step, as it does today
- `./RUNME.sh test test/level0/pull-steps.test.js` answers green
- `./RUNME.sh check` answers 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->
<!-- the form is text -->

No code change. The ask asks back a count the tree took out, and the three
places its rename reaches each hold on their own.

| what the ask reads | what stands |
|---|---|
| a count of returns inserts a step `by: person` | [[spec/design_output/pull#a-count-inserts-no-step]] |
| `withPersonStep` holds that count | `branch escalate` calls it, and a hand runs that verb |
| `person-N` reads wrong for a hand that is no person | every inserted step carries a question a person owns |

The rename reaches three places, and each holds:

- `withEngineReader` repairs the spelling a desk writes, which is `by: person`
- `branch unblock` demands `by: person` on a successor's first step, and [[spec/processes/question]] opens at one
- the name says who owns the question, and a cloud box answers in a person's place

The first done_when line asks back the count [[spec/tickets/refusal-cap-inserts-no-person]] removed. Taking it back costs the ruling that a step a box writes waits for a person the box cannot reach.

The objection this answer meets: `person-N` names a hand where it means a question. The rename costs every ticket carrying the name, the `not:` rule reading it, and the tests pinning it. It buys a reader one word. So the name holds.

What the ticket lands: nothing under `src`. `test/level0/pull-steps.test.js` pins that the cap inserts no step, and `./RUNME.sh check` answers 0. So this ticket closes on the record, and this approach is that record.

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->
<!-- the form is verdict -->

pass

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
