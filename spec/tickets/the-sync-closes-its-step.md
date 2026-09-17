---
kind: [[ticket]]
state: open
urgency: now
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: anyone
    by: anyone
    to: retro
    input: ask
    reads: [[spec/guidance/working]]
    needs: ["branch test"]
    checklist: ["the change follows the ask, or the discussion says why it departs", "the cleanup the change reveals is in the change, or is a note of its own", "every fact the change adds stands in one place, and a note points at the file instead of repeating it"]
    evidence:
      - name: tests
        form: command
        expects: green
        says: the tests that cover the change, or the check where it touches no code
      - name: check
        form: command
        expects: 0
        says: the check is green on the commit
      - name: says
        form: text
        says: what changes and why, for a reader who was not there
process: [[spec/processes/trivial]]
process_hash: 05e53b89dab63152
step: do
---

# Ask

A branch a box works stands free again once the box leaves it. The cloud then takes every branch a box puts down, and the queue runs dry only where the work runs out.

`branch take` claims the group's first step by writing a record entry with `hash_before`. The step is `sync`, and it names `branch sync` under `needs`. `sync` in `src/scripts/work.js` takes trunk in and prints, and it writes no `hash_after`. So the step stands open while the box walks on to the children, and `heldIn` reads the group as held for good.

Two branches carry the mark today, and the history of each reads the same three commits:

| the commit | what it says |
|---|---|
| `box <id> takes it` | the take claims the `sync` step |
| `take main in` | `branch sync` does the work, and writes no record |
| `<child>: passes design/draft` | the box walks to the children, and the group stands at `sync` |

Nobody reads the group again. `freeIn` hands out a branch at `todo` alone, so a held branch reaches no box, and `cloud trigger` answers that no branch stands free. The owner then reads an empty cloud while two branches carry work.

- `./RUNME.sh branch sync` writes `hash_after` onto the open record entry, and the group's step moves on
- a case drives a sync over a group holding an open entry, and reads `hash_after` on it
- a case drives a sync over a group holding no open entry, and reads the record as it stands
- `./RUNME.sh branch list` reads a branch as `todo` after a box syncs it and leaves
- `./RUNME.sh check` answers 0

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

# Discussion

The owner reads an empty cloud while two branches carry work, and asks what stands in the way. A first reading blames a box dying mid-step. The owner refuses that reading, and the history bears the owner out: each box ran on past the sync and worked its children for hours.

So no box dies here, and no box meets a person step. A box does the work the step names, and the step stays open because the verb doing the work writes no record.

`./RUNME.sh branch release <name>` clears one by hand. It clears the mark, and the cause stands.
