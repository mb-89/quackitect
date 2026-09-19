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
    hash_before: 0fddd7795268d137fafe613adb9ccc2caff0edb2
    hash_after: 0fddd7795268d137fafe613adb9ccc2caff0edb2
  - step: design/review
    hand: box ca870d4f20f4 · claude-code-remote · helper-2
    hash_before: 28e4aaa68a8dff1d6cbf41d55ca95c2ec6758098
    hash_after: 28e4aaa68a8dff1d6cbf41d55ca95c2ec6758098
---

# Ask

A hand that cannot go on without a person has no verb to say so. A ticket that fails back again and again meets no person either. The approach stands in [[spec/design_output/pull#a-person-step-goes-in]]. The owner's words stand in [[spec/design_input/the-agent-pulls-tickets#escalation-is-a-step]]. A person reads the design phase here, because the group behind it waited on one. Done is four things:

- `branch escalate <question>` inserts a person step before the held leaf, with the question under `asks` and one `answer` field. It points `step` at it, drops the hold, commits and pushes.
- `--options a,b,c` makes the answer a `choice`, and one of the words passes
- a hand-back refused `work.refusalsBeforePerson` times in a row inserts a person step carrying the findings, through the same function
- a ticket carrying `work.stepsBeforeSplit` person steps refuses another and answers the ask. Its close waits for the successors.

| the piece | where | proves it |
|---|---|---|
| `branch escalate <question>` | `src/scripts/pull.js` | it inserts a person step with `asks` and one `answer` field, and points `step` at it |
| `options` | `src/scripts/pull.js` | an `asks` with options takes a `choice` answer, and one word passes |
| the refusal count | `src/scripts/pull.js` | `work.refusalsBeforePerson` inserts a person step with the findings |
| the split refusal | `src/scripts/pull.js` | past `work.stepsBeforeSplit` the pull answers the ask, and the close waits for the successors |

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

The design output carries the approach, and this change adds the verb a hand reaches it by. For details, see [[spec/design_output/pull#a-person-step-goes-in]].

| the piece | where it stands |
|---|---|
| the inserter, which puts a `person-<n>` step before a target with the question under `asks` | `withPersonStep`, standing |
| the choice answer, which options turn on | `withPersonStep`, standing, and this change hands it the words |
| the count that inserts a step where hand-backs meet refused in a row | the hand-back, standing |
| the split refusal past the cap a ticket carries | `withPersonStep`, standing |
| `branch escalate <question>`, which a hand runs | this change |

The verb stands beside the other verbs the branch carries, and it reads the hold the pull writes.

- it puts the step before the held leaf through the inserter, and points `step` at it
- `--options a,b,c` makes the answer a `choice`, and the inserter writes the words under it
- it drops the hold, commits by ticket and step, pushes, and hands out the next ticket
- a run with no hold standing comes back refused, naming the pull

<!-- the form is text -->

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

pass

- The refusal count inserts no step. For details, see [[spec/design_output/pull#a-count-inserts-no-step]].
- So drop the count row from the table, and say that the ask's third bullet retires there.
- The verb list stands in `src/scripts/pull-route.js`, and the dispatch in `src/scripts/work.js`. Name both.
- Say which exit the verb answers where the split cap refuses the insertion.
- `withPersonStep` writes `options` under the answer field. Say whether the verb writes the step's `options` too.
- Name the exit and the line a run without a hold answers.

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
- the rule to hold: a gate the mint writes and an escalation the engine inserts are one mechanism. An inserted step counts for no `not`.
