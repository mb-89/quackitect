---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: holds-beat-with-the-session/gate
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
group: boxes-hold-and-hand-back
parent: holds-beat-with-the-session
record:
  - step: do
    hand: box 3341fdcd540f · claude-code-remote
    hash_before: ffcbd6e16099fb12238679387e587dab8222549d
    hash_after: 65651fe412c43239cf08c2d6e148df390bb96d1a
    answered:
      - name: tests
        exit: 0
        said: green, src/branches passes
      - name: check
        exit: 0
        said: "  115.8  in all"
    inputs:
      - name: ask
        hash: bb2fc30443f5d384
        size: 247
    def: 493538c21ebdc181
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the Stop hook runs on every turn end, on a desk and on main too. branch beat answers 0 and writes nothing off a work branch this box holds, and answers 0 on a refused push, since a Stop hook exit of 2 blocks the turn end. Add a test deciding both.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/branches/beat_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

branch beat answers 0, prints nothing and writes nothing on a branch this box holds no group on, and on a refused push, since the Stop hook runs it at each turn end and an exit of 2 holds the turn. A case drives both: a beat on main, and a beat whose push URL refuses.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change stays in the branches package, the hook settings and the work design note
- the beat reaches git through the doors the package already holds, and the cases drive a real repository as the package tests do
- beat.go opens on a header naming the approach and points at the design section
- the beat span stands in the config key, and the design section names the rule once

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
