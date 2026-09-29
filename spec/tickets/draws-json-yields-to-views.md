---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-sidebar-renders-generically/gate
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
group: sidebar-lands-in-shadow
parent: the-sidebar-renders-generically
record:
  - step: do
    hand: box d85821f54410d · claude-code-remote
    hash_before: 4b36cfd74e0a661659f71b72c311678912486768
    hash_after: 4b36cfd74e0a661659f71b72c311678912486768
reason: became
successors: [view-actions-run-through-verbs]
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

The sibling moved the pull button's help and icon into spec/config/draws.json, which the draft predates. Once work/pull registers them too, the icon stands in two places until the widget grid retires.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

The pull handed this before `work/pull` registers anywhere. The action lands with `view-actions-run-through-verbs`, which waits on the owner's read. Cutting the help and the icon from `spec/config/draws.json` now leaves the pull button bare, so this ticket waits on that one.
