---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-quack-cli-gets-generated/gate
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
parent: the-quack-cli-gets-generated
record:
  - step: do
    hand: box d8509c02d5db · claude-code-remote
    hash_before: a3c0b4a3d9e1d4f89a1e8db0f69fe311e1772935
    hash_after: a3c0b4a3d9e1d4f89a1e8db0f69fe311e1772935
reason: became
successors: [the-quack-cli-gets-generated]
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the draft tests list leaves out TestRunPostsItsFlagsAsTheInput, which cli_test.go holds; the implementer names it in the tests-green evidence

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh check

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The parent draft lists five tests and leaves out `TestRunPostsItsFlagsAsTheInput`, which `cli_test.go` holds. The draft stands under a leaf already passed, so a line under the parent Discussion tells the implementer to name that test in the tests-green evidence. The change touches no code, so the check covers it.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the implementer names the test at tests-green
- no cleanup comes out of the change
- the fact stands once, under the parent Discussion

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
