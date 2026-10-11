---
kind: [[ticket]]
state: closed
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
group: loose-fixes-0032249
record:
  - step: do
    hand: box 05c4736f6ff2 · claude-code-remote
    hash_before: 5d2be8cff4ee9eea1bfc2e4115e20bf17a29dbff
    hash_after: 5d2be8cff4ee9eea1bfc2e4115e20bf17a29dbff
    answered:
      - name: tests
        exit: 0
        said: green, src/index passes
      - name: check
        exit: 0
        said: "   76.1  in all"
    inputs:
      - name: ask
        hash: 8942f4d0ccdbb49a
        size: 490
    def: 56b47f508ed740df
reason: done
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

    ./RUNME.sh test src/index

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The case copies the index and its journal while its first handle stands open, closes that handle, and opens the copy, so Windows meets no held file at the rebuild. The fix reached main before this group opened, so this step records its evidence.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the case opens a copy and closes the first handle first
- no cleanup surfaced
- no new fact lands
- the case and the check pass, and the working code stays as it stands

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

The fix lands on `work/checks-and-index-read-right` as `72925ad7`, and the check answers green on the merge head. The queue binds that box to its closed group, so the `do` step waits for a hand on `main`. Its evidence:

- tests: `go test ./src/index -run TestOpenClearsTheWalAndShm`
- check: `./RUNME.sh check`
- says: the case copies the index and its journal while its first handle stands open, closes that handle, and opens the copy
