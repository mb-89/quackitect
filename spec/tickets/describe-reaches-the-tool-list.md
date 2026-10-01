---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: agents-call-quack-directly/gate
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
group: quack-verbs-switch-over
parent: agents-call-quack-directly
record:
  - step: do
    hand: box d85989c4d4d5 · claude-code-remote
    hash_before: 60f0bfb056e04bda0c8de04c43b4955f1e1a1002
    hash_after: 60f0bfb056e04bda0c8de04c43b4955f1e1a1002
    answered:
      - name: tests
        exit: 0
        said: green, 48 test(s) pass in 2 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/verbline-spares-blocking-verbs.md:41:97: Vocabulary: nodeaccept stands outside the words this tree writes. "
    inputs:
      - name: ask
        hash: d7f591001a78a588
        size: 174
    def: fb0b796fd802391d
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

onDescribe in src/bridge/bash.js takes the event alone, and verbLine(tools) needs the tool list; the draft names no road from the list registersIndexTools reads to the bridge

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/tools-door.test.js test/level0/bash.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The Bash description and the standing text now read one list: the tools the index lists, read once a box in src/bridge/index-tools.js. The description takes the box the bridge hands every handler, and names the tool for check, branch and doctor. Where the list answers nothing, it names the shell verbs as before. The change pushed lib/bash.js past the file ceiling, so the verb line and the commit reads each moved to a file of their own.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the description reaches the tool list the hook registers from
- the change cuts the ceiling it trips, by topic
- the binary path stays with its owner in lib/index-tools.js, and the bridge imports it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
