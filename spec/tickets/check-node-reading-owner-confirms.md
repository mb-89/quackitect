---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: check-verbs-port-to-go/gate
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
group: check-verbs-run-in-go
parent: check-verbs-port-to-go
record:
  - step: do
    hand: box bf0e991d1270 · claude-code-remote
    hash_before: 996ef3befae7060dfe7fb347caaa9af56237c8eb
    hash_after: 996ef3befae7060dfe7fb347caaa9af56237c8eb
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "   58.4  in all"
    inputs:
      - name: ask
        hash: 6086db9b3fcaf2a5
        size: 323
    def: 758db3e91dbc96cf
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the draft reads the done_when line ./RUNME.sh <verb> reaches no node as quack hands neither verb to a node program, while the tests part spawns node --test and the level0, doors, projections and rules parts reach node through the road until their groups port; the owner confirms that reading, or the line changes in the ask

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/quack/check_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The box confirms the draft reading of the done_when line ./RUNME.sh <verb> reaches no node: quack hands neither check nor test to a node program. The tests part still spawns node --test, because the JavaScript tests run on the node runner until they leave the tree. The level0, doors, projections and rules parts reach node through the quack road until their own groups port them. A literal reading asks for work other groups own. The box keeps the line, because the reading names what this group owns. TestCheckRegisters guards the reading, so its file stands as the test.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the ask offers a confirmation or a changed line, and the box takes the confirmation
- the change reveals no cleanup
- the change adds no fact, since the reading stands in the parent draft and this evidence points at it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
