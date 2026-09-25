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
          - name: callers
            form: list
            says: every caller of what the approach changes, one a line, as a file and a function
          - name: answers
            form: list
            says: every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft
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
process_hash: 7a1a6e274b56e7ee
step: verdict
todo: true
record:
  - step: design/draft
    hand: box d6f05e3a585030 · claude-code
    hash_before: 783c6897343e892e2b01e854d7b0c053c6b2ae4f
    hash_after: 783c6897343e892e2b01e854d7b0c053c6b2ae4f
  - step: design/review
    hand: box d6f05e3a585030 · claude-code · helper-2
    hash_before: 4e556f8c584107510c5cb8aeed2a70d2b753bce3
    hash_after: 4e556f8c584107510c5cb8aeed2a70d2b753bce3
  - step: implement/tests-red
    hand: box d6f05e3a585030 · claude-code
    hash_before: 693ec5549082854106ee1605de312c6255262ef4
    hash_after: 693ec5549082854106ee1605de312c6255262ef4
    answered:
      - name: tests
        exit: 1
        said: assertion, 12 test(s) fail on their own assertion
  - step: implement/reflect
    skipped: true
    why: the ticket arrives here by no on_fail
  - step: implement/change
    hand: box d6f05e3a585030 · claude-code
    hash_before: 98ca5dce38a82d61250cec7b5a44bef42351d545
    hash_after: 98ca5dce38a82d61250cec7b5a44bef42351d545
    answered:
      - name: lint
        exit: 0
        said: "test/level0/pull-findings.test.js:53:1: CodeComment: Code carries no comment here. Write a header of at most five lines "
  - step: implement/tests-green
    hand: box d6f05e3a585030 · claude-code
    hash_before: 0b60f7b20fd7e2e00733f898dce7db303ea72082
    hash_after: 0b60f7b20fd7e2e00733f898dce7db303ea72082
    answered:
      - name: tests
        exit: 0
        said: green, 51 test(s) pass in 7 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/one-review-a-ticket.md:308:3: Sentence: A sentence holds 25 words. Cut this one in two."
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

A standard ticket meets one review, on its design, and goes on to the code. A finding the review names rides out as a child ticket, so the parent moves on the same day.

Without it a design goes round a review five times, and a second review reads the code after. Each round spends a session, and the queue behind the ticket waits.

- `spec/processes/standard.yaml` holds `design/review` as its one review, and no `verdict` step
- a review answering pass with findings mints one child ticket a finding, and the parent goes on to implement, and a test drives it
- a review answering fail sends the ticket back to `design/draft` once, and a second fail sends it to the owner, and a test drives it
- `design/review` reads `spec/guidance/review/design.md`, which judges structure alone
- `design/draft` carries a `tests` field and a self-check checklist
- `./RUNME.sh check` passes, on form findings aside

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

The route loses its second review, and the engine carries the two roads out of the one review that stays.

| part | the change |
|---|---|
| `spec/processes/standard.yaml` | drops the `verdict` phase and the `implement/reflect` leaf, whose input is that verdict; `to: retro` moves onto `implement` |
| `design/draft` | gains the evidence field `tests`, as a list: every test the change adds, as a file and a test name |
| `design/draft` | gains a checklist: every file, function and verb the approach names stands opened and checked; the callers list is complete; every done_when line has a named test |
| `design/review` | reads `[[spec/guidance/review/design]]`, and its verdict field says pass, pass with findings one a line, or fail |
| `spec/guidance/review/design.md` | a new guidance note, minted with its rationale: the review judges structure alone, and a form finding fails nothing |
| `passed` in `src/scripts/pull-writes.js` | a verdict leaf passing with rows under the pass mints one child ticket a row, then moves on as today |
| `failed` in `src/scripts/pull-writes.js` | at `work.failsBeforeOwner` returns, it calls `withPersonStep` before the target, with the reason as the question |
| `work.failsBeforeWait` | renamed `work.failsBeforeOwner` in the config, its schema and `cli-doors.js` |
| `spec/design_output/pull.md` | "The fail" and "A count inserts no step" say the new road; "The pass" names the children |

A child ticket:

- takes the name `<parent>-finding-<n>`, and `n` counts from one over the children the parent carries
- follows `spec/processes/trivial.yaml`, through the mint verb the retro's `mint` in `src/engine/retro/mint.js` runs
- carries the finding as `gain` and a link to the parent under `breaks`, through `withAsk` and `askOf` from the same file
- stands at `todo`, because a finding carries no `done_when`; the hand that fills it opens it
- lands in the parent's pass commit, and the commit line names it

The second fail inserts `person-<n>` through the escalation's own function, so a desk sends it to the owner. A cloud box writes `by: anyone` there, as [[spec/guidance/cloud]] rules, and answers the question itself.

The tests:

- `test/level0/pull-steps.test.js`: a pass with two finding rows mints two children at todo, and the parent stands at `implement/tests-red`
- `test/level0/pull-steps.test.js`: a bare pass mints no child
- `test/level0/pull-person.test.js`: a first fail sends `design/review` back to `design/draft`, with no person step
- `test/level0/pull-person.test.js`: a second fail inserts `person-1` before `design/draft`, `by: person`, asking the fail's reason
- `test/level0/schema-route.test.js`: `standard.yaml` holds one leaf with a verdict field, at `design/review`, and `design/draft` holds `tests`

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->

