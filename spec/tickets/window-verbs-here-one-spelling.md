---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: window-verbs-windows-green/gate
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
group: window-verbs-run-in-go
parent: window-verbs-windows-green
record:
  - step: do
    hand: box 1d64c60aa6ea · claude-code-remote
    hash_before: 9122c438786b2528121c689a739051c65e2e4393
    hash_after: cf7d9d81e7a8ce45cca482c438531d3404e80674
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "  106.6  in all"
    inputs:
      - name: ask
        hash: a3db6ad1c7012ed7
        size: 342
    def: 6de61f628e2ef634
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the approach keeps MethodRootFrom slashed and moves the test wants to filepath.ToSlash, so on Windows `vehicle here` prints the method root slashed beside a work root taken native off SE_WORK_ROOT; the ask wants each root spelled one way, so the change slashes the work root in here too, or the here case asserts both roots under one spelling

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/quack/vehicle_verb_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

vehicle here printed the method root slashed and the work root as SE_WORK_ROOT spelled it, so a Windows box saw two spellings. The work line now prints slashed too. TestVehicleVerbHereNamesTheRootsAndTheRegister feeds a backslashed work root and wants it slashed.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change takes the first road the ask names: here slashes the work root
- the change reveals no cleanup: attach and detach keep the work root as given, since they write under it
- the comment at the print names the ticket, and states the rule once

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
