---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: each-door-meets-one-test/gate
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
group: tests-meet-the-doors-once
parent: each-door-meets-one-test
record:
  - step: do
    hand: box 0e8770600b2b · claude-code-remote
    hash_before: 35f0231967b7c693e434fbc9ef61fa57a4328f0c
    hash_after: 35f0231967b7c693e434fbc9ef61fa57a4328f0c
    answered:
      - name: tests
        exit: 0
        said: green, src/imports passes
      - name: check
        exit: 0
        said: "    1.9  test/contract/vale-paths.test.js a rationale reads the same by its absolute path as by its relative one"
    inputs:
      - name: ask
        hash: 81ecaef01ebea9af
        size: 140
    def: d6b34b181afb7e04
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

a plant shared through sync.OnceValue cannot sit in t.TempDir, which the first case removes, so it needs os.MkdirTemp and a TestMain cleanup

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/imports/imports_test.go src/imports/analyzers_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The planted trees build once a package run, each through sync.OnceValues into a folder of its own from os.MkdirTemp, so the first case to end removes no folder another still reads. The flagged tree holds the clean files and the flagged ones in its own folder, so no flagged package leaks into the clean cases. TestMain removes both folders once the run ends. The imports package runs in four seconds on the box, where the Ubuntu runner took sixteen.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: os.MkdirTemp holds each shared plant, and TestMain cleans it
- the cleanup it reveals is in the change: the two plant writers fold into one plantedTree
- every fact stands in one place: the planted files stay in their two maps, and plantedTree writes any set of them

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
