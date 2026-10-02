---
kind: [[ticket]]
state: open
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: anyone
    by: anyone
    to: retro
    input: ask
    tags: ["code", "testing"]
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
process_hash: 2b5ab398855a1aba
group: the-modules-start-together
step: do
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

A fresh index starts its module processes one after another, a quarter second apart, and a read waits for every one of them to answer once. So the first read of every fresh index waits out the gap once a process. This ticket cuts the gap to a short yield, and lets a caller name its own.

- gain: the first read of a fresh index answers in a fraction of a second, on every box, in the dry probe and in every contract case starting an index
- breaks: each module the wiring adds makes every fresh index's first read slower by a quarter second
- done_when: `go test ./src/index` passes, and a case holds the default gap short and a named gap kept
- done_when: the first read of a fresh index over a bare tree reads shorter than main reads on one box

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

<!-- what anybody adds, at any time, on this ticket -->

The measure: `se-index standing`, then `se-index tickets`, over a bare tree holding the wiring and an empty ticket folder, three runs each way on a cloud box with four cores. Wall seconds of the first read:

| run | before | after |
|---|---|---|
| first | 4.83 | 0.42 |
| second | 4.75 | 0.34 |
| third | 4.72 | 0.44 |

The calls I took, with nobody to ask:

- A helper traced the wait: the door's read drains the placements, `Settle` waits for every instance's first answer, and `spawns` starts each placement a gap after the last.
- The gap's reason was room for the door to stand. The door stands while the spawns run, since `standing` answers in half a second on the bare tree, so the gap now buys nothing that the read does not pay back.
- The gap stays at a short yield, and does not drop to nothing, so a burst of starts still leaves the door a slice of the processor.
- The case stopping the placements between two spawns names an hour's gap, so its stop lands between the two on a loaded box as well.
