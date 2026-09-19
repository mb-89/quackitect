---
kind: [[ticket]]
state: closed
urgent: true
step: do
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: anyone
    by: anyone
    to: retro
    input: ask
    reads: [[spec/guidance/working]]
    needs: ["work test"]
    checklist: ["the change follows the ask, or the discussion says why it departs", "the cleanup the change reveals is in the change, or is a note of its own"]
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
process: [[spec/processes/trivial]]
process_hash: 568f402efe3adab7
record:
  - step: do
    hand: box d42624a67d18a8
    hash_before: 6fdbcf9d8d586cc5ccc20b910a3135f1dab3b8fc
    hash_after: 6fa40d88a12085bee28b5d8e0bdd35dda97961e0
    answered:
      - name: tests
        exit: 0
        said: green, 21 test(s) pass in 2 file(s)
      - name: check
        exit: 0
        said: 50 stand at warning, which the panel draws and check allows.
reason: done
---

# Ask

An answer the agent writes mid-turn reaches the owner in the chat at that moment, in markdown, and the door reads it there. So a question the owner asks mid-turn meets its answer where they read.

Today the answer lands in the log alone until the turn ends. The viewer draws it as one run of plain text, and the answer door warns on every call after it. Three moments in this box's log show each.

- a report mid-turn stands in the chat and in the log both, and a test drives the chat road
- the viewer draws the detail of a log line as markdown, so a list and a table keep their shape
- the answer door reads a report as the answer and warns on no call after, and a test drives it

# do

<!-- makes the change, with the test that covers it -->

## tests

    ./RUNME.sh branch test test/level0/answer-door.test.js test/level0/log.test.js

## check

    ./RUNME.sh check

## says

A hook writes no chat text, so the chat road is the agent's. The door's refusal now names the chat first and the report beside it, with the same text. The report's result asks for the chat text too. The report pays the demand at once, and a test drives that no call after it meets the door. The log keeps an answer's lines, so a list and a table keep their shape in the viewer. Its detail pane wraps line by line.

## checked

- the change follows the ask where a hook reaches, and the discussion says where the chat road stays the agent's
- the cleanup the change reveals is none
- the words stand in the door alone, and the design chapter points at them

# Discussion

The first done line asks for a report standing in the chat. A hook writes no chat text, so the agent writes it there and the door's words tell it to. The second asks the viewer to draw markdown, and its pane wraps line by line already. The log collapsed an answer's lines, and now keeps them.
