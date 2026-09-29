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
    hash_before: e00ae7b61270ba954eabe52909d2402f5fe5dcd7
    hash_after: e00ae7b61270ba954eabe52909d2402f5fe5dcd7
    answered:
      - name: tests
        exit: 0
        said: green, 11 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/vale-ls-windows-trial.md:41:1: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: ca6043708d2fd2f1
        size: 598
    def: bc525a46695a1153
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the ask names the twins row of the migration note (tree, schema, size, magic, names, paths, private, slug, the Vale and Biome parsers), and the group's done line reads no JavaScript twin of a Go check stands, yet the approach removes the four comparison twins alone. The code backs the scoping: bridge/write.js, bridge/bash.js, precommit.js, cli-check.js and bridge/findings.js import the lib check twins, and every check/ name in src/modules/check/check.go holds an empty list until phase 7. No ticket owns their leave, so this child carries it to phase 7 and moves the group's done line to match.

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

The group's done line reads over the Go topics, so the config, log, guidance and prose comparison twins leave in this group. The check twins stay until phase 7, because every check name answers an empty list until then, and the phase 7 switch now carries their leave in its Discussion. Weighed: removing the check twins here against leaving them. Removing them empties the check verb, since the Go names answer nothing yet. The engine owns both asks, so the scope stands as a Discussion line on each ticket. Along the way the write door threw on every note write, because topicOf read a join the write door's box never carries. topicOf now takes the join of node:path where the doors carry none, and a case in topic-readers.test.js holds it.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the done line reads the comparison twins, and phase 7 carries the check twins
- the cleanup the change reveals is in the change: the write door's join fault, with its case
- every fact stands in one place: the twins row of the migration note lists the check twins, and both Discussion lines point at it or at this ticket

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
