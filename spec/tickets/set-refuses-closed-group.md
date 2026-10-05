---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: a-closed-group-child-pulls/gate
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
parent: a-closed-group-child-pulls
group: a-closed-group-child-pulls
record:
  - step: do
    hand: box c2e39844c8bf · claude-code-remote
    hash_before: 5a4c9cb1c469fb851b173ab71cbc2872082d3363
    hash_after: 5a4c9cb1c469fb851b173ab71cbc2872082d3363
    answered:
      - name: tests
        exit: 0
        said: green
      - name: check
        exit: 0
        said: "    2.7  test/contract/paragraph.test.js a character outside the set is refused, and a code span passes"
    inputs:
      - name: ask
        hash: d34d6b75f6bb1e88
        size: 128
    def: 5b2f3491b4fe0a0b
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

`ticket set <t> group <g>` writes a closed group unguarded, so a child still lands under one. Call `pull.ClosedGroup` there too.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

go test ./src/quack -run "TestTicketSet|TestTicketUrgent" > /dev/null 2>&1 && echo green

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

ticket set refuses to write a group that stands closed, with the same refusal the mint and the open give. TestTicketSet gains a case: set group shut answers 2, names both roads out, and leaves the ticket as it stood. The design note names the set beside the mint and the open.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the ask: ticketWritten calls pull.ClosedGroup on a group write alone, as the ask names
- the cleanup: the guard reads the tickets on a group write alone, so urgent and the other fields pay nothing
- one place: the refusal text stands in pull.ClosedGroup, and the set prints it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
