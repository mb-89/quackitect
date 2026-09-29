---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-js-twins-leave/gate
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
group: read-topics-switch-over
parent: the-js-twins-leave
record:
  - step: do
    hand: box d857c176ced7 · claude-code-remote
    hash_before: 7ababf6a4c780491fee7ecc525389c12cbf2ee27
    hash_after: 7ababf6a4c780491fee7ecc525389c12cbf2ee27
    answered:
      - name: tests
        exit: 0
        said: green, 12 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/vale-ls-windows-trial.md:41:1: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: 91efee701ee5ca6a
        size: 256
    def: bc525a46695a1153
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

readers-take-the-go-topics hands the old-path fallback to this ticket to remove, and the approach keeps it on the assumption that the quack binary stands everywhere. This child removes the fallback once that holds, and makes a topic answering null a fault.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/topic-readers.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

A reader on a new slice now takes its Go topic's answer alone. Where the topic answers nothing, the config and log verbs, the guidance reads and both prose readers throw an error naming the topic and the doctor verb. A guidance map naming no notes for a leaf reads as no notes, since Go owns that answer now. Removing the fallback showed a fault it hid: configRowsOf parsed each value again, while quack config already prints each value as JSON. So every real config read fell back to the old resolver. configRowsOf now takes each value as it stands, and the fixtures take the shape the binary prints. Weighed: a loud fault on a missing binary against a silent old path that lets two answers drift apart. Assumed: the installer builds quack on every box, as the shadows already assume.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the fallback leaves every reader, and a topic answering nothing throws
- the cleanup the change reveals is in the change: configRowsOf reads the value quack config prints
- every fact stands in one place: answerOf in quack-topic.js owns the fault, and each reader calls it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
