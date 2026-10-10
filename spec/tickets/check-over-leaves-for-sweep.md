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
group: checks-and-index-read-right
step: do
record:
  - step: do
    hand: box f689bbb375f6 · claude-code-remote
    hash_before: 1fdd7d180f36546302da28e6d97e5573e5ced9a6
    hash_after: f3dbc522beff1ecc06a4764b65a8c9d89bd35e55
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/check passes; green, src/imports passes
      - name: check
        exit: 0
        said: "   65.7  in all"
    inputs:
      - name: ask
        hash: 705d213c3d2ec3bf
        size: 422
    def: df12650931d480c9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
gain: one rule list owns the check's rules, so a rule added to `Rules` reaches every entry point.

<!-- breaks, as text: what breaks if it is never done -->
breaks: `Checker.Over` and `readers` in `src/modules/check/checker.go` keep a second rule list that already drifts from `Rules`, and `export.go` carries aliases nobody imports.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
done_when:

- `go test ./src/modules/check/ ./src/imports/` passes with the imports case reading through the sweep
- `./RUNME.sh check` answers 0

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

    ./RUNME.sh test src/modules/check src/imports

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

`Checker.Over` and its `readers` map go, so `Rules` alone names the check rules. The engine-field hint joins `Rules` as `engineSweep`, so the editor sweep draws it. The two tests read the sweep filtered by file, and `export.go` keeps only the aliases another package imports.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask, and moves `engineFaults` into `Rules` since `Over` alone reached it
- the stale `Whole` in the lsp design note reads `Sweep`
- the rule list stands in `Rules` alone

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
