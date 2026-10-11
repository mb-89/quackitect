---
kind: [[ticket]]
state: open
steps:
  - name: do
    does: makes the change with tests covering every rule of the ask, commits both on a clean tree, and stops once they pass
    from: anyone
    by: anyone
    to: retro
    input: ask
    tags: ["code", "testing"]
    needs: ["branch test"]
    checklist: ["the change follows the ask, or the discussion says why it departs", "the cleanup the change reveals is in the change, or is a note of its own", "every fact the change adds stands in one place, and a note points at the file instead of repeating it", "stop when the tests cover every rule of the ask and pass, and leave working code alone"]
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
process_hash: 2a00b62f7c4bc60b
step: do
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
gain: the check on Windows goes green on the case, so pull request #153 lands.

<!-- breaks, as text: what breaks if it is never done -->
breaks: `TestOpenClearsTheWalAndShm` in `src/index/index_test.go` opens the index again while its first handle holds the file, and Windows refuses the rebuild's removal of a held file.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
done_when:

- the case opens a copy taken while the first handle stands open, and closes that handle first
- `go test ./src/index -run TestOpenClearsTheWalAndShm` passes
- `check (windows-latest)` on pull request #153 passes

# do

<!-- makes the change with tests covering every rule of the ask, commits both on a clean tree, and stops once they pass -->

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
