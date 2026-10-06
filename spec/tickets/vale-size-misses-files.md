---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: vale-leaves-the-tree/gate
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
group: lint-without-vale
parent: vale-leaves-the-tree
record:
  - step: do
    hand: box 09cf21ad3c5d · claude-code-remote
    hash_before: 899fbdfb956795698d51625bdf29b439863e1648
    hash_after: 91ad2c66636ebb4305dce41b5ba5cd1bfbc8ca07
    answered:
      - name: tests
        exit: 0
        said: green, src/vehicle passes
      - name: check
        exit: 0
        said: "   59.4  in all"
    inputs:
      - name: ask
        hash: 4155b9876e1d6e9d
        size: 445
    def: 13b5025d6d00f771
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the grep names files the size list leaves out. These are src/rules/scope.go (a comment naming .vale.ini), src/branches/dispatch_write_test.go (it runs the real Vale over .vale.ini), src/vehicle/vehicle_test.go, test/contract/fetching.js and ruled.js. The draft puts the RulesLoad case in src/modules/lsp/tools_test.go, while the red case stands in src/quack/rules_test.go, and tools_test.go still names vale-ls. The builder fixes these in place.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/vehicle/vehicle_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The scope header in src/rules/scope.go and the travel case in src/vehicle/vehicle_test.go drop their Vale names now, since neither waits on the Vale run. The other four hits leave with the Vale run itself: the dispatch case runs the real Vale, the lsp tools case holds the Vale fields, and the two contract helpers name vale-ls and .vale.ini. A fix before the change breaks the tests reading them. The door holds the parent's design, so the parent's Discussion names the four for its size list, and says the RulesLoad case stands in src/quack/rules_test.go.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask for the two free hits, and departs for the four the Vale run holds: those wait on the parent's change, named in its Discussion
the cleanup the change reveals: none past the four hits, which the parent's change owns
the size additions stand once, under the parent's Discussion, and point at this ticket

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
