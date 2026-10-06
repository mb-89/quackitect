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
    hash_before: 6bca55c39e70f5b3b868c1529adbad99255fe3c2
    hash_after: 6bca55c39e70f5b3b868c1529adbad99255fe3c2
    answered:
      - name: tests
        exit: 0
        said: green, src/branches passes; green, src/config passes
      - name: check
        exit: 0
        said: "    1.7  test/contract/front.test.js set, drop, entry and after write what se-front writes over tickets of this tree"
    inputs:
      - name: ask
        hash: caea7a65531e6c22
        size: 315
    def: c57debdcd1993d23
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the draft reads a zero span where no config door answers and sets Config in newTree, yet TestTheStaleSpanReadsTheSettingsDefault builds Doors with a nil Config and with one answering nil and wants 30m, so (*Doors).staleSpan in src/branches/free.go reads the schema default at d.Method where the door answers nothing

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/branches/free_test.go src/config/config_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The Go stale span now reads work.staleAfter off the config door, and the schema default at the method root where the door answers nothing, so the one default in spec/config/level0.schema.json decides it. The staleSpan constant of twelve hours leaves src/branches/group.go. config.Default in src/config/config.go reads a key built-in alone, and a case pins it past the tracked and local files. A span of zero reads no claim as stale. The branch fixture newTree now names its own span through fixtureConfig, since its cases count their clocks against twelve hours.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: staleSpan reads the schema default at d.Method where the door answers nothing, which the red case wants.
the cleanup the change reveals is in the change: the constant leaves, and the fixture names the span its cases lean on in place of the removed default.
every fact the change adds stands in one place: the schema holds the default, and config.Default reads it.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
