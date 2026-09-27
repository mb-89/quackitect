---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: a-gate-asks-a-bless/design/review
    by: anyone
    to: retro
    input: ask
    reads: [[spec/guidance/working]]
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
step: do
process: [[spec/processes/trivial]]
process_hash: 05e53b89dab63152
group: the-process-stays-editable
parent: a-gate-asks-a-bless
record:
  - step: do
    hand: box d7d9b0d5dfcf · claude-code-remote
    hash_before: 686bd0f772c288c03c0dc8f2a5989f06ceeb154b
    hash_after: 686bd0f772c288c03c0dc8f2a5989f06ceeb154b
    answered:
      - name: tests
        exit: 0
        said: green, 27 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/the-retro-reads-the-backlog.md:145:1: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: 5f43f5ee6a0bba4e
        size: 232
    def: 99fa1a62aef2e988
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the key leaves the config tree, so no level0.schema.json entry draws the sidebar button; name the file that draws it beside the `bless` kind in `took` in src/extension/sidebar.js, and add a case that the button writes the bless file

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/sidebar.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The bless kind in took in src/extension/sidebar.js now names the two files behind the button: src/extension/lib/panel.js draws it and src/extension/webview/clicks.js sends the kind. No schema entry draws it. The case in test/level0/sidebar.test.js already holds that the button draws with no schema entry and that the message writes the bless file.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: the comment names the drawing file, and the test case stood already from a-gate-asks-a-bless
no cleanup revealed
the comment points at the files and at spec/design_output/pull#the-bless, and restates nothing

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
