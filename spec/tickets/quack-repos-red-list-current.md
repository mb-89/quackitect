---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: quack-repos-meet-fake-git/gate
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
group: unfaked-doors-take-fakes
parent: quack-repos-meet-fake-git
record:
  - step: do
    hand: box e97c7a20bbd2 · claude-code-remote
    hash_before: 8394a713757b6da752148327a729fbbec7c885be
    hash_after: 8dcecec72cdda48d212c9c11d691b846ad74ac91
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/git passes
      - name: check
        exit: 0
        said: "  110.4  in all"
    inputs:
      - name: ask
        hash: 1885714fe1218f82
        size: 190
    def: 7f45bf4926f4a317
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

design/tests-red lists src/modules/git/repo_contract_test.go as red, yet go test ./src/modules/git passes on this commit, so the check skips a green suite; tests-green drops it from the list

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/modules/git/repo_contract_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The quack-repos tests-red list named the git contract suite as red, though it passes, so the check skipped a green suite. The engine owns that list, so the note under the parent's Discussion records the drop, the next pass of tests-red names repos_moved_test.go alone, and tests-green drops the git suite either way.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change departs from an edit of the red list, which the engine owns, and the Discussion records the drop for tests-green
- the cleanup it reveals stands in the note size-golden-pins-open-tickets
- the red list stands once, in the parent's tests-red, and the Discussion points at it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
