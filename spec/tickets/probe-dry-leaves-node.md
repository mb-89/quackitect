---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: box-verbs-port-to-go/gate
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
group: box-verbs-run-in-go
parent: box-verbs-port-to-go
record:
  - step: do
    hand: box 8ca46dccf16b · claude-code-remote
    hash_before: 5c68b75068894f48aefd4f3a29a94df9dc95bf9d
    hash_after: 5c68b75068894f48aefd4f3a29a94df9dc95bf9d
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "   64.6  in all"
    inputs:
      - name: ask
        hash: 0acdc3cacd7eed00
        size: 276
    def: 89146b8ec86d255d
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the approach keeps ./RUNME.sh probe dry (and probeApart in the check) on node through probe-dry.js, while done_when 2 says probe reaches no node; the ask's second paragraph tolerates it, so record the exception on the ticket and carry the hook module's port as its own ticket.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/quack/box_no_node_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

probe dry keeps starting node, and the port ticket says so under Discussion as the one exception to its second done_when line. The client takes a plugin hook module as JavaScript, and the dry session loads that module in process, so no Go port removes the runtime while that contract holds. No follow-up ticket stands for it, since no work on this tree changes the client contract. The no-node case runs the probe under compact, cold and reply, and leaves dry out on purpose.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the ask asks for the exception on the ticket, and the Discussion of the port carries it
- the hook module port the ask names is no work this tree can do, so the change mints no ticket and says why
- the exception stands once, in the port ticket, and the no-node test points at that ticket

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
