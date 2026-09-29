---
kind: [[ticket]]
state: draft
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
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

The Go queue orders the tickets the way cli.js does, so the verbs shadow names no mismatch. The coordinator can then turn `migration.phase4switch` on. The Go queue scored every ticket at zero. It read its weights under `queue.*`, which no config file set. And `queue.stood` stood built-in, so it knew no ticket's age. Every tie then fell to the name.

Left undone, `ticket yours` and `branch list --queue` write a shadow row on every run, and phase 4 cannot switch.

- `./RUNME.sh test src/quack/queue_wiring_test.go` passes, and fails on the wiring `main` holds
- `./RUNME.sh log --kind shadow` names no verbs row stamped after a run of the four verbs:
  - `ticket yours`
  - `ticket yours --next`
  - `branch list --queue`
  - `retro notes`
- `./RUNME.sh check` exits 0

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
