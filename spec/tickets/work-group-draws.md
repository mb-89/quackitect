---
kind: [[ticket]]
state: draft
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
group: the-work-group-draws
---

# Ask

# Where it stands

The design input `spec/design_input/the-agent-pulls-tickets.md` says what the
owner asks for, and the page beside it draws it. Read the note first. It
stands on the branch `claude/relaxed-knuth-f0uk4d` until the owner merges it,
so take that branch in where `work sync` leaves it absent.

This branch is the beat and the sidebar's `work` group. The editor itself
waits for a note of its own and for desk work with the owner. So this branch
lands a button and no board. Its chapters are What a person sees, and The
pull, under the two levels.

| what stands today | where |
|---|---|
| the sidebar and its declared widgets | `spec/config/level0.schema.json`, and `src/extension/sidebar.js` |
| the widgets: toggle, status, count, table, action | `.claude/skills/level0/lib/controls.js` |
| the routine, which runs `work take` on its clock | `spec/design_output/work.md`, and the `do_work` routine |
| the cloud guidance | `spec/guidance/cloud.md` |

# What waits

| the piece | where | proves it |
|---|---|---|
| the `work` group | `level0.schema.json` | four controls in order: the engine's switch, the editor button, `note`, `mint` |
| the count on the editor button | the `count` widget | it shows the tickets and the stale groups waiting on the person |
| `work beat` | `work.js` | on trunk it takes a free group, works it, and takes the next until none stands |
| the notification | `work beat` | it names each question with its age, and each stale group |
| the routine's line | `spec/guidance/cloud.md` | the first verb is the pull |
| the board's reading | `work list` and the count | a ticket in a held group shows its group's state and the tip's age, and no state of its own |
| the switch on a desk | `engine.state` | it runs the beat, and `engine.beat` reads the newest group note off the branches |

# The rules to hold

- The Kanban board goes in no sidebar. The sidebar holds a button, and the button carries a count.
- The routine fires one box. A second routine is a second box, and a person creates it.
- The board draws what the machine holds, and fetches on the schedule the tree already has.
- The controls take the editor's theme, and this branch spends nothing on graphical design.

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
