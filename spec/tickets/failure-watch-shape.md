---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: failure-nodes-stand/gate
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
step: do
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: failures-stand-registered
parent: failure-nodes-stand
record:
  - step: do
    hand: box 83c32b2b4d58 · claude-code-remote
    hash_before: f386e07d41addc0fecbbd16330ac3aa72760f0ad
    hash_after: f386e07d41addc0fecbbd16330ac3aa72760f0ad
    answered:
      - name: tests
        exit: 0
        said: green, src/failure passes
      - name: check
        exit: 0
        said: "    2.2  test/contract/index.test.js a stopped index leaves no se-index process past the case"
    inputs:
      - name: ask
        hash: 4e936c1aa8d4abef
        size: 345
    def: af99826219e9b636
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the schema types watch as a bare object and remedies as a bare array, and the checker reads no nested properties or items, so a node with quiet: thirty or a remedy written as a map passes the check while Load reads Event, Match, Quiet and string remedies; NodeOf should refuse such a node, or the checker should learn items and nested properties

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/failure/node_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

NodeOf reads a node's front, and answers a fault a line for each field whose shape the node misses: a remedy that reads as no text, no remedy at all, a watch that reads as no map, a watch with no event, a quiet span that reads as no count of minutes, and a watch field outside event, match and quiet.
The schema reads no nested field, so the node reader owns those shapes, and the check slice refuses a node whose reader names a fault.
The ticket's todo tag drops, since the dry probe's clone hands a tagged ticket before its own leaf, and a note carries that for the retro.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

The change takes the ask's first road: NodeOf refuses the node, and the checker stays as it stands.
The registry's Load takes these faults in the node slice's implement, and the probe's tagged pool stands as a note for the retro.
Each shape stands once, in NodeOf and watchOf, and the design note points at the package.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
