---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-twins-leave-whole/gate
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
parent: the-twins-leave-whole
record:
  - step: do
    hand: box 83c32b2b4d58 · claude-code-remote
    hash_before: e92c1cd47be264314fa7c4cc103461f090e994c6
    hash_after: e92c1cd47be264314fa7c4cc103461f090e994c6
    answered:
      - name: tests
        exit: 0
        said: green, src/pull passes
      - name: check
        exit: 0
        said: "    2.1  test/contract/vale.test.js a shouted lead is refused and an acronym inside a sentence passes"
    inputs:
      - name: ask
        hash: e01c40e00cb45c67
        size: 357
    def: b3995cb871db2080
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the callers list misses deskRefused in src/pull/pull_branch.go, the Go pull. It passes the remedy as a second said line to failure.Raise, and Raised.Lines in src/failure/raise.go also prints the node's remedy, so the Go pull prints the remedy twice, the same fault as take.go. The builder fixes it in place with a test beside TestDeskTakePrintsTheRemedyOnce

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/pull/pull_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The Go pull's desk refusal handed the remedy to failure.Raise as a second message line, and the door printed the node's remedy beneath it, so the remedy printed twice. deskRefused in src/pull/pull_branch.go now hands the message alone, and the node desk-works-on-trunk prints the remedy once. The name argument left with the remedy line it fed.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: the fix stands in place, with a case beside the desk pull case
the cleanup stands in the change: the name argument and its placeholder left deskRefused and its two callers
the remedy stands once, on the node, and the case points at this ticket

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
