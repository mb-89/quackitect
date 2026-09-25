---
kind: [[ticket]]
state: closed
steps:
  - name: answer
    does: answers the question the ask carries
    by: person
    to: engine
    input: ask
    evidence:
      - name: answer
        form: text
        says: the answer, which the step behind this one reads
  - name: do
    does: carries the answer out, with the test that covers it
    from: anyone
    by: anyone
    to: retro
    input: answer
    reads: [[spec/guidance/working]]
    needs: ["branch test"]
    checklist: ["the change follows the answer, or the discussion says why it departs", "the cleanup the change reveals is in the change, or is a note of its own", "every fact the change adds stands in one place, and a note points at the file instead of repeating it"]
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
process: [[spec/processes/question]]
process_hash: 1f3006ec4b044a89
record:
  - step: answer
    hand: box d6f05e3a585030 · claude-code · the owner says so
    hash_before: 0b8d33c950095ad932e55997f97c671b02208090
    hash_after: 0b8d33c950095ad932e55997f97c671b02208090
  - step: do
    hand: box d6f05e3a585030 · claude-code
    hash_before: d8650b8d37e731a083fc7555b67f6c2546e9e87c
    hash_after: 4c58425e35cf9f394fc77e6c6cd09fe2f4c1ed71
    answered:
      - name: tests
        exit: 0
        said: green, 42 test(s) pass in 2 file(s)
      - name: check
        exit: 0
        said: The rules pass.
step: do
reason: done
---

# Ask

Does the owner's VS Code draw a web page between the lines of a ticket through `createWebviewTextEditorInset`? The question comes from [[spec/tickets/the-editor-takes-an-inset]], and a page drawn inside the text decides yes.

- the host the editor draws a ticket in, the inset or the side panel

- the owner writes under `answer` whether the page draws

# answer

<!-- answers the question the ask carries -->

## answer

<!-- the answer, which the step behind this one reads -->

Yes. The owner ran the probe, and its page stands between the lines of the ticket, so the editor host is the inset. The page drew the probe's own test route, and its first short draw stood under the grown one. The host draws the real route, and takes one inset a place.

<!-- the form is text -->

# do

<!-- carries the answer out, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

    ./RUNME.sh test test/level0/route-host.test.js test/level0/sidebar.test.js

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

The editor host is the inset. The group [[spec/tickets/the-editor-holds-the-drawing]] builds it, and its merge lands the host on `main`. The owner's `argv.json` turns the proposed API on from the next VS Code restart.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change follows the answer: the host draws in an inset, and the merge carries it
- the cleanup the change reveals stands in no note, since the probe's test route stays a trial
- the host's design stands in [[spec/design_input/the-editor-draws-the-ticket]], and this ticket points there

# Discussion

- [[spec/tickets/the-editor-takes-an-inset]] hands this over at `decide`, which waits for a person.
