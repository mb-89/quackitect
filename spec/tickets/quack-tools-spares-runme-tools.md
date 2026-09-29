---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-hook-registers-index-tools/gate
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
group: quack-verbs-land-in-shadow
parent: the-hook-registers-index-tools
record:
  - step: do
    hand: box d8509c02d5db · claude-code-remote
    hash_before: 8e22ec14c950e604c657ddffda67607bb4edf092
    hash_after: 8e22ec14c950e604c657ddffda67607bb4edf092
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "spec/tickets/work-verbs-become-actions.md:260:3: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: 5cedb8c854d36e53
        size: 311
    def: 08e7a00a71f7bc21
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

tools and act joining cliVerbs make aloneOf in src/quack/verbs.go true for them, so roadOf sends ./RUNME.sh tools to quack under every mode and the tools verb of src/scripts/cli.js, which writes .se/.runtime/tools.json, stops answering; keep both verbs out of aloneOf and name verbs.go aloneOf among the callers

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/quack/verbs_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

aloneOf in src/quack/verbs.go takes its verb table as an argument, and refuses each verb cliJsKeeps names: help, tools and act. So once the-hook-registers-index-tools adds tools and act to cliVerbs, ./RUNME.sh tools still reaches cli.js and keeps writing .se/.runtime/tools.json. TestAVerbCliJsAnswersRunsNeverAlone passes a table holding both verbs and fails on the old aloneOf.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: both verbs stay out of aloneOf, and the parent Discussion names verbs.go aloneOf among the callers
the bare help comparison folds into cliJsKeeps, the one set of verbs cli.js keeps
cliJsKeeps owns the kept verbs, and the parent ticket points at this ticket in place of a copy

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
