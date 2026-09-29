---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: agents-call-quack-directly/gate
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
group: quack-verbs-switch-over
parent: agents-call-quack-directly
record:
  - step: do
    hand: box d85989c4d4d5 · claude-code-remote
    hash_before: 49b8e42af6b375568b9931a79ee956ceda5f867a
    hash_after: 49b8e42af6b375568b9931a79ee956ceda5f867a
    answered:
      - name: tests
        exit: 0
        said: green, 76 test(s) pass in 7 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/verbline-spares-blocking-verbs.md:41:97: Vocabulary: nodeaccept stands outside the words this tree writes. "
    inputs:
      - name: ask
        hash: ec83c936698597b2
        size: 253
    def: fb0b796fd802391d
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the hand-back lines and refusals under src/scripts, pull-chapter.js and ephemeral.js among them, still tell the agent to run ./RUNME.sh; the approach steers the two description surfaces alone, so the ask's shell out to no ./RUNME.sh verb stands half met

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/tool-call.test.js test/level0/pull.test.js test/level0/pull-leaves.test.js test/level0/pull-cap.test.js test/level0/pull-hand.test.js test/level0/pull-format.test.js test/level0/guidance-hand.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The pull names the index tool for every call it tells an agent to make next: the hand-back, the spawn prompt, the guidance reread, the group done line and the refusals. One renderer in src/scripts/tool-call.js writes the tool and its words as the args array. The ephemeral tickets name the tool too. Departure from the ask: the cage refusals and each script verb message keep the shell verb. The cage rules port to Go in phase 5 and each script ports whole, so a rewrite of either now touches text already due to leave. The shell verb still answers every call meanwhile.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask for every line the pull hands an agent, and says why the cage and script messages wait
- the tests asserting the old text now assert the tool form, in the same change
- the tool name stands in callOf alone, which takes its prefix from lib/index-tools.js

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
