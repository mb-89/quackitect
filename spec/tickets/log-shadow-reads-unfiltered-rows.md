---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-log-topic-lands/gate
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
todo: false
step: do
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: read-topics-land-in-shadow
parent: the-log-topic-lands
record:
  - step: do
    hand: box d84d03dd63d7 · claude-code-remote
    hash_before: 0e839d28779455168117109f89b2025d9be639e9
    hash_after: 0e839d28779455168117109f89b2025d9be639e9
    answered:
      - name: tests
        exit: 0
        said: "green, 20 test(s) pass in 4 file(s); green, src/modules/log passes; green, src/modules/files passes; green, src/tui/log "
      - name: check
        exit: 0
        said: "spec/tickets/vale-ls-windows-trial.md:41:1: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: a3c391b7c016243b
        size: 186
    def: 6c1ad5c4fe724f6a
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the log verb narrows its rows by span, level, kind and count, and quack log answers every row, so the shadow compares the rows before any filter, else each row a filter drops reads apart

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/log-shadow.test.js test/level0/log-shadow-wiring.test.js test/level0/log-golden.test.js test/level0/log-verb.test.js src/modules/log src/modules/files src/tui/log src/quack

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The log shadow now reads the session log whole, before the span, level, kind and count flags narrow what the verb prints, since quack log answers every row of that one file. A verb run under any flag writes a shadow row only where the two readers read a row apart. The log module, quack log and the watch that mirrors .se/.log land with it, and the log verb runs the shadow after it prints its answer. The rows pair by position once each side drops its shadow rows, and a row the module reads past the verb read counts as the log growing between the two reads. Weighed: a door row with no kind reads apart on every run, since the old reader leaves its kind empty and the module names its door; the shadow exists to name that difference, so it stands.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

The change follows the ask: the shadow compares the whole file, before any filter.
The cleanup the change reveals rides in it: tuiDoors in cli-check.js hands the verb the config and log doors the shadow reads, and a case reads them.
The ladder stands once, in src/modules/log/log.go, and the golden holds each reader answer beside it.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
