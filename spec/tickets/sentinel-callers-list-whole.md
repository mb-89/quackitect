---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: sentinel-fires-watches/gate
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
parent: sentinel-fires-watches
record:
  - step: do
    hand: box 83c32b2b4d58 · claude-code-remote
    hash_before: d08f84c8422e6305c189aab6211160c94e1a4747
    hash_after: d08f84c8422e6305c189aab6211160c94e1a4747
    answered:
      - name: tests
        exit: 0
        said: green, src/failure passes; green, src/quack passes
      - name: check
        exit: 0
        said: "    1.7  test/contract/desk-start.test.js a server the proc door starts detached writes its marker after its starter exi"
    inputs:
      - name: ask
        hash: 0364d5fd6a800ab7
        size: 248
    def: 3be54dfd84be35f8
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the draft's callers list names NodeOf alone in node.go, and misses its callers src/failure/registry.go Load, src/failure/check.go and src/quack/verb_failure.go, each reading the new match-pattern fault; the builder confirms each still answers green

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/failure/registry_test.go src/failure/check_test.go src/failure/tree_test.go src/quack/verb_failure_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

NodeOf now names a watch match that reads as no pattern. Its three callers read that fault: Load in src/failure/registry.go drops the node, the check in src/failure/check.go names the fault, and failure new in src/quack/verb_failure.go refuses the node. Each caller still answers green, so the change needs no code past the callers list the gate named.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the ask asks for the callers confirmed green, and the tests over registry, check and the verb pass
- the change reveals no cleanup
- the callers stand in the code alone, and this ticket points at each file

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
