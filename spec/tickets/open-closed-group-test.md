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
    hash_before: 7b46552816279e4bdc7f496ba14a539eb9e907ad
    hash_after: 7b46552816279e4bdc7f496ba14a539eb9e907ad
    answered:
      - name: tests
        exit: 0
        said: green
      - name: check
        exit: 0
        said: "    1.7  test/contract/desk-start.test.js a server the proc door starts detached writes its marker after its starter exi"
    inputs:
      - name: ask
        hash: f77f2fea10ee3299
        size: 85
    def: 5b2f3491b4fe0a0b
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

`OpensDraft` calls `ClosedGroup` with no test of its own. Add a red test on the open.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

go test ./src/quack -run TestTicketOpen > /dev/null 2>&1 && echo green

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

TestTicketOpen gains a case: a draft naming a closed group under group refuses the open, and stays a draft. With the ClosedGroup call taken out of OpensDraft, the case fails, with open answering 0.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the ask: the case covers the open refusal it names, and it ran red without the guard
- the cleanup: none shows
- one place: the case reuses closedGroupTicket from verb_mint_test.go

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
