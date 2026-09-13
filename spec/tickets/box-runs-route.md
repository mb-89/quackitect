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
group: the-box-runs-the-route
---

# Ask

# Where it stands

The design input `spec/design_input/the-agent-pulls-tickets.md` says what the
owner asks for. Its chapters A group is a branch and The retro say what this
branch proves. A cloud run is a group, and the route in
`spec/processes/group.yaml` is what the box does, step by step.

Today a cloud run follows six lines `work new` appends to every brief, and the
routine `do_work` runs `work take` on its clock. After this branch the routine
fires a box that pulls. The pull hands it a group, and the route carries the
run from `sync` to the retro's last leaf.

| what stands today | where |
|---|---|
| the six lines of the contract | `work new`, in `src/scripts/work.js` |
| the cloud guidance, whose first verb is `work take` | `spec/guidance/cloud.md` |
| the routine, on a clock of four hours | `do_work`, and `work trigger` |
| the pull, the group verbs, the retro verbs | the branches before this one |
| five brief branches at `todo` | `work list` |

# What waits

| the piece | where | proves it |
|---|---|---|
| the cloud guidance | `spec/guidance/cloud.md` | its first verb is the pull, and it names the route and no contract |
| the routine takes a group | `work.js`, and the routine | a fired box pulls on trunk, takes a group, and works the route |
| the contract retires | `work new` | a brief carries no appended contract, since the route holds it |
| `sync` on a cloud box | the pull | `when: cloud` holds on a cloud box, and the leaf runs first |
| the retro phase on a cloud box | the pull | `retro/notes` empties the private folder, `retro/write` fills, and `retro/cloud` runs there alone |
| `adopt` over the standing briefs | `work adopt` | each of the five brief branches becomes a group ticket and one child, or closes |
| the first cloud run under the route | a real routine firing | one group runs from `sync` to its retro on a cloud box, and lands by a desk's merge |
| the handover in the retro | the retro leaves | what the brief's handback carries today stands in `write` and `cloud` |

# The rules to hold

- The cloud box commits on no trunk. A ticket with no group rides the branch to the merge.
- A box leaving a group writes `hash_after`, and the group stays open where a child stands parked.
- The private notes die with the box unless the retro decides them, so the retro phase runs before the cap.
- What the box lacks, meets and leaves stands in the `cloud` leaf, and the tree's retro reads it.
- Drive one real run before `work done`, and write what you see in the retro.

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
