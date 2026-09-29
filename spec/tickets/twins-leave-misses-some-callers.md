---
kind: [[ticket]]
state: open
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
todo: true
step: do
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: read-topics-switch-over
parent: the-js-twins-leave
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the builder fixes these in place. test/level0/check-server.test.js holds a case on the log verb's shadow doors. src/modules/hooks/cage.go names src/scripts/log-shadow.js as the owner of the shadow row in two comments. src/scripts/cli-read.js carries the prose shadow's config and log. The help text of the five keys in spec/config/level0.schema.json still names old and shadow. The callers list says pull-hand.js imports processNameOf from guidance-shadow.js, but it already imports it from quack-topic.js.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