<!-- the form is list -->

- `src/scripts/pull.js` `handBack`, which calls `passed` and `failed`
- `src/scripts/pull.js` `refused`, which calls `failed` past `work.refusalsBeforeFail`
- `src/scripts/pull.js` the escalate verb, which calls `withPersonStep`
- `src/scripts/cli-doors.js` the door reading `work.failsBeforeWait` into `it.fails`
- `src/engine/retro/mint.js` `mint`, whose `askOf` and `withAsk` the child mint reuses
- `spec/guidance/review/reviewing.md`, which `design/review` stops reading and the group route keeps
- every ticket on `spec/processes/standard.yaml`, which `./RUNME.sh ticket update` moves onto the new route

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->

<!-- the form is list -->

- first

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

pass
- `passed` receives no rows: `verdictIn` in `src/scripts/pull-chapter.js` joins the rows under the pass with "; ". Make it return the rows, and have `handBack` hand them to `passed`.
- `failed` lands and pushes before it reads the cap. Call `withPersonStep` before `landed`, so the person step rides the fail commit.
- `withPersonStep` answers an empty path past `work.stepsBeforeSplit`. Keep the wait answer as the fallback there.
- `refused` calls `failed` past `work.refusalsBeforeFail`, so a refusal cap reaches the owner road too. Say whether it counts, and test the answer.
- The test "a step failing back past the cap drops the hold, answers wait, and writes no step" in `test/level0/pull-steps.test.js` asserts the old road. Name it for the rewrite.
- `spec/processes/group.yaml` reads `spec/guidance/working` alone, so no route reads `spec/guidance/review/reviewing.md` after the change. Say what becomes of it, and fix the reader list in `spec/design_output/review.md`.
- A ticket state is draft, open or closed, and `todo` is the queue tag. A minted child stands at `draft`, so write that in the approach and the test.
- `spec/design_output/pull.md` names `failsBeforePerson` beside the weights. Fold that line into the rename, and rename `.claude/commands/se-config-work-failsBeforeWait.md` with the key.
- `runIn` and `cliOf` in `src/engine/retro/mint.js` stay unexported. Export the mint call the child reuses.

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

    ./RUNME.sh branch test test/level0/pull-leaves.test.js test/level0/pull-findings.test.js test/level0/pull-fails.test.js test/level0/pull-steps.test.js test/contract/process.test.js test/contract/question-grades.test.js test/contract/one-config.test.js

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

Each new test fails on its own assertion: `verdictIn` answers pass for a findings verdict, no child file stands, the second fail leaves the step at `design/draft`, the route still holds `implement/reflect` and `verdict`, `design.md` stands nowhere, and the old config key stays. The first-fail test and the bare-pass test pass today, and they guard the roads that stay.

The settled design departs from the draft in four places, and the review's findings and a planner's check of the code carry each:

- the reviewer names each child, as `- <child-name>: <finding>`, because an engine name breaks the name cap
- the opener `pass with findings` mints, and a plain pass with rows stays a pass
- a child stands at `draft` on `trivial`, and an agent's pull opens it
- the config key reads `failsBeforePerson`, the name the design input uses

The fail cases live in `test/level0/pull-fails.test.js`, because `pull-steps.test.js` stands near its line ceiling.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches the route, the pull's pass and fail, the config key and the review guidance, which the ask names
- every door the tests reach runs on the fakes of `test/level0/pull-doors.js`
- a comment in `passed` and `failed` links the approach, at the change step

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

    ./RUNME.sh lint src/scripts/pull-chapter.js src/scripts/pull-writes.js src/scripts/pull.js src/scripts/cli-doors.js test/level0/pull-fails.test.js test/level0/pull-findings.test.js

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change touches the route, the pull's pass and fail, the config key, the ticket schema's `parent` and the review guidance, which the ask names
- every door the change reaches runs on the fakes of `test/level0/pull-doors.js`
- `minted`, `passed` and `failed` link `spec/design_output/pull.md`, which carries the approach
- the design rules stand in `spec/guidance/review/design.md` alone, and `reviewing.md` loses them

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->

<!-- the form is command -->

    ./RUNME.sh branch test test/level0/pull-leaves.test.js test/level0/pull-findings.test.js test/level0/pull-fails.test.js test/level0/pull-steps.test.js test/contract/process.test.js test/contract/question-grades.test.js test/contract/one-config.test.js

### check

<!-- the check is green on the commit -->

<!-- the form is command -->

    ./RUNME.sh check

### says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

A standard ticket meets one review, on its design, and goes on to the code. The route drops `implement/reflect` and `verdict`.

- a pass with findings mints a draft child a finding, on the trivial route, and the parent goes on
- a first fail sends the ticket back to `design/draft`, and a second fail asks the owner
- `spec/guidance/review/design.md` holds the design rules, and judges structure alone

The check runs every test green, and exits 1 on form findings alone. The owner's rule holds those findings in the Problems panel until the push.

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- every file the change commit touches serves the route, the pull, the config key, the schema or the review guidance
- every door the change reaches runs on the fakes of `test/level0/pull-doors.js`
- the new code in `pull-writes.js` and `pull-chapter.js` links the approach in `spec/design_output/pull.md`

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
