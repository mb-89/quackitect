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
    hash_before: e10e0bebca108850a04e8945599b834c5ef4d5d0
    hash_after: bae616b27b14d34da3b76e4910fbd446a09fd854
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/files passes; green, src/quack passes
      - name: check
        exit: 0
        said: "   62.6  in all"
    inputs:
      - name: ask
        hash: cb2516f480026c4e
        size: 227
    def: 7460963fdc3d5ca5
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

ioOver in src/quack/io.go exits the whole IO process on one instance's start fault, and the daemon's stderr reaches nowhere, so git dies beside watch with no line a reader sees; the fault wants a log row or a lone instance down

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

The IO process ran every IO instance and exited whole when one start failed, so a watch seed past the bus cap took the git ports down too, and the daemon's stderr reached nowhere. ioOver now writes a session log row of kind io-start-fault naming the instance and its fault, and runs the other instances on. ioMain passes the session log writer, and the bus case drives a broken start beside a working one.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the ask: the change takes both halves the gate named, a log row and a lone instance down
cleanup: the watcher fix the fault hid lands beside it, and the seed size stands as seed-splits-under-bus-cap
one place: the row kind stands once as ioStartFault in src/quack/io.go

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
