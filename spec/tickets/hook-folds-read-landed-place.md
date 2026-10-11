---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: hold-verdicts-ride-the-post/gate
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
group: hooks-v1-hold-the-line
parent: hold-verdicts-ride-the-post
record:
  - step: do
    hand: box f9a277082525 · claude-code-remote
    hash_before: b282a105dfdac96ac9263c5234bb80d4d93f7617
    hash_after: 72c05abdde4c150cd91acde4623b38a9fd948abc
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/hooks passes
      - name: check
        exit: 0
        said: "   98.5  in all"
    inputs:
      - name: ask
        hash: 38fc75f65a360be7
        size: 179
    def: 9ddc041fe26ea104
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

The folds `marks`, `rows`, `repeats` and `answers` still read the session's current place. The brief and the stops read it the same way, and the draft names them outside this ask.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

    ./RUNME.sh test src/modules/hooks/holds_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

`writes` reads the holds, stops and brief folds under the door's lock once the event lands, and hands them as `ownLanding`. Every reader at the hook door takes that value: `marks`, `rows`, `rewrites`, `answers`, `briefs`, `repeats` and `blocked`. A post landing after the event then moves none of the folds a reader sees. The change landed in 72c05abdd.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: `TestALandingKeepsEveryFoldAtItsOwnPlace` holds the three folds at the landing's own place past a later post
- the cleanup the change reveals: `briefs` keeps the session alone, for the handed mark
- the landed folds stand once, as `ownLanding` in `src/modules/hooks/holds.go`

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
