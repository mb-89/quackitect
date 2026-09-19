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
group: the-tree-names-its-things
process: [[spec/processes/standard]]
process_hash: 838dd6d003506639
step: design/review
record:
  - step: design/draft
    hand: box d42624a67d18a8
    hash_before: 1647c00af456caf124ee2fed93df96603c59514f
    hash_after: 759f94974cf0dcc94b87f77a42f67104f875acc4
  - step: design/review
    hand: box d42624a67d18a8 · claude-code
    hash_before: 7b982e4f36e63a0e5076b054b970ac5ffcb2ad5d
    hash_after: 7b982e4f36e63a0e5076b054b970ac5ffcb2ad5d
    returns: 1
    why: The binding table holds. The three values each get a row, and the `pull <ticket>` column reads true against the ask.; Three notes read `engine.autonomy` three ways, and the draft picks one without naming the other two.; The schema's own `help` reads "How far the session goes on its own". That says nothing about what a session mints.; `spec/design_output/extension.md` line 98 reads "finish your own token", "start new tokens", "ideation".; The ask and the draft read it as notes, a group ticket and a loose ticket. An implementer following the draft writes code the extension note refuses.; Name which of the three stands, and say what the other two become.; `god` stands undefined. The draft gives it the row `queue` takes, so three values carry two behaviours.; `src/bridge/stop.js` line 244 reads `engine.binding` against `queue` alone, so `god` already falls outside the queue rule there.; So the draft's pull and the standing stop rule read `god` two ways. Say which one moves.; The draft says the mint refuses a kind the autonomy leaves out, and names no file. The verb stands at `src/scripts/cli.js` line 225.; `engine.autonomy` has no reader today, and `grep -rn autonomy --include=*.js src .claude` answers that.; The evidence field carries the two comments mint writes, above the table. Cut them, so the field reads as what a hand wrote.; The anchor holds. `The hand-out` stands at line 33 of the pull design output.
  - step: design/draft
    hand: box d42624a67d18a8 · claude-code
    hash_before: c44525874ec9225cb01b2e144e6b54a3c9d3e579
    hash_after: c44525874ec9225cb01b2e144e6b54a3c9d3e579
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

This ticket carries `engine.binding` alone. The owner drops `engine.autonomy`, and the schema declares it no longer, so the second half of the ask stands closed.

[[spec/design_output/config#the-engine-controls]] owns what each binding value means. This draft names where the code reads it, and restates none of it.

| control | who reads it today | who reads it after |
|---|---|---|
| `engine.binding` | the stop hook, for the queue rule | the pull's hand-out too |

The box the command line builds asks the config for each control, beside the
words and the counts it asks for already. So the pull and the mint each read
one field of `it`, and the config door stays the one reader of the file.

| binding | the plain pull | `pull <ticket>` |
|---|---|---|
| `queue` | hands out the next leaf | hands out that ticket |
| `unbound` | answers wait, and names the binding | hands out that ticket |
| `god` | answers wait, and names the binding | hands out that ticket |

The stop hook stands half done already, and the table says which half:

| the check | at `queue` | at `unbound` | at `god` |
|---|---|---|---|
| `ticket-in-hand` | refuses | refuses | **stands down** |
| `group-in-hand` | refuses | refuses | **stands down** |
| `work-waiting` | refuses | refuses | **stands down** |
| `queue-waits` | refuses | stands down | stands down |

`queueWaits` reads the binding against `queue` today, so the last row holds.
The three rows above it read the binding nowhere, so `god` refuses a stop the
way `queue` does. Each of the three takes the same gate `queueWaits` carries.

`god` is the engine standing aside, so every mechanical check stands down there.
That leaves `stop-hook-off` and the owner's hold, which answer to a person and
read no binding.

## review

<!-- reads the approach against the ask -->

### verdict

fail

- The binding table holds. The three values each get a row, and the `pull <ticket>` column reads true against the ask.
- Three notes read `engine.autonomy` three ways, and the draft picks one without naming the other two.
- The schema's own `help` reads "How far the session goes on its own". That says nothing about what a session mints.
- `spec/design_output/extension.md` line 98 reads "finish your own token", "start new tokens", "ideation".
- The ask and the draft read it as notes, a group ticket and a loose ticket. An implementer following the draft writes code the extension note refuses.
- Name which of the three stands, and say what the other two become.
- `god` stands undefined. The draft gives it the row `queue` takes, so three values carry two behaviours.
- `src/bridge/stop.js` line 244 reads `engine.binding` against `queue` alone, so `god` already falls outside the queue rule there.
- So the draft's pull and the standing stop rule read `god` two ways. Say which one moves.
- The draft says the mint refuses a kind the autonomy leaves out, and names no file. The verb stands at `src/scripts/cli.js` line 225.
- `engine.autonomy` has no reader today, and `grep -rn autonomy --include=*.js src .claude` answers that.
- The evidence field carries the two comments mint writes, above the table. Cut them, so the field reads as what a hand wrote.
- The anchor holds. `The hand-out` stands at line 33 of the pull design output.

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

The binding half of this ticket stands ready. The autonomy half waits on one answer: which of the three readings the tree keeps.

A session runs under `engine.binding` at `queue` today, and the stop rule hands it work while a free ticket stands. So the `unbound` row of the draft is the one a person reaches for, and it is the row the draft gets right.
