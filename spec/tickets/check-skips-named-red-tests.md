---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: failure-check-refuses/gate
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
group: failures-stand-registered
parent: failure-check-refuses
record:
  - step: do
    hand: box 83c32b2b4d58 · claude-code-remote
    hash_before: 6c51155418cbeeb5aded0c10de79a6ba4343423a
    hash_after: 6c51155418cbeeb5aded0c10de79a6ba4343423a
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/tickets passes; green, src/pull passes
      - name: check
        exit: 0
        said: "    3.1  test/contract/index.test.js a stopped index leaves no se-index process past the case"
    inputs:
      - name: ask
        hash: 45a1aec41c1ed765
        size: 381
    def: 2d462fb262bf5b4d
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the red rows on failure-check-refuses read as a path and a test name, so goTestNames in src/quack/check.go meets no path ending _test.go, skips nothing, and ./RUNME.sh check exits 1 on the seven src/failure cases; teach goSkipOf to read a path and a test name, or write the red rows as bare paths, since the verb_failure_test rows of failure-verbs-raise-and-register share the form

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/modules/tickets/red_test.go src/pull/tagged_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

RedRows in src/modules/tickets/red.go reads the first word of each red row as its path, so a row naming a path and a test case yields the path, and goSkipOf in src/quack/check.go skips the named Go tests instead of finding no _test.go path. taggedIn keeps a tagged ticket of another group out of this group's hand-out, which greens level0's clear probe.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask's first road: the reader learns to read a path and a name, so the rows stand as written on both parents
- the cleanup the change reveals, the tagged ticket leaking into the hand-out, is in the change through taggedIn
- the row form stands once, in the RedRows doc line, pointing at the pull design note

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
