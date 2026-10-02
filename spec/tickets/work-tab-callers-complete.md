---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-work-tab-reads-v1/gate
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
group: tui-shell-switches-over
parent: the-work-tab-reads-v1
record:
  - step: do
    hand: box d889b5fc6cd8 · claude-code-remote
    hash_before: 56183d2bcbdc8156e2a663c2a139822944d9c511
    hash_after: 56183d2bcbdc8156e2a663c2a139822944d9c511
    answered:
      - name: tests
        exit: 0
        said: green, src/tui passes; green, src/tui/work passes
      - name: check
        exit: 0
        said: "spec/tickets/work-tab-waits-sends-changes.md:41:1: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: e0e5f5629fa7ddff
        size: 407
    def: b10bf3e839860457
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the callers list and size miss src/tui/work_test.go (Load, IndexStandingAt), src/tui/workdetail_test.go, src/tui/workedit_test.go, src/tui/workplace_test.go and src/tui/workplaces_test.go (Load, PlacesIn, Placed, PlacesMsg, PlacesCmd, NodeAt), src/tui/work/door_post_test.go (postJSON), src/tui/work/shadow_test.go (ViewOver, IndexRow), and src/quack/testdata/tree.golden.json, which the new Row fields move

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/tui/workplaces_test.go src/tui/work/door_post_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The work tab's draft misses eight callers, seven test files and the quack tree golden. The engine writes the draft's own fields, so the missed callers stand as a table under the work tab ticket's Discussion. Its implement reads them there and changes each one with the code it reads.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: every file the finding names stands in the table
- the cleanup rides the work tab's implement, which touches those files
- the list stands once, under the work tab's Discussion

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
