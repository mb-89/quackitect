---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: readers-take-the-go-topics/gate
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
parent: readers-take-the-go-topics
record:
  - step: do
    hand: box d856f55387d6 · claude-code-remote
    hash_before: 5e62afbb8bd39bc107d2a30a58971ca981aad9d1
    hash_after: 5e62afbb8bd39bc107d2a30a58971ca981aad9d1
    answered:
      - name: tests
        exit: 0
        said: green, 10 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/vale-ls-windows-trial.md:41:1: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: ab62059bc3cb58f1
        size: 340
    def: 0582d525609d7fdb
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the tests read the mode off it.slices, the approach names no such field and says each reader asks its key, and the itOf fixture also carries config.ask and the prose case plants migration.prose in the tracked file; readsNew in src/scripts/quack-topic.js takes one source, it.slices as the tests read it, and every reader asks readsNew alone

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

readsNew in src/scripts/quack-topic.js reads the mode off it.slices alone. The verbs' doors take the modes at startup in src/scripts/cli-doors.js, and a bridge box holds them as live getters off the config, built by slicesOf in src/bridge/config.js, so a change reaches the next reader. The test fixture no longer carries config.ask, and the prose case plants no tracked file. A box case in test/level0/box-keys.test.js holds the getters.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: every reader asks readsNew, and readsNew asks it.slices alone
- the cleanup the change reveals is in the change: the log level key moved beside slicesOf so server.js stays under its ceiling
- every fact stands in one place: SLICES and slicesOf live in src/bridge/config.js, and cli-doors and the server import them

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
