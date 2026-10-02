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
group: module-processes-land-in-shadow
step: do
record:
  - step: do
    hand: box 23776eae9f68 · claude-code-remote
    hash_before: 9ee0de56dad4202c19865e2692354d677cbb5d9e
    hash_after: 65173118046db9f4757c3d0d964efa6131087fdc
    answered:
      - name: tests
        exit: 0
        said: green, src/index passes; green, src/modules/index passes
      - name: check
        exit: 0
        said: "spec/tickets/module-processes-land-in-shadow.md:194:3: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: c01cf4061db65112
        size: 468
    def: df12650931d480c9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

Each start of a placed process hands the dog an expiry hand, and the stop leaves it there. `Dog.Expired` answers a stop, and the stop of a placed process calls it.

The gain: each tick of the dog calls the hands of running processes alone.

What breaks: each restart of a topic adds a hand that every tick calls for the life of the index.

- `go test ./src/modules/index/ ./src/index/` passes, with a case reading no call to a stopped hand
- `./RUNME.sh check` exits 0

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/index/procs_test.go src/modules/index/lease_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

Dog.Expired now answers a stop, and the Leases interface carries it. A placed process drops its expiry hand when it stops, so a restart of its topic leaves no stale hand for each tick to call. A dog case reads no call to a stopped hand, and the placements case reads one drop at the stop.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: Expired answers a stop, and the stop of a placed process calls it
- the cleanup the change reveals is in the change: the fake dog in procs_test.go counts its drops
- every fact the change adds stands in one place: the hand map lives on the dog alone

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
