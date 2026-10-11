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
group: checks-and-index-read-right
step: do
record:
  - step: do
    hand: box f689bbb375f6 · claude-code-remote
    hash_before: d254f271298b82e4c37e294c8782d892cc74b944
    hash_after: f7813056350ad9ab1cec29aadec469f3de188ff9
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "   57.8  in all"
    inputs:
      - name: ask
        hash: 8e1b907caaf4c899
        size: 369
    def: df12650931d480c9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
gain: a commit the cold probe fails leaves HEAD, or the verb says it stands there and how to take it back.

<!-- breaks, as text: what breaks if it is never done -->
breaks: `takesBack` in `src/quack/commit.go` drops the soft reset's error, and the verb prints that nothing lands while the commit stands on HEAD.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
done_when:

- `go test ./src/quack/ -run TestAFailedTakeBackNamesTheCommit` passes
- `./RUNME.sh check` answers 0

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

    ./RUNME.sh test src/quack

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

`takesBack` in `src/quack/commit.go` answers the soft reset error and the merge-head error. Where the reset fails, the commit verb names the commit standing at HEAD and the command `git reset --soft HEAD~1` that takes it back, in place of saying nothing lands. `TestAFailedTakeBackNamesTheCommit` failed red and passes now.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the fix sketch
- the failed path skips the unstage, since the commit still holds the change
- the take-back stands in `takesBack` alone

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
