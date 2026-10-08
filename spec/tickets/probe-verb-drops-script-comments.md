---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: probes-leave-node/gate
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
group: javascript-leaves
parent: probes-leave-node
record:
  - step: do
    hand: box fb4ccb7cacc7 · claude-code-remote
    hash_before: 4d87a5b7bb8c3164f3702eb89ad383d6b629af82
    hash_after: 4d87a5b7bb8c3164f3702eb89ad383d6b629af82
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "   80.4  in all"
    inputs:
      - name: ask
        hash: a28b4ebb484c01d2
        size: 284
    def: d515cfd5f58dfdeb
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the approach drops `dryEntry` from `src/quack/probe_verb.go`, but the comment over `atFlag` (`as AT in src/scripts/probe-dry.js reads it`) and the doc line over `probeDry` still name `src/scripts`, so the second done_when grep stays red until the implement hand rewrites both in place

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/quack/probe_verb_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The comment over the at flag in probe_verb.go names no script now. It pointed at AT in src/scripts/probe-dry.js, which leaves under probes-leave-node.

The doc line over probeDry stands as it is, and departs from the ask there. It names no src/scripts path, so the done_when grep passes over it once dryEntry leaves. It says the dry road hands off to its JavaScript entry, which holds until probes-leave-node rewrites the body, and that implement hand rewrites the line beside the body.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change rewrites the at flag comment the ask names, and the says field gives why the probeDry line waits for the body it describes
- the change reveals no other cleanup, since dryEntry and its comment leave under probes-leave-node
- the comment adds no fact, and points at the ticket that owns the at flag

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
