---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: quack-reaches-the-box-through-doors/gate
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
group: doors-declare-what-they-own
parent: quack-reaches-the-box-through-doors
record:
  - step: do
    hand: box add8d8d0dd3d · claude-code-remote
    hash_before: 776513e7e25b2540e918aa090244f9900668259e
    hash_after: 204f7484cc8dec9e4af9ab8d1b5d2bd173eb6295
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "    1.7  test/contract/desk-start.test.js a server the proc door starts detached writes its marker after its starter exi"
    inputs:
      - name: ask
        hash: b018d43de3b35944
        size: 315
    def: 6a55bc0a7781afef
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the doors verb lists a door only through a contract line or an outside line (src/quack/verb_doors.go), so the root's owns.yaml names src/quack/box_doors_test.go under contract, and a case asserts the verb prints that it keeps the contract of the root door; the draft names no test deciding the second done_when line

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/quack/verb_doors_test.go src/quack/box_doors_contract_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The box contract suites for the disk and the box move out of src/quack/box_doors_test.go into src/quack/box_doors_contract_test.go under the contract build tag, beside the shared fakes they hold to the real thing. The move follows the shape every other contract file takes, and owns.IsContract takes only a path ending _contract_test.go or under test/contract, so the ask's literal path would fail the declaration. The root's src/quack/owns.yaml names the new file under contract, and TestDoorsListsTheContractTestOfTheRootDoor runs the doors verb over the tree and finds the line saying that file keeps the contract of quack.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask, and departs on one point: the yaml names box_doors_contract_test.go, because the reader of a contract entry refuses box_doors_test.go, and the says field records why
the change reveals no cleanup past the move itself: the fakes stay in box_doors_test.go, where every quack test reaches them
the contract path stands once, in src/quack/owns.yaml, and the case asserts the verb's output over the tree, so it repeats no list

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
