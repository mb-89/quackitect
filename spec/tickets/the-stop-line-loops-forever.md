---
kind: [[ticket]]
state: closed
group: findings
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: anyone
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
process: [[spec/processes/trivial]]
process_hash: 05e53b89dab63152
step: do
record:
  - step: do
    hand: box a05106ef44c2 · claude-code-remote
    hash_before: 027a8f1e0f882ed597dd44c45ecf49f5dae454ee
    hash_after: 027a8f1e0f882ed597dd44c45ecf49f5dae454ee
    answered:
      - name: tests
        exit: 0
        said: green, 56 test(s) pass in 3 file(s)
      - name: check
        exit: 0
        said: 6 stand at warning. A commit and a push land over them, and the refactoring hand drains them past main's check.
reason: done
---

# Ask

A turn ends after the tooth refuses the stop line the number of times the config names, whatever the queue holds. Today the stop hook refused four stop lines in a row while the queue held work, and only the shutdown closed the turn. Done when a case drives four refusals under the queue binding and the fourth turn ends, and the vote's log line names the runaway.

# do

<!-- makes the change, with the test that covers it -->

## tests

./RUNME.sh branch test test/level0/stop.test.js test/level0/stop-door.test.js test/level0/stop-hold.test.js

## check

./RUNME.sh check

## says

The cap on holds in a row ends a turn over every continue rule, the queue's among them. The flag that held the queue rule past the cap goes, from the rule file, the tooth and the design note. So the last stop line the config allows under the queue binding ends the turn, and the next prompt reads the queue again. The vote's log line writes at warn where the tooth lets go, and it names the holds the cap read, where it named none before. A case drives the stop lines the ask names over a free ticket under the queue binding, and reads the last turn end and its line.

## checked

- the change follows the ask: the cap ends the turn under the queue binding, and the log line names the runaway at warn
- the cleanup is in the change: the flag goes from the rule file, the tooth, the note and the fixtures
- every fact stands in one place: the stop note's chapter holds the rule, and the tooth points at it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
