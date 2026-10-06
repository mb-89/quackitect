---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: shared-helpers-stand-once/gate
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
group: engine-verbs-hold
parent: shared-helpers-stand-once
record:
  - step: do
    hand: box 57a5a484096e · claude-code-remote
    hash_before: 5725395742111227c4ffae96aeac6bff9de0b2c4
    hash_after: 5725395742111227c4ffae96aeac6bff9de0b2c4
    answered:
      - name: tests
        exit: 0
        said: green
      - name: check
        exit: 0
        said: "  115.5  in all"
    inputs:
      - name: ask
        hash: c7a7b8992f7ea510
        size: 360
    def: ff48085f241db4b2
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

src/quack/retro_collect_values.go holds retroCollectTruthy, the voice.go body under another name with its cases in another order, so neither the grep for func truthy nor a rule printing bodies exactly finds it. Fold it into yaml.Truthy and point its callers in retro_collect.go and retro_collect_values.go there, since the ask wants each helper in one package.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

CGO_ENABLED=0 go test -count=1 ./src/quack/ -run '^TestRetroCollect' && echo green

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

src/quack held retroCollectTruthy, the truthy body under another name, which the grep for func truthy and a rule printing bodies exactly both miss. The copy is gone, and its three callers in retro_collect.go and retro_collect_values.go read yaml.Truthy. The no-report case now also proves a battery of false, zero or the empty string keeps nothing, as JavaScript reads it.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

The change follows the ask: the copy folds into yaml.Truthy, and its callers in both files point there.
The change reveals no further cleanup: retroJSTruthy reads two more value types and stays its own helper, as the gate found.
The truthy body stands once in src/yaml/value.go, and quack points at it.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
