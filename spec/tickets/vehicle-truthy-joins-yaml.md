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
    hash_before: c960e15c8eeaf2eeb38904a93c2a3605fecedd09
    hash_after: c960e15c8eeaf2eeb38904a93c2a3605fecedd09
    answered:
      - name: tests
        exit: 0
        said: green
      - name: check
        exit: 0
        said: "   96.9  in all"
    inputs:
      - name: ask
        hash: 5d053c095046c0cd
        size: 332
    def: ff48085f241db4b2
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

src/vehicle/json.go holds a ninth copy, exported as Truthy, with the body voice.go holds in another case order. The approach and its callers list leave it and its callers in src/vehicle/pure.go out. Fold it into yaml.Truthy with the rest, since the ask wants each helper in one package, and the grep for a lower-case name misses it.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

CGO_ENABLED=0 go test -count=1 ./src/vehicle/ ./src/yaml/ && echo green

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

src/vehicle held its own exported Truthy, a ninth copy the parent's draft and its grep missed for its capital letter. The copy is gone, and every call in src/vehicle/pure.go reads yaml.Truthy. The parent's yaml body stood as a stub reading every value false, so this change lands it with the fold: it takes the union of the copies, nil, bool, int, int64, float64 with NaN, and string. yaml's TestTruthyReadsEachKind now passes, and the vehicle tests pass over the new call.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

The change follows the ask: vehicle's Truthy folds into yaml.Truthy, and its callers in pure.go call yaml.
The cleanup the fold reveals is in the change: the yaml stub had to read truly before vehicle could lean on it, so its body lands here, and the other copies stay the parent's implement step.
The truthy body stands once in src/yaml/value.go, and vehicle points at it.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
