---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: cage-rules-replay-session-logs/gate
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
group: go-cage-lands-in-shadow
parent: cage-rules-replay-session-logs
record:
  - step: do
    hand: box d8535e12fc10e · claude-code-remote
    hash_before: 471d9e3eb80a35a58d3a4e564ee0fe1559ac1286
    hash_after: 471d9e3eb80a35a58d3a4e564ee0fe1559ac1286
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/hooks passes
      - name: check
        exit: 0
        said: "spec/tickets/vale-ls-windows-trial.md:41:1: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: 433e070770e1b763
        size: 479
    def: 48cdf0f2b22a9792
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

OldDecisionOf reads `result.block` as block on every event, but on `tool.call` the hook module returns `answer.result`, so the bridge refuses the call there, as `holdsForAnswer` in src/bridge/answer.js answers it. The door answers that call with a `result` effect, which NewDecisionOf reads as refuse, so the row never agrees. Pass the event to OldDecisionOf, read `result.block` as refuse outside `classic.Stop`, and add a `tool.call` row to TestDecisionOfReadsTheBridgesAnswer.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/modules/hooks/cage_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

On a tool.call the hook module hands the bridge result.block to the harness as the call result, so the bridge refuses the call. OldDecisionOf now takes the event, and reads result.block as block on classic.Stop and as refuse elsewhere. A ported refusal then agrees with the door result effect. ReplayLog passes the event of each post.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

The change follows the ask: the event reaches OldDecisionOf, and the test gains a tool.call block row.
The change reveals no cleanup.
The Stop event name stands once, as stopEvent in src/modules/hooks/hooks.go, and cage.go reads it there.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
