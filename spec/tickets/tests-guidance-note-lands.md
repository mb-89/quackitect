---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: anyone
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
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: dead-tests-and-code-leave
cloud: true
step: do
record:
  - step: do
    hand: box 34eba3f85616 · claude-code-remote
    hash_before: f892325a4e3cb71ad8dee0ab59dc1fc611f10386
    hash_after: b57ae19b5fd7b16f6771eaf68e61d7760b950d5f
    answered:
      - name: tests
        exit: 0
        said: green, 2 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "   71.8  in all"
    inputs:
      - name: ask
        hash: 08ce065a6da777d4
        size: 964
    def: df12650931d480c9
reason: done
---

# Ask

The rules the goldens audit drafts land as a guidance note spec/guidance/code/tests.md with its rationale. The retro audit rule and the audit checklist line land beside it, so the next box writes no test this group deletes.

The tree keeps minting parity goldens, per-verb registers tests and tests of dead code, and the next audit finds the same pile.

- spec/guidance/code/tests.md holds the drafted rules, with the owner's decisions below
- outermost means the command line, and the module's ports for an edge the command line cannot reach
- fixtures count toward the test-to-code ratio
- testing.md rules 1-3 cover the VS Code extension and the level-zero hooks alone
- the file ceiling covers code files alone
- the rationale stands under spec/rationales, linked from the note
- the retro audit rule and the audit checklist line stand where the draft names
- the testing guidance other boxes land stands beside it, merged in whole
- `./RUNME.sh check` exits 0

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/contract/guidance-tags.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The rules the goldens audit drafted now stand in spec/guidance/code/tests.md, argued in spec/rationales/tests.md. The note tells a writer of tests to test a behavior once, at the command line, and at the module's ports for an edge the command line cannot reach. It holds a behavior in one layer and one language. A test leaves with its code, and a comparison leaves at its migration switch. A golden file pins behavior, never incidental output. Test lines, fixtures counted, stay at or under code lines. Rules 1 to 3 of the testing note now cover the VS Code extension and the level-zero hooks alone. The file ceiling already sized code files alone, so that decision needed no code. The retro audit gains rule 7 with its rationale chapter, and the retro audit step gains the checklist line the draft named. The examples note another box landed stands beside the new note, and rule 1 points at it, so neither repeats the other.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask and the owner's four decisions
- the cleanup it revealed is a private note: the mint tool writes tags the guidance reader misses
- every fact stands once: rule 1 points at the examples note, and the audit rule points at the new note

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
