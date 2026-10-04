---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: retro-verbs-port-to-go/gate
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
group: retro-verbs-run-in-go
parent: retro-verbs-port-to-go
record:
  - step: do
    hand: box 08f4218ba236 · claude-code-remote
    hash_before: f029befec3e45482e64e6f2d1bbd5aa684e51088
    hash_after: f029befec3e45482e64e6f2d1bbd5aa684e51088
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "   67.7  in all"
    inputs:
      - name: ask
        hash: 50d0fe83f36fd2c2
        size: 245
    def: 6733c78151e933e7
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

TestEveryRetroVerbRegisters passes on the stubs and stands off the red list, so the reaches-no-node line rests on the registry plus TestRetroUsageExitsTwoOnAWordNoVerbAnswers; implement checks by a run that ./RUNME.sh retro <verb> starts no node

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/quack

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The run decides the reaches-no-node line: with src/scripts/verbs/retro.js and every retro module gone from the tree, ./RUNME.sh retro, retro audit, retro score, retro notes, retro timeline and retro backlog each answered from Go, with the usage, a verdict or a refusal and the exit the JavaScript gave. A node start finds no program for retro now, so it fails loud where it ever runs. TestEveryRetroVerbRegisters holds the registry to the action list from here on.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: a run checked each verb, and the says field names what it showed
- the cleanup it reveals: none past the sweep, which the size ticket landed
- the fact stands once: the registry test owns the list, and this ticket points at it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
