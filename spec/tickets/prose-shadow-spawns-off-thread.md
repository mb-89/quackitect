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
    hash_before: 5ee6c5dc0b8ef453d3b3e5502c6e6d83f521b7de
    hash_after: 5ee6c5dc0b8ef453d3b3e5502c6e6d83f521b7de
    answered:
      - name: tests
        exit: 0
        said: green, 12 test(s) pass in 2 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/vale-ls-windows-trial.md:41:1: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: 7a1656cb20541a0c
        size: 237
    def: fdd86be60f49a659
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

readsProse in src/bridge/prose.js fires the shadow unawaited, but its spawn runs sync on the bridge server, so every read carrying a Vale finding waits on quack prose; start the process through proc.start, and move quackAt inside the try

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/prose-shadow-wiring.test.js test/level0/prose-shadow.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The draft shadow in readsProse now starts quack prose through the proc door start, so the bridge server answers other hooks while the shadow runs, where before a sync spawn held its event loop on every read carrying a Vale finding. It builds its doors inside the try, so a box naming no method writes nothing and rejects nothing.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

The change follows the ask: start where the door has it, and quackAt inside the try.
The change reveals no cleanup.
The start stands in the proc door, and the shadow reaches it there.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
