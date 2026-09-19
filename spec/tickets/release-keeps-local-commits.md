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
step: design/review
record:
  - step: design/draft
    hand: box b99ea8ab11a8 · claude-code-remote
    hash_before: 23fe31171590fa06fff96b972a1b421916f132cd
    hash_after: 23fe31171590fa06fff96b972a1b421916f132cd
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->

A hand keeps the work it commits. The verbs moving a branch refuse where the box
holds a commit origin lacks.

<!-- breaks, as text: what breaks if it is never done -->

| what guards it today | what it reads |
|---|---|
| `dirty` | the working tree, so a change you have yet to commit stops the verb |
| nothing | a commit standing ahead of origin |

`onBranch` in `src/scripts/work.js` runs a hard reset onto the branch at origin.
Every verb reaching it drops a commit the box holds and origin lacks.

So a hand that commits and skips the push loses it, and one line says the branch
stands free. This box lost two commits that way inside one session.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

- a verb reaching `onBranch` refuses where `rev-list origin/<branch>..HEAD` counts past zero
- the refusal names the count, and names the push
- a test drives a branch standing ahead of origin, and asserts the refusal
- `./RUNME.sh check` answers 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->
<!-- the form is text -->

`onBranch` counts the commits origin lacks before it resets, and refuses where the count stands past zero.

| where | what changes |
|---|---|
| `onBranch` in `src/scripts/work.js` | after the switch and before the reset, it reads `rev-list --count origin/<branch>..HEAD` |
| the answer | names the count and names the push, and the verb returns 1 |
| the callers | `branch take` and `branch release` both reach it, so both refuse |

Two reads settle the shape:

- the count reads after the switch, because the reset drops commits on the branch it lands on
- a missing `origin/<branch>` leaves the count unreadable, and the verb carries on, because that switch leaves nothing ahead

The test drives a fake git whose `rev-list` answers past zero, and runs `branch take`. It asserts the refusal names the count, and that the reset stays unrun.

The objection: a box skipping the push now stalls at every verb. It stalls where it would lose the work instead, and the answer names the push clearing it.

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

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

The draft under `design/draft` is wrong on what stands today, and the review
reads this beside it:

- `unpushed` in `src/scripts/work-stands.js` already counts what origin lacks
- `dirty` calls it, and it names the count and the push
- `release` passes the branch it moves to `dirty`, so that road holds
- `take` passes no branch, so it reads the branch the box stands on
- `onBranch` then resets the branch the take lands on, which nothing read

So the gap is the take's target branch. The read stands written, and the change
carries it to `onBranch` in place of writing a second one.

