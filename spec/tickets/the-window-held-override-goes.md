---
kind: [[ticket]]
state: closed
step: do
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-tickets-topic-lands/design/review
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
process_hash: 2b5ab398855a1aba
group: tui-shell-lands-in-shadow
parent: the-tickets-topic-lands
record:
  - step: do
    hand: box d856db450bd7 · claude-code-remote
    hash_before: 80a65d4a997a812f23b3e974ddb2b14209c895b6
    hash_after: 80a65d4a997a812f23b3e974ddb2b14209c895b6
    answered:
      - name: tests
        exit: 0
        said: green, src/tui/work passes
      - name: check
        exit: 0
        said: "spec/tickets/vale-ls-windows-trial.md:41:1: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: 0c7d250b2d9dce29
        size: 176
    def: b9df9de658bcf6e8
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

`Placed` in `src/tui/work/workplaces.go` reads held off the queue place whatever the index answers, a held reading the approach leaves standing against the ask's one held rule.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/tui/work

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The window stops reading held off the queue place. A ticket at place zero keeps the state the index answers, since the held rule stands in the tickets module alone. A todo row the index lacks still reads held at place zero.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches workplaces.go and its test alone, both in the ask
- the index answer stands as the one reading of held, and the comment points at this ticket
- no door is reached, so no fake is owed

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

The tickets topic leaves this reading to the window phase. The row at the queue's in-hand place is the one this box works now, and the window reshapes `Placed` there. [[spec/tickets/the-tickets-topic-lands]]
