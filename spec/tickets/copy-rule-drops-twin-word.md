---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: shared-helpers-stand-once/gate
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
parent: shared-helpers-stand-once
record:
  - step: do
    hand: box 57a5a484096e · claude-code-remote
    hash_before: 7a55bfe4227475e394381974de08c0d812468345
    hash_after: 7a55bfe4227475e394381974de08c0d812468345
    answered:
      - name: tests
        exit: 0
        said: green
      - name: check
        exit: 0
        said: "  102.9  in all"
    inputs:
      - name: ask
        hash: 876b8ae19ceab3a5
        size: 331
    def: ff48085f241db4b2
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

package check already says twin for a JavaScript check and its Go port, in Twins, check.go and check_twins_test.go. A new twins.go holding helperTwins gives one word two meanings. Name the file, the function and the test file for a copied body, as copies.go, helperCopies and copies_test.go, and carry the red list with the rename.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

go vet ./src/modules/check/ && echo green

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The rule for a function body standing in two packages takes the word copy. Package check already says twin for a JavaScript check and its Go port, so a second meaning would mislead. The red test moves from twins_test.go to copies_test.go through the rename verb, which rewrites the parent's red list, and its constant reads copyRule. The parent's draft is the engine's to write, so its Discussion names copies.go, helperCopies and copyFloor for the implement step. The tests line vets the package, because the renamed test stays red until the parent writes the rule.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

The change follows the ask: the test file and constant take the copy name, and the red list carries it; the parent's draft names stand, and its Discussion says why, since the door refuses an edit to an open ticket's draft.
The change reveals no other cleanup: the twin word stays where it names a check and its port.
The new names stand once, in the parent's Discussion, and the implement step writes them into code.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
