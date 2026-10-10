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
group: tickets-keep-their-chapters
step: do
record:
  - step: do
    hand: box 1ad094d8843c · claude-code-remote
    hash_before: 2c4baf63385c0d8f5de67706711c5fd967e56250
    hash_after: de1f6a00a5f1b2fa315ec6267e09ff13e1c9a824
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "   69.3  in all"
    inputs:
      - name: ask
        hash: d9ab73d54d82d007
        size: 523
    def: df12650931d480c9
reason: done
---

# Ask

A tracked config or wiring file that fails to parse stops every ticket verb going through pullHere with the parse error, so the pull thresholds never switch off without a word.

A typo in spec/config/level0.json reads every threshold as zero, which turns off the fail-to-person escalation, the refusal cap, the split prompt and the output cap, and nobody hears of it.

- go test ./src/quack -run TestPullHere passes a case where a malformed tracked config makes the verb fail and print the error
- ./RUNME.sh check is green

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/quack/ticket_todo_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The pull in `src/quack/ticket_doors.go` stops with the parse error where the tracked config fails to parse, where it read every threshold as zero and carried on. The error in `src/quack/config.go` names the tracked file, so a reader finds the typo. The case `TestPullHereRefusesABrokenTrackedConfig` writes a config with a trailing comma, and asserts no pull, the failed exit and the file named.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask
- no cleanup stands past the change
- the file name stands once, in `config.Tracked`, and the error reads it there

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
