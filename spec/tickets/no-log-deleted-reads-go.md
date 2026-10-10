---
kind: [[ticket]]
state: open
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
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
gain: `NoLogDeleted` reads the Go and shell code the tree carries, so a Go line removing a log meets the rule.

<!-- breaks, as text: what breaks if it is never done -->
breaks: `sourceAt` in `src/modules/check/install.go` admits JavaScript alone, and `deletesAt` misses `os.Remove`, `os.RemoveAll` and `rmSync`, so the guard reads almost none of the tree.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
done_when:

- `go test ./src/modules/check/ -run TestNoLogDeleted` passes with a Go `os.Remove(logPath)` case and an `fs.rmSync(logPath)` case
- `./RUNME.sh check` answers 0, so the widened rule raises no false row over the tree

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
