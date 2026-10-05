---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: retro-verbs-run-in-go/accept
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
parent: retro-verbs-run-in-go
record:
  - step: do
    hand: box f8b693e22e97 · claude-code-remote
    hash_before: 9f67984614cc088a66cfc62088bb30e87a32f8ce
    hash_after: 9f67984614cc088a66cfc62088bb30e87a32f8ce
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/hooks/command passes
      - name: check
        exit: 0
        said: "   71.4  in all"
    inputs:
      - name: ask
        hash: a03b52628e37cb08
        size: 214
    def: d18d07ca40f70311
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

config.md says the cage refuses SE_MINTED on a command an agent types, and handNames in src/modules/hooks/command/guards.go names no such variable; add SE_MINTED to the guard with a case, so the line states what is

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/modules/hooks/command

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

config.md said the cage refuses a command that sets SE_MINTED, and the bless guard named no such variable. The guard now reads SE_MINTED beside the hand variables, so a hand typing it meets the refusal and the note states what is. A case in findings_test.go holds it.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask
- the cleanup it reveals: none, the guard keeps one list for the names it reads
- the fact stands once: handNames stays the list of hand variables, and the guard list adds SE_MINTED to it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
