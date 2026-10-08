---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: sweep-reads-tracked-after-restart/gate
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
point: gate
todo: false
step: do
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: examples-run-as-tests
parent: sweep-reads-tracked-after-restart
record:
  - step: do
    hand: box 23ee163eaf36 · claude-code-remote
    hash_before: d95896696bc6bed8e308c5afe12deed5641f4043
    hash_after: 88e99600a47aad917425b18449159a4aa7359825
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/files passes
      - name: check
        exit: 0
        said: "   59.5  in all"
    inputs:
      - name: ask
        hash: 4cb40ea171b6714c
        size: 245
    def: 7460963fdc3d5ca5
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

Seeds commits the whole standing tree in one message, and the text alone reads about a third of the 64 MiB bus cap (src/index/bus.go busPayload); a growing tree or a large text file meets the same death, so the seed wants batches or a size guard

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The watcher's seed sent the whole standing tree as one bus message, and the text alone fills about a third of the bus cap. The seed now commits in batches of at most seedBatch text bytes, the last batch landing whatever stands. The empty commit the IO process sends after each start still tells a reader the seed stands whole.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the ask: the change takes the batches the gate named
cleanup: none past the change, since the binary filter lands under sweep-reads-tracked-after-restart
one place: the cap stands once as seedBatch in src/modules/files/watch.go

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
