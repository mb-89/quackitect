---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: every-named-path-resolves/gate
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
parent: every-named-path-resolves
record:
  - step: do
    hand: box 57a5a484096e · claude-code-remote
    hash_before: 84a6016d993e59d8b4fdb106db344d531ed264f0
    hash_after: 84a6016d993e59d8b4fdb106db344d531ed264f0
    answered:
      - name: tests
        exit: 0
        said: green, 15 test(s) pass in 2 file(s)
      - name: check
        exit: 0
        said: "  116.9  in all"
    inputs:
      - name: ask
        hash: 1da96b91c551d2ab
        size: 194
    def: c57debdcd1993d23
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

src/engine/group.js STALE keeps a 12h second default of work.staleAfter that src/scripts/work-free.js reads, against the ask's one default a key, so the script reads the settings default instead

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test test/level0/stand.test.js test/level0/work-held.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The JavaScript stale span now reads work.staleAfter alone. src/engine/group.js held STALE, a second default of twelve hours, and src/scripts/work-free.js fell back on it, while the config schema holds the one default of thirty minutes. The config door already answers that schema default for an unset key, so STALE only stood in where no config reached. It leaves, staleSpan reads the key alone, and a claim reads stale only under a span past zero, as the Go side reads it. A take case that leaned on the fallback now sets the span the door hands.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: the script reads the settings default through the config door, and the second default leaves.
the cleanup the change reveals is in the change: the stand case on STALE now pins the span with no fallback, and the take case sets its span.
every fact the change adds stands in one place: the schema holds the default of work.staleAfter, and staleSpan reads it through the config door.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
