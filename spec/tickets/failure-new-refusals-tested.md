---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: failure-verbs-raise-and-register/gate
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
parent: failure-verbs-raise-and-register
record:
  - step: do
    hand: box 83c32b2b4d58 · claude-code-remote
    hash_before: d9d4fda33f19751f6f9df80af1dde3d9001df59e
    hash_after: d9d4fda33f19751f6f9df80af1dde3d9001df59e
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "    2.8  test/contract/vale-paths.test.js a rationale reads the same by its absolute path as by its relative one"
    inputs:
      - name: ask
        hash: eab751276d5447bc
        size: 359
    def: 9da33ea199bff5a7
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

no case decides the refusal of a level off the ladder, of an id a node already carries, or of an id holding a slash, which writes outside spec/failures. NodeOf checks no level, so the verb holds that check. A missing --when, which the schema requires as the When section, takes no refusal in the draft, and the design note row for failure new names no --when.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/quack/verb_failure_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

failure new in src/quack/verb_failure.go refuses a level off the log ladder, an id a node already carries, an id off the hyphenated shape (a slash among them, which writes outside spec/failures) and a missing --when, and verb_failure_test.go holds one case each. The failures design note row now names --when and the refusals.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the verb holds the level check NodeOf leaves out, and a case decides each refusal
- the cleanup the change reveals, the design row naming no --when, is in the change
- the refusals stand once, in the verb, and its doc line points at the design note

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
