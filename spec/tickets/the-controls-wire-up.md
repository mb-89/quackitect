---
kind: [[ticket]]
state: open
urgency: whenever
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
step: design/review
record:
  - step: design/draft
    hand: box d42624a67d18a8
    hash_before: 1647c00af456caf124ee2fed93df96603c59514f
    hash_after: 759f94974cf0dcc94b87f77a42f67104f875acc4
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

The two engine controls the schema holds reach the pull. At `unbound` the binding hands out nothing, and `pull <ticket>` takes a named one. The autonomy decides what a session mints:

| value | mints |
|---|---|
| `finish` | notes alone |
| `start` | into its own group |
| `ideation` | loose tickets, which ride the group's branch on a cloud box |

Today the schema promises two knobs, and the pull reads the binding for the queue alone. A person sets `unbound`, and the box keeps pulling.

- `./RUNME.sh branch test` passes a case where the pull at `unbound` answers wait
- `./RUNME.sh branch test` passes a case per autonomy value on what the mint allows
- `./RUNME.sh check` answers 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

| control | who reads it today | who reads it after |
|---|---|---|
| `engine.binding` | the stop hook, for the queue rule | the pull's hand-out too |
| `engine.autonomy` | nobody | the mint, over every kind it writes |

The box the command line builds asks the config for each control, beside the
words and the counts it asks for already. So the pull and the mint each read
one field of `it`, and the config door stays the one reader of the file.

| binding | the plain pull | `pull <ticket>` |
|---|---|---|
| `queue` | hands out the next leaf | hands out that ticket |
| `unbound` | answers wait, and says the binding stands unbound | hands out that ticket |
| `god` | hands out the next leaf | hands out that ticket |

So a person at `unbound` still names the work, and the box stops handing
itself more. The stop rule reads the same field, so a box at `unbound` ends
its turn with no queue behind it.

| autonomy | the mint writes |
|---|---|
| `finish` | a private note, and refuses a ticket with the line to write instead |
| `start` | a ticket, and names the group it lands in |
| `ideation` | a ticket standing loose, which a cloud box rides on the group's branch |

The mint refuses a kind the autonomy leaves out, and the refusal names the
control and what it allows. For details, see
[[spec/design_output/pull#the-hand-out]].

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
