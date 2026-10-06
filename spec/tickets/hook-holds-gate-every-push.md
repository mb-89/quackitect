---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: git-hooks-run-in-go/gate
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
step: do
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: javascript-leaves
parent: git-hooks-run-in-go
record:
  - step: do
    hand: box fb4ccb7cacc7 · claude-code-remote
    hash_before: de4fc2d0d9af78637e1bef50a73dbe64fd3e5143
    hash_after: de4fc2d0d9af78637e1bef50a73dbe64fd3e5143
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/hooks passes
      - name: check
        exit: 0
        said: "    1.7  test/contract/front.test.js set, drop, entry and after write what se-front writes over tickets of this tree"
    inputs:
      - name: ask
        hash: 58a88f0357101bee
        size: 337
    def: 1ccaf5115d7b59f8
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

item 6 gates the hold and stale rules on an agent's push and says agentPushes holds it so today, but prepush.js gates the battery and unchecked rules alone on engine, and runs the hold, stale, cloud-trunk and todo rules for every push. Keep the hold and stale rules ungated, and add a case where the owner's terminal meets a held branch.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/modules/hooks/githooks_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

Commit ca8489011 runs the hold and stale rules on every push, as prepush.js did. In PrePush the battery and the unchecked-tip rules stand inside the agent gate, and heldRefusal runs past it for every push. TestPrePushHoldsTheOwnersPushOntoAHeldBranch pushes with no agent flag onto a branch another box holds, and the push meets the refusal.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: the hold and stale rules run ungated, and the owner's terminal case stands in githooks_test.go.
the cleanup the change reveals: item 6 stands in the design chapter of the closed git-hooks-run-in-go, whose closing summary records the ungated rule, so the record stays.
every fact stands in one place: the rule order lives in PrePush alone, and the design note points at the ticket.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
