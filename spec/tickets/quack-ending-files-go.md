---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: engine-verbs-hold/accept
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
group: engine-verbs-hold
parent: engine-verbs-hold
record:
  - step: do
    hand: box 57a5a484096e · claude-code-remote
    hash_before: 0ef59e6fc4e35712a77e04b41b3126ace6417e50
    hash_after: 7470d01b6b3a805588d94e90bd15b7869161fc86
    answered:
      - name: tests
        exit: 0
        said: green
      - name: check
        exit: 0
        said: "   83.3  in all"
    inputs:
      - name: ask
        hash: 7802ba75c6340fb2
        size: 164
    def: 6b3cd8b993bfc9f5
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

src/quack/ending_unix.go and ending_windows.go hold a package clause and a comment naming a mechanism they lack. Delete both files, since proc.Whole holds the code.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

cd src && go vet ./quack/ && GOOS=windows go vet ./quack/ && go test ./quack/ -run Ending && echo green

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

Deletes the two ending files under src/quack, unix and windows. Each held a build tag, a comment and a package clause, and the comment named a process-group mechanism that proc.Whole owns. The package vets and passes its ending tests on both platforms without them.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: both files leave the tree, and nothing else changes
the cleanup: the windows ending test stays, since it tests ending.go and vets clean under GOOS=windows
one place: proc.Whole owns the mechanism, and the deletion removes the second description of it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
