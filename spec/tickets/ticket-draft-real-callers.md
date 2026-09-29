---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: ticket-verbs-become-actions/gate
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
group: quack-verbs-land-in-shadow
parent: ticket-verbs-become-actions
record:
  - step: do
    hand: box d8509c02d5db · claude-code-remote
    hash_before: 8cbd19db97491fec847903321b8e5c412b702a01
    hash_after: 8cbd19db97491fec847903321b8e5c412b702a01
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/index passes
      - name: check
        exit: 0
        said: "spec/tickets/work-verbs-become-actions.md:260:3: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: 984ccf1943b1699e
        size: 530
    def: f5aad7e4e0747ffe
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the callers list names src/index/tools.go, which stands absent from the tree. No file serves /v1/tools yet: src/index/tools_test.go stands red under the-hook-registers-index-tools, so the tool list is that sibling's work and a go test ./... green waits on it. Name src/index/actions.go servesActions, which posts one route an action, as the caller here, and name the tool list as the sibling's. The tests list also puts TestTheRootRunsANodeVerbThroughCliJs under src/quack/main_test.go, where it stands in src/quack/twins_test.go.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/modules/index

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The draft of ticket-verbs-become-actions named a caller file absent from the tree, and put one test in the wrong file. A table under its Discussion now names servesActions in src/index/actions.go as the caller. It hands the tool list to the-hook-registers-index-tools, and moves the test to src/quack/twins_test.go. The engine owns the draft fields, so the correction stands where the implement step reads it.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask, and lands under Discussion because the door keeps the draft fields to the engine
- the cleanup stands whole in the one table
- the table names each file once, and points at the sibling ticket for the tool list

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
