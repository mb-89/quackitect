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
group: edits-and-files-hold
step: do
record:
  - step: do
    hand: box a5167492d95e · claude-code-remote
    hash_before: 448f4da62e532acd438ebb6b9791de30fcfdd092
    hash_after: 448f4da62e532acd438ebb6b9791de30fcfdd092
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/git passes
      - name: check
        exit: 0
        said: "   86.0  in all"
    inputs:
      - name: ask
        hash: ba96077274ec85bc
        size: 332
    def: df12650931d480c9
reason: done
---

# Ask

A staged path with a space reads clean, so the conflict-marker refusal names the file as it stands.

AddsIn keeps the tab git writes after a `+++` path holding a space, so the refusal prints a stray tab in the path.

- `./RUNME.sh branch test src/modules/git` passes a case where `+++ b/a b.txt` followed by a tab reads as `a b.txt`

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/modules/git/adds_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

Git ends a path on a +++ line with a tab where the path holds a space. AddsIn kept that tab, so the conflict-marker refusal printed the file with a stray tab. AddsIn now trims one trailing tab before it unquotes the path. The case stands in a file of its own, since two sibling cases stand red in git_test.go until their tickets turn them green.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the ask: a path holding a space reads without its tab, as the case shows
- the cleanup: none revealed
- one place: AddsIn owns the read, and the line points at this ticket

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
