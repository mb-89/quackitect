---
kind: [[ticket]]
state: open
urgency: soon
group: the-hand-carries-a-step
step: design/review
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
record:
  - step: design/draft
    hand: box ee33ce836a4d
    hash_before: 9dd9db35e66080faace6466f0132146d0b6188c4
    hash_after: 9dd9db35e66080faace6466f0132146d0b6188c4
---

# Ask

The pull learns who holds a step, and the first piece is the hand id. Today a hand is the box alone. Two sessions on one box read as one hand, and a helper the session spawns reads as a stranger. The approach stands in [[spec/design_output/pull#the-hand-and-the-hold]] and [[spec/design_output/pull#a-hand-of-its-own]]. The owner's words stand in [[spec/design_input/the-agent-pulls-tickets#hands]]. A person reads the design phase here, because the group behind it waited on one. Done is five things:

- the wrapper writes `.se/session.json` at `session.start`, with the session id and the harness name
- the pull reads the box file and the session file into one hand
- a record entry names the box, the session and the agent. The hold slugs that hand into its file name.
- `--as <name>` appends the helper to the hand, with a hold of its own
- the `agent.spawn` hook puts one line at the head of a helper's prompt. So the helper carries the session's hand, and `not <step>` holds against it.

| the piece | where | proves it |
|---|---|---|
| the hand id | `src/scripts/pull.js` | the box, the session and the agent stand in the record |
| the session file | the plugin wrapper under `.claude/skills/level1` | `session.start` writes it, and a test reads it back |
| the helper's tag | the spawn hook under `.claude/skills/level0` | a helper the session spawns carries the session's hand |

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

The hand grows from one piece to three, and the design output holds the shape. The plugin wrapper writes the session file at `session.start`, with the session id and the harness name. The pull reads it beside the box file into one hand. The record names the box, the session and the agent, and the hold slugs that hand into its file name.

`--as <name>` appends a helper, which works one leaf under a hold of its own. The spawn hook puts one line at the head of every other helper's prompt. That line says the hand is the session's own, so `not` holds against it. For details, see [[spec/design_output/pull#the-hand-and-the-hold]] and [[spec/design_output/pull#a-hand-of-its-own]].

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

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
- the parent's design review asked whether the heading, the Scope line and the table under The five answers agree. They do on the design output as it stands.
