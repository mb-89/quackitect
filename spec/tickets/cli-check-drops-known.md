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
step: do
group: loose-fixes-d604762
record:
  - step: do
    hand: box 34b754bfb977 · claude-code-remote
    hash_before: c9729f35d124da60cc1e4971e0b7aadf3f90a51f
    hash_after: c9729f35d124da60cc1e4971e0b7aadf3f90a51f
    answered:
      - name: tests
        exit: 0
        said: green, 3 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "    2.3  test/contract/vale-paths.test.js a rationale reads the same by its absolute path as by its relative one"
    inputs:
      - name: ask
        hash: e365aca0fbbad91e
        size: 137
    def: df12650931d480c9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

cli-check.js imports a name it never uses, and the push gate reads the warning. Done when `./RUNME.sh lint` names no warning in the file.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/contract/cli-check-doors.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

src/scripts/cli-check.js drops the import it left unused, so the lint names no warning in the file and the push gate stops reading one. The fix and its case landed in commit 8cab1a0 and reached main through the merge of work/retro-verbs-run-in-go; this step confirms it on the fix group branch.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: lint names no warning in cli-check.js
- the cleanup the change reveals: the lint names unused imports in test/contract/cli-verbs.test.js and test/level0/work-stands.test.js, outside this ask; they stand at warning
- every fact stands in one place: the change adds no fact

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

The fix and its case landed on work/retro-verbs-run-in-go in commit 8cab1a0, after that group closed. The pull hands out nothing on a closed group, so this ticket left the group and stands loose. A hand on main passes do: run `./RUNME.sh test test/contract/cli-check-doors.test.js` and the check.
