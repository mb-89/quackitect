---
kind: [[ticket]]
state: open
steps:
  - name: do
    does: makes the change with tests covering every rule of the ask, commits both on a clean tree, and stops once they pass
    from: anyone
    by: anyone
    to: retro
    input: ask
    tags: ["code", "testing"]
    needs: ["branch test"]
    checklist: ["the change follows the ask, or the discussion says why it departs", "the cleanup the change reveals is in the change, or is a note of its own", "every fact the change adds stands in one place, and a note points at the file instead of repeating it", "stop when the tests cover every rule of the ask and pass, and leave working code alone"]
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
process_hash: 2a00b62f7c4bc60b
group: branches-and-pull-report-truly
step: do
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
gain: a refused engine repair leaves the ticket in memory as the disk holds it, so the hand-out reads the real ticket.

<!-- breaks, as text: what breaks if it is never done -->
breaks: Four engine repairs drop the answer of `landedAlone`. They are the re-route and the stale mark in `pull_stale.go`, the person-step repair in `pull_person.go` and the bless strip in `pull_bless.go`. A refused landing leaves the moved text in memory while the disk keeps the old one.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
done_when:

- `go test ./src/pull/ -run TestARefusedRepairKeepsTheTicketAsItStands` passes
- `./RUNME.sh check` answers 0 on this box

# do

<!-- makes the change with tests covering every rule of the ask, commits both on a clean tree, and stops once they pass -->

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
