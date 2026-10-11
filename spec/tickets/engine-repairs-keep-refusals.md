---
kind: [[ticket]]
state: closed
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
record:
  - step: do
    hand: box 8339730da099 · claude-code-remote
    hash_before: dbec3eec75726acb9e0147a68846a999c6c65031
    hash_after: ff5ed0b762f7903ed0bd7f4b724dc9e46807de92
    answered:
      - name: tests
        exit: 0
        said: green, src/pull passes
      - name: check
        exit: 0
        said: "   91.7  in all"
    inputs:
      - name: ask
        hash: f35f45436a3c06e4
        size: 544
    def: 56b47f508ed740df
reason: done
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

    ./RUNME.sh branch test src/pull/pull_landed_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

Four engine repairs moved the ticket in memory and dropped a refused landing, so the hand-out read a ticket the disk lacks. They now land through the one helper that puts the held text back on a refusal, and the person step repair pushes nothing past one.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the named test passes, and the check answers 0
- the cleanup the change reveals: none past the four sites
- every fact stands in one place: the put-back lives in movedAlone alone
- the test covers the strip, and the other three sites share its one helper

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
