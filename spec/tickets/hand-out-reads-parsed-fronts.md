---
kind: [[ticket]]
state: closed
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
group: branches-and-pull-report-truly
step: do
record:
  - step: do
    hand: box 8339730da099 · claude-code-remote
    hash_before: 4f2754fd3912af1623e8d91817f93e87bca2a935
    hash_after: 4f2754fd3912af1623e8d91817f93e87bca2a935
    answered:
      - name: tests
        exit: 0
        said: green, src/pull passes
      - name: check
        exit: 0
        said: "  105.0  in all"
    inputs:
      - name: ask
        hash: 94879c774e6a4611
        size: 435
    def: df12650931d480c9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
gain: a pull reads each ticket's fields off the front `TicketsHere` already parses, so a hand-out costs one parse a ticket.

<!-- breaks, as text: what breaks if it is never done -->
breaks: `FieldOf` in `src/pull/tickets.go` parses the whole ticket on every call, and the hand-out calls it many times a ticket each pull. Each pull spends seconds on parsing.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
done_when:

- `go test ./src/pull/ -run TestTheHandOutReadsFieldsOffTheParsedFront` passes
- `./RUNME.sh check` answers 0 on this box

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

    ./RUNME.sh branch test src/pull/pull_hand_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

`FieldOf` in `src/pull/tickets.go` parses a whole ticket on each call, and the hand-out called it many times a ticket each pull. `Held` now carries the text its front was parsed off. `Held.Field` and `Held.IsGroup` read the parsed front, and parse again only once the text moves. `TicketsHere` records its own parse, so a hand-out costs one parse a ticket. The hand-out sites in `pull_hand.go`, `pull_branch.go`, `pull_accept.go`, `pull_writes.go` and `tickets.go` read through `Held.Field`. A write that moves `Text` without `Front` still reads right, because the text check parses again.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the hand-out reads each field off the front `TicketsHere` parses
- the cleanup is in the change: every hand-out site holding a `Held` reads through `Held.Field`, and `FieldOf` stays for a bare text
- the fact stands once: `Held.Field` alone decides when a front parses again

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
