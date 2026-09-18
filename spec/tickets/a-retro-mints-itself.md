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
group: the-retro-runs
step: design/review
record:
  - step: design/draft
    hand: box d42624a67d18a8 · claude-code
    hash_before: ed8bb2787df33550776b3a688995e52fb3272c23
    hash_after: ed8bb2787df33550776b3a688995e52fb3272c23
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->

A person starts a retro with one command, and the route it takes is the process file:

- the command mints the ticket, opens it, and pulls its first leaf
- the hands a collect spawns take their cap from the config
- the projection writes the command beside the config commands

<!-- breaks, as text: what breaks if it is never done -->

A retro takes a hand-written ticket. The route on it drifts from the process file, and the drift shows up as a step nobody answers.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

- `/se-retro` mints a retro off its process, opens it, and hands out its first leaf
- `work.retroReaders` and `work.retroCap` stand in the config with their defaults
- the projection writes the command, and `./RUNME.sh project` leaves the tree clean
- `./RUNME.sh check` exits 0

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

One sub-verb mints the ticket, and one projection writes the command that calls it.

| what lands | where |
|---|---|
| `retro new`, a sub-verb beside `retro notes` | `src/scripts/retro.js` |
| the shape writing one command file | `.claude/skills/level0/lib/projection.js` |
| the entry naming that shape, its source and its target | `spec/config/projections.json` |
| `retroReaders` and `retroCap`, with their defaults | `spec/config/level0.json` and its schema |

`retro new` mints a ticket off the retro process, names it for the tip it stands on, writes the reason into its ask, and opens it. It prints what a pull prints, so the hand reads the first leaf without a second command.

The ticket's name reads `retro-<short>`, off the commit the window ends at. A name holds five words, and two of them stand here. A hand naming its own takes `--as <name>`.

| the field | what it takes |
|---|---|
| `why` | what calls for it, off `--why`, or the standing line where nobody says |
| `state` | open, because the mint writes an ask a hand fills nowhere |

The command file reads like a config command and runs `./RUNME.sh retro new` ahead of the turn. The projection owns it, so the write door refuses a hand editing it, and `./RUNME.sh check` names it stale where the shape moves.

The two knobs stand in the config as numbers, beside the other work knobs. `retroReaders` caps the hands a collect spawns, and `retroCap` caps the tickets the improve step mints.

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
