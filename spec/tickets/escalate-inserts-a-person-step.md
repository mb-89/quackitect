---
kind: [[ticket]]
state: closed
urgency: soon
group: the-person-step-holds
step: verdict
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
  - step: implement/tests-red
    hand: box ca870d4f20f4 · claude-code-remote
    hash_before: f7b961379060c6e31bca5edc5f2885ccb1380c74
    hash_after: f7b961379060c6e31bca5edc5f2885ccb1380c74
    answered:
      - name: tests
        exit: 1
        said: assertion, 3 test(s) fail on their own assertion
  - step: implement/reflect
    skipped: true
    why: the ticket arrives here by no on_fail
  - step: implement/change
    hand: box ca870d4f20f4 · claude-code-remote
    hash_before: 05d641fd589c62be16ddef21b97dc38d2e2ce9eb
    hash_after: 05d641fd589c62be16ddef21b97dc38d2e2ce9eb
    answered:
      - name: lint
        exit: 0
        said: 87 stand at warning, which the panel draws and check allows.
  - step: implement/tests-green
    hand: box ca870d4f20f4 · claude-code-remote
    hash_before: 752ea879514d77efac881b2c03b0d00f06f6a81e
    hash_after: 752ea879514d77efac881b2c03b0d00f06f6a81e
    answered:
      - name: tests
        exit: 0
        said: green, 54 test(s) pass in 4 file(s)
      - name: check
        exit: 0
        said: 87 stand at warning, which the panel draws and check allows.
  - step: verdict
    hand: box ca870d4f20f4 · claude-code-remote · helper-7
    hash_before: 94d33e9246c0766e02004115505bb13bdcfd05e3
    hash_after: 94d33e9246c0766e02004115505bb13bdcfd05e3
reason: done
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

    ./RUNME.sh branch test

<!-- the form is command -->

### seen

Three tests stand red on the verb the ask names, and each fails because no verb answers `branch escalate` yet.

| the test | what it claims |
|---|---|
| `branch escalate` inserts a person step before the held leaf | the step lands, `step` points at it, the hold drops, one commit and one push follow |
| `branch escalate --options` writes a choice answer | the answer takes the `choice` form and carries the words |
| `branch escalate` with no hold standing refuses | the answer reads refused, and names the pull |

A fourth test stands green beside them. It holds the split cap, which `withPersonStep` already refuses at.

The ask's third bullet surprises a reader, and the review leaf names it first.

- the bullet asks the refusal count to insert a person step
- [[spec/tickets/refusal-cap-inserts-no-person]] closes done on this branch, and rules that road out
- [[spec/design_output/pull#a-count-inserts-no-step]] owns the ruling, so the bullet retires here

The review leaf also names two files the ask's table leaves out. The verb list stands in `pull-route.js` and the dispatch map in `work.js`, so a new verb touches both.

<!-- the form is text -->

### checked

- the ask names one file, and the verb list and the dispatch stand beside it
- the cases drive the fake doors beside them, and the change adds no door
- each test points at the design output chapter holding the approach

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

    ./RUNME.sh lint

<!-- the form is command -->

### checked

- the verb lands in the file the ask names, and its list and dispatch stand where the review leaf says
- the cases drive the fake doors beside them, and the change adds no door
- the verb carries one line pointing at the design output chapter holding the approach

<!-- the form is checklist -->

## tests-green

<!-- makes the tests pass -->

### tests

    ./RUNME.sh branch test

<!-- the form is command -->

### check

    ./RUNME.sh check

<!-- the form is command -->

### says

A hand reaching no answer without a person now says so, and `branch escalate <question>` is the one road a step goes in by.

| what the verb reads | what it writes |
|---|---|
| the hold the pull writes | a `person-<n>` step before the held leaf, with the question under `asks` |
| `--options a,b,c` | the answer's `choice` form, carrying the words |
| nothing in hand | a refusal naming the pull |

The verb reads the hold, puts the step in through `withPersonStep`, and points `step` at it. Then it drops the hold, commits by ticket and step, pushes, and hands out the next ticket.

The review leaf asks four things, and each one answers here.

| what it asks | what stands |
|---|---|
| the exit where the split cap refuses | one, and the inserter's own line says to split the ticket |
| the exit and the line with no hold standing | one, and the line names `./RUNME.sh branch pull` |
| whether the verb writes the step's own options | it writes them under the answer field alone |
| the verb list and the dispatch | `BRANCH` in `pull-route.js`, and the map in `work.js` |

The ask's third bullet retires here. [[spec/tickets/refusal-cap-inserts-no-person]] closes done on this branch, and [[spec/design_output/pull#a-count-inserts-no-step]] owns the ruling. So a count inserts no step, and this change writes none.

<!-- the form is text -->

### checked

- the verb lands in the file the ask names, and its list and dispatch stand where the review leaf says
- the cases drive the fake doors beside them, and the change adds no door
- the verb carries one line pointing at the design output chapter holding the approach

<!-- the form is checklist -->

# verdict

<!-- reads every hunk against the ask and the approach -->

## read

<!-- every file you read, one a line -->

- .claude/commands/se-config-work-failsBeforeWait.md
- .claude/commands/se-config-work-refusalsBeforeFail.md
- .claude/commands/se-config-work-refusalsBeforePerson.md
- spec/config/level0.json
- spec/config/level0.schema.json
- spec/design_output/pull.md
- spec/design_output/work.md
- spec/tickets/escalate-inserts-a-person-step.md
- spec/tickets/person-step-refuses-an-agent.md
- spec/tickets/refusal-cap-inserts-no-person.md
- spec/tickets/the-group-leaves-at-todo.md
- src/scripts/branch-usage.js
- src/scripts/cli-doors.js
- src/scripts/guidance-hand.js
- src/scripts/hand.js
- src/scripts/landed.js
- src/scripts/pull-hand.js
- src/scripts/pull-route.js
- src/scripts/pull-writes.js
- src/scripts/pull.js
- src/scripts/unblock.js
- src/scripts/work.js
- test/contract/pull-payload.test.js
- test/level0/pull-leaves.test.js
- test/level0/pull-steps.test.js
- test/level0/work-group.test.js

<!-- the form is files -->

## verdict

<!-- pass or fail, findings one a line -->

pass

- `escalate` reads `handOf` where the other verbs read `handHere`, so a `--as` hand finds no hold.
- `ESCALATES` holds `--options` alone, so `--as helper-7` drops its name into the question.
- The push refusal says to run `branch escalate` again, which puts a second person step in.
- A run with no question answers exit 2, and no test drives that line.
- `withPersonStep` answers an empty path where the target stands nowhere, and `escalate` exits 1 in silence.
- `./RUNME.sh branch review` answers check passes, and names the retro absent from the handback.
- The ask's third bullet retires here, and [[spec/design_output/pull#a-count-inserts-no-step]] owns that ruling.

<!-- the form is verdict -->

## checked

<!-- one line per item of the checklist, on how you take it into account -->

- The design output chapter owns the verb, and each hunk carries one link to it.

<!-- the form is checklist -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

- this ticket splits off [[spec/tickets/step-changes-hands]], which waited at a person step. The branch behind it closes, and the branches waiting on it move.
- the rule to hold: a gate the mint writes and an escalation the engine inserts are one mechanism. An inserted step counts for no `not`.
