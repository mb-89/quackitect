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
    hash_before: a9cdf17107b1aa3ed941d96fbeb6750d2163dd0f
    hash_after: c468b439ce21ee69723822ea5775126622145045
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "   62.2  in all"
    inputs:
      - name: ask
        hash: 08b2685e22d007aa
        size: 400
    def: df12650931d480c9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
gain: `rename --text` rewrites the name across the tree and moves nothing, as its flag says.

<!-- breaks, as text: what breaks if it is never done -->
breaks: `renameVerb` in `src/quack/rename.go` runs the path move before it reads `--text`, so a name that is also a path moves the file, journals the move and rewrites the tree twice.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
done_when:

- `go test ./src/quack/ -run TestRenameTextLeavesAnExistingPathInPlace` passes
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

`renameVerb` in `src/quack/rename.go` reads `--text` before it acts, and runs the text rewrite or the move, never both. A name that also stands as a path now stays in place, with its text rewritten and no journal entry. `TestRenameTextLeavesAnExistingPathInPlace` failed red and passes now. The commit also fixes the cold probe: its clone pushed `work/dry-probe-clears` into the box tree, so the next probe diverged and failed the commit, and the group step now drops that branch before it branches.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the fix sketch
- the probe fix rides this ticket, since the check refused this commit on it
- the flag branch stands in `renameVerb` alone

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
