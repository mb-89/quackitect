---
kind: [[ticket]]
state: open
urgency: soon
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
    evidence:
      - name: read
        form: files
        says: every file you read, one a line
      - name: verdict
        form: verdict
        says: pass or fail, findings one a line
process: [[standard]]
group: a-step-changes-hands
step: design/draft
---

# Ask

The pull learns who holds a step: the hand carries the box, the session and the agent, a helper carries the session's hand, a person's step refuses an agent, and an escalation inserts a person step through a verb. The chapters below say where it stands, what waits and the rules to hold.

## Where it stands

The design input `spec/design_input/the-agent-pulls-tickets.md` says what the
owner asks for, and the page beside it draws it. Read the note first. It
stands on the branch `claude/relaxed-knuth-f0uk4d` until the owner merges it,
so take that branch in where `work sync` leaves it absent.

The pull lands before this branch, and this one teaches it who holds a step.
Its chapters are Hands, Escalation is a step, and Children and private
tickets.

| what stands today | where |
|---|---|
| the spawn hook, which hands the guidance to a helper | `.claude/skills/level0/hooks/level0.js`, `agent.spawn` |
| the session id, read in one place | `.claude/skills/level0/lib/copilot.js` |
| the pull, its hold and its record | the pull branch |

## What waits

| the piece | where | proves it |
|---|---|---|
| the hand id | `work.js` | the box, the session and the agent stand in the record |
| the spawn for a step | the plugin wrapper | a `by` that excludes the hand spawns one, with a prompt the engine writes |
| the spawned hand's road back | `work.js` | its pull answers `done` after its hand-back, and touches no other hold |
| the helper's tag | the spawn hook | a helper the session spawns carries the session's hand, so `not <step>` still holds |
| the person's hand | `work.js` | the verb refuses `by: person` where the environment names an agent's harness |
| `work.personSigns` | the config and `work.js` | switched on, a person's hand-back needs a signed commit |
| `work escalate <question>` | `work.js` | it inserts a person step with `asks` and one `answer` field, and points `step` at it |
| `options` | `work.js` | an `asks` with options takes a `choice` answer, and one word passes |
| the refusal count | `work.js` | `work.refusalsBeforePerson` inserts a person step with the findings |
| the split refusal | `work.js` | past `work.stepsBeforeSplit` the pull answers the ask, and the close waits for the successors |
| the group leaves | `work.js` | a box with nothing at an agent step leaves the group at `todo` |

## The rules to hold

- A role is a property of a step, and no agent holds one for life.
- An inserted step counts for no `not`.
- A gate the mint writes and an escalation the engine inserts are one mechanism.
- On a box with no plugin, the shell pull parks the step for a person and says so.

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

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

## reflect

<!-- names the class of error in the findings, and the fix for the class -->

### class

<!-- the class of error the findings describe, and the fix for the class -->

<!-- the form is text -->

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->

<!-- the form is command -->

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

# verdict

<!-- reads every hunk against the ask and the approach -->

## read

<!-- every file you read, one a line -->

<!-- the form is files -->

## verdict

<!-- pass or fail, findings one a line -->

<!-- the form is verdict -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
