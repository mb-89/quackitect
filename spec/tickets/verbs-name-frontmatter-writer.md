---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: ticket-verbs-port-to-go/gate
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
group: ticket-verbs-run-in-go
parent: ticket-verbs-port-to-go
record:
  - step: do
    hand: box 4c04792eb7ca · claude-code-remote
    hash_before: 8899f925d2ca849b446648551ea040ee622ed4e0
    hash_after: 8a22cc920d42632013323794ff8afdf604a39251
    answered:
      - name: tests
        exit: 0
        said: green, 8 test(s) pass in 1 file(s); green, src/quack passes
      - name: check
        exit: 0
        said: "    1.7  test/contract/index.test.js a stopped index leaves no se-index process past the case"
    inputs:
      - name: ask
        hash: 5fd33798800bb41d
        size: 254
    def: 8d2b3d0b3fa3b6aa
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the approach names no Go frontmatter writer for the pull, the mint and the split, and the ask's second paragraph makes it their one write road. Name the writer each port calls, and keep ticket*.js, pull*.js, mint-verb.js and split-verb.js until it stands

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test test/level0/probe-clear.test.js src/quack/verb_mint_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The Go frontmatter writer is the front package under src/front, and every port writes a front through it alone. The ticket sub-verbs and the pull set and drop a field through pull.WithField and pull.WithoutField in src/pull/edit.go, which call front.Set and front.Drop. The mint and ticket note mint a note through check.Minted, which is mintedNote in src/modules/check/mint.go and lays its front with front.Mint. The re-route under ticket route, ticket update and the stale pull lays its front through front.Mint in src/modules/check/rerouted.go. Split cuts line ranges and writes no front. No port file under src/quack builds a front by hand. One fault surfaced on the way: the Go mint finds its root off QUACKITECT_ROOT, which the index hands every child, so the clear probe minted its group in this tree. The probe now names its clone as the root, and a case in probe-clear.test.js holds it.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the writer each port calls stands named above, off a read of each call site
- the cleanup the change reveals is in it: the probe root fix and the stray ticket it wrote both land here
- each fact stands once: the writer owns the front rules in src/front, and the ports call it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
