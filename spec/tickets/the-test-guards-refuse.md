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
group: code-is-pure-tests-behave
depends_on: [go-tests-go-black-box, go-fixtures-move-home, js-tests-cut-to-the-ratio, hand-script-guard-reports, purity-guard-covers-every-outside]
step: do
record:
  - step: do
    hand: box 7b5a2726379b · claude-code-remote
    hash_before: 86d5fe87fec58bc93c331227f65590ceef8e8d7f
    hash_after: 86d5fe87fec58bc93c331227f65590ceef8e8d7f
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes; green, src/imports passes
      - name: check
        exit: 0
        said: "    1.6  test/contract/desk-start.test.js a server the proc door starts detached writes its marker after its starter exi"
    inputs:
      - name: ask
        hash: 777dfc0aea800bad
        size: 544
    def: df12650931d480c9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
The black-box, fixture, ratio and script guards refuse. A new offender fails the check, and the baselines only shrink.

<!-- breaks, as text: what breaks if it is never done -->
A guard in report mode lists offenders nobody reads, as the retro proved, and the tree drifts back.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
- each guard's own test proves the check refuses its planted case off the baseline: an in-package test file, a fixture build in a Test function, a script, a module growing past one to one
- a baseline entry the guard no longer names fails the check until it leaves the baseline
- `./RUNME.sh check` stands green on the tree

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/quack/verb_guards_test.go src/imports/guards_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The blackbox, fixture, ratio and script guards refuse. A new offender or a stale baseline line now turns the check red, so each baseline only shrinks. Each guard meets a planted offender off an empty baseline in src/quack/verb_guards_test.go, and the script guard meets a stale line. The ratio baseline gains go src/index, which the fixture sweep carried past one to one before this switch. Purity stays in report mode, as the ask names the four test guards alone.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask, and the Discussion says why purity stays in report mode and why the ratio baseline gains a line
the cleanup: the src/index ratio stands in the baseline, and the ratio work of the group trims it
one place: the model section owns the modes, and the guards file owns which guard refuses

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

- The ratio baseline gains `go src/index`. The go-fixtures-move-home sweep moved the shared fixtures of `src/index` into its `main_test.go` before refuse mode, which carried the package past one to one. From here the baseline only shrinks.
- The purity guard stays in report mode, since the ask names the four test guards alone.
