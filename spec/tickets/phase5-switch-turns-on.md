---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: anyone
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
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
step: do
record:
  - step: do
    hand: box d856e248e31998 · claude-code-remote
    hash_before: 7abd43aa68c277f1c3bf8dcc55d127af9202f396
    hash_after: 7abd43aa68c277f1c3bf8dcc55d127af9202f396
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/migration passes; green, src/modules/hooks passes
      - name: check
        exit: 0
        said: "spec/tickets/vale-ls-windows-trial.md:41:1: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: 19db130e96488fb2
        size: 645
      - name: [[spec/tickets/go-cage-switches-over]]
        hash: 3a226fd3193528d2
        size: 6086
      - name: [[spec/tickets/cage-rules-port-before-switch]]
        hash: 40cadd73cf019d28
        size: 8473
    def: df12650931d480c9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

The phase-5 switch opens [[spec/tickets/go-cage-switches-over]] and moves no slice key. That group holds [[spec/tickets/cage-rules-port-before-switch]], which ports the cage rules until the shadow reads clean. It moves `migration.cage` to `new` only after that. The shadow names the gap that ticket closes, so the switch waits on nothing but itself.

While the switch reads false, the group cannot start, and the port that would clean the shadow never runs.

- `./RUNME.sh config` reads `migration.phase5switch true`
- `./RUNME.sh config` reads `migration.cage shadow`
- `./RUNME.sh check` exits 0

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/modules/migration src/modules/hooks

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

A cloud box ran a spread of tool work against this tree with the cage at shadow. The hooks door stood and took the posts. The shadow log named five rows. In each, the bridge refused and the Go door passed, and every pass read alike. That is the gap cage-rules-port-before-switch names, since no rule stands ported yet. The phase switch opens the group and moves no key. The group ports the rules and moves the cage slice to new only once the shadow reads clean. So the switch turns true, and the cage stays at shadow. The run stands on the branch claude/shadow-evidence-5-6.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: one key in spec/config/level0.json, and the cage key stands
- the cleanup it reveals: the port stands as its own ticket in the group
- every fact stands once: the rows stand on the evidence branch, and this ticket points at it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
