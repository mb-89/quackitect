---
kind: [[ticket]]
state: open
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
step: do
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

- [[spec/tickets/the-editor-takes-an-inset]] hands this over at `decide`, which waits for a person.
