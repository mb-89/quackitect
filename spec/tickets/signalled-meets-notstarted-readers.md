---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: quack-spawns-all-take-the-runner/gate
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
group: unfaked-doors-take-fakes
parent: quack-spawns-all-take-the-runner
record:
  - step: do
    hand: box e97c7a20bbd2 · claude-code-remote
    hash_before: a26e612caf66c58cb87734d8d776c6df4a0c98cb
    hash_after: 1ae461cb092ab509c86c9e488b41ab0f04a60e14
    answered:
      - name: tests
        exit: 0
        said: green, src/pull passes
      - name: check
        exit: 0
        said: "   98.6  in all"
    inputs:
      - name: ask
        hash: 133868c6a0ab1ec6
        size: 327
    def: 10d1e4d8ece57c93
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

`Signalled` moves a run a signal ends off `NotStarted`, so `voiceRunsValeOver` in src/quack/voice_verb.go and `ShellOver` in src/pull/door.go answer code -2 with no fault where they answered the fault before. Neither file stands in size, and voice_verb.go stands in no callers line. The builder decides each reader at its spot.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/pull/shell_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

Signalled parts a run a signal ends from NotStarted. ShellOver in src/pull/door.go and voiceRunsValeOver in src/quack/voice_verb.go answered the fault on NotStarted, which a signal shared, so each now answers the fault on Signalled too, and a signal never reads as an exit with no fault. A case beside each holds it.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask, deciding both readers alike
- no cleanup shows past the two readers
- the rule stands in each reader, and the door owns the code

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
