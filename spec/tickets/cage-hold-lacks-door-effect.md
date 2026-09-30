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
    hash_before: f930a448f2db7b74f4eb139fa2e53dc611c24588
    hash_after: f930a448f2db7b74f4eb139fa2e53dc611c24588
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/hooks passes
      - name: check
        exit: 0
        said: "spec/tickets/vale-ls-windows-trial.md:41:1: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: eb182ed440ed83c5
        size: 283
    def: 48cdf0f2b22a9792
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the bridge answer `needs: reply` reads as hold, and no effect under spec/design_output/model#the-effects answers a hold, so NewDecisionOf never reads hold. The `classic.Stop` row of test/replay/cage/one-refusal.shadow.jsonl stands until the protocol names the effect a hold ports to.

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

The hook module holds a turn for the reply the answer gate reads, and in the protocol that hold is the rows effect, which asks back for the newest transcript rows. NewDecisionOf now reads a rows effect as hold, so a ported hold agrees with the bridge. The classic.Stop row of test/replay/cage/one-refusal.shadow.jsonl stays, because the door holds nothing until the rule ports.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

The change follows the ask, and names the rows effect of spec/design_output/model#an-effect-asks-back as the effect a hold ports to.
The change reveals no cleanup.
The effect name stands once, as rowsKind in src/modules/hooks/cage.go, and the comment points at the model section.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
