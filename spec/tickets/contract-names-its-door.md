---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: go-tests-meet-the-doors/gate
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
parent: go-tests-meet-the-doors
record:
  - step: do
    hand: box add8d8d0dd3d · claude-code-remote
    hash_before: 4473d66838e9dbe1025d462c3ab0551f337b7309
    hash_after: 4473d66838e9dbe1025d462c3ab0551f337b7309
    answered:
      - name: tests
        exit: 0
        said: green, src/owns passes
      - name: check
        exit: 0
        said: "    1.7  test/contract/desk-start.test.js a server the proc door starts detached writes its marker after its starter exi"
    inputs:
      - name: ask
        hash: 9ac5a895459fd48d
        size: 255
    def: ce7faccd2ca3d01b
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the draft names TestEveryContractTestNamesItsDoor in src/owns/tree_test.go, which tests-red never wrote, and the red list leaves tree_test.go out; write it red so every file under test/contract and every _contract_test.go stands in one door's contract key

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/owns/tree_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

TestEveryContractTestNamesItsDoor in src/owns/tree_test.go refuses a contract test no door names under contract. A contract test is a file ending _contract_test.go, or test/contract/<door>.test.js beside src/doors/<door>.js. The rest of test/contract drives the tree, and no single door owns it. Each owns.yaml holding a contract test names it, and src/vehicle/owns.yaml declares the vehicle door its shim test belongs to. It landed in 5dbf75bb3.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change departs from the gate point on one line: the case asks the key of a door test under test/contract, and leaves out the files that drive the tree, which no single door owns. Their walks stay listed, and test-walks-move-onto-fakes meets them
the cleanup the change reveals is the undeclared vehicle door, and the change declares it
the rule stands once, in the case, and the doors note points at it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
