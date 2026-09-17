---
kind: [[ticket]]
state: open
urgency: now
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
group: guidance-rides-the-step
step: design/review
record:
  - step: design/draft
    hand: box 0fc2b4132f94 · claude-code-remote
    hash_before: ce48a7b824a94ba3ffcd7ad9867f488112e28876
    hash_after: ce48a7b824a94ba3ffcd7ad9867f488112e28876
---

# Ask

The layer a session opens with drops the notes its held step already hands it.

A session carries every note today, and its step hands some of them over again. The library already drops what a step reads, and the standing verb already asks it to. The road into a session does not.

What breaks where nobody does it: the branch's headline outcome reaches no session. The notes ride the step and the layer both, so a session opens holding each of them twice.

- `src/bridge/guidance.js` reads the held step's notes, and hands the layer without them
- `.claude/skills/level0/lib/copilot-runtime.js` reads the same list
- a test drives the bridge over fake doors, with a hold standing and without one
- a session with no hold standing carries the layer whole, as it does today
- `./RUNME.sh check` exits 0 on the branch

For the library that already drops them, see [[spec/tickets/guidance-rides-step]].

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

| the ask asks | the approach answers |
|---|---|
| what a session carries | the layer, without the notes its held step hands it |
| where the drop happens | the two roads into a session, each of which calls the layer |
| how each road reads the hold | the helper the standing verb already calls |
| what a session with no hold carries | the layer whole, as it carries it today |

TL;DR:

- One helper already answers the held step's notes, and both roads call it.
- Neither road's file stands past its ceiling, so no cut pays for this change.
- A box standing nowhere answers an empty list, so a session start writes nothing.
- Each road keeps the doors it already holds, and no new door reaches it.

| piece | home |
|---|---|
| the layer the bridge hands a session | the bridge's guidance module |
| the layer the runtime hands a session | the level zero copilot runtime |
| the held step's notes | the guidance hand module, which both read |

| test | claim |
|---|---|
| the bridge test, a hold standing | the note the held step reads leaves the layer |
| the bridge test, no hold standing | the layer stands whole |
| the bridge test, no box standing | the layer stands whole, and the box file stays absent |

What the agent needs:

| number | need | status |
|---|---|---|
| 1 | the review hand reads this approach against the ask | open |
| 2 | a pass moves this ticket to the implement phase | open |

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
