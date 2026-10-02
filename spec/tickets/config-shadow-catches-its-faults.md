---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: read-topics-land-in-shadow/accept
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
parent: read-topics-land-in-shadow
record:
  - step: do
    hand: box d84d03dd63d7 · claude-code-remote
    hash_before: 037e625fbf3659e502dddd8be3f6574ce5aa2a6f
    hash_after: 037e625fbf3659e502dddd8be3f6574ce5aa2a6f
    answered:
      - name: tests
        exit: 0
        said: green, 17 test(s) pass in 2 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/vale-ls-windows-trial.md:41:1: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: 908fb75408b3b1da
        size: 284
    def: fdd86be60f49a659
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

src/scripts/config-shadow.js runs proc.run with no try and no timeout, and the proc door throws where the binary stands but fails to run, so ./RUNME.sh config prints its rows and then dies on a stack trace; catch the fault as the log, guidance and prose shadows do, and pass a timeout

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/config-shadow.test.js test/contract/cli-check-doors.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The config shadow now runs quack config under a timeout, and a binary that stands but fails to run, or runs past the timeout, leaves the config verb answer standing and writes no row, as the log, guidance and prose shadows already do. Before, the proc door threw and the verb died on a stack trace after printing its rows.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

The change follows the ask: the shadow catches the fault and passes a timeout.
The change reveals no cleanup.
The timeout stands once, as RUN_TIMEOUT_MS in src/scripts/config-shadow.js, and the case reads it there.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
