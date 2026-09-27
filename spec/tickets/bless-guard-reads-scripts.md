---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: a-gate-asks-a-bless/design/review
    by: anyone
    to: retro
    input: ask
    reads: [[spec/guidance/working]]
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
step: do
process: [[spec/processes/trivial]]
process_hash: 05e53b89dab63152
group: the-process-stays-editable
parent: a-gate-asks-a-bless
record:
  - step: do
    hand: box d7d9b0d5dfcf · claude-code-remote
    hash_before: aca5321a8d48696a456f61fb48796883243a583d
    hash_after: aca5321a8d48696a456f61fb48796883243a583d
    answered:
      - name: tests
        exit: 0
        said: green, 6 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/the-retro-reads-the-backlog.md:145:1: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: 8ec08d9775f42dc9
        size: 406
    def: 99fa1a62aef2e988
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the bless file guard and the harness guard in onBash read the command line alone, and scriptsIn and scriptWrites in .claude/skills/level0/lib/scripted.js pass a script under .se, so `node .se/scripts/x.js` writing .se/.runtime/bless.json or spawning `ticket bless` with CLAUDECODE deleted passes; run both guards over the targets writesAPath and scriptWrites resolve, ahead of FREE, and add a case for each

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/bash-bless.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The change landed in 0072297d0 under a-gate-asks-a-bless. blessGuard in src/bridge/bless.js reads the command and the text of every script scriptsIn names under .se, and refuses a script that names the bless file or moves a variable naming the hand or the box. onBash in src/bridge/bash.js runs blessGuard ahead of commandRules, where FREE passes a script under .se. test/level0/bash-bless.test.js holds a case for each: a script writing the bless file, and a script clearing a harness variable.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask, and landed in 0072297d0 with the parent ticket
no cleanup revealed
the guard points at spec/design_output/pull#the-bless and restates nothing

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
