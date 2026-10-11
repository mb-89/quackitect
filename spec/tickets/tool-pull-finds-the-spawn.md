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
group: branches-and-pull-report-truly
step: do
record:
  - step: do
    hand: box 8339730da099 · claude-code-remote
    hash_before: 5acf98339716e8071901cc105bd389eb1fb8607e
    hash_after: 06e503b306afb3f4b0aaa10408d70be1162eeece
    answered:
      - name: tests
        exit: 0
        said: green, src/pull passes
      - name: check
        exit: 0
        said: "   96.4  in all"
    inputs:
      - name: ask
        hash: 3f235727368d49ac
        size: 399
    def: df12650931d480c9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
gain: the pull tool spawns the helper hand after a hand-back, as it does after a plain pull.

<!-- breaks, as text: what breaks if it is never done -->
breaks: `ToolAnswerOf` in `src/pull/pull.go` reads the spawn on the first line alone. A hand-back prints its work lines first, so the hook in `pull-tool.ts` spawns nothing.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
done_when:

- `go test ./src/pull/ -run TestTheToolFindsTheSpawnPastTheWorkLines` passes
- `./RUNME.sh check` answers 0 on this box

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

    ./RUNME.sh branch test src/pull/pull_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The pull tool answer now finds the spawn row anywhere in the pull text, not on the first line alone. A hand-back prints its work lines before a spawn answer, so the hook in pull-tool.ts now spawns the hand there too.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the named test passes, and the check answers 0
- the cleanup the change reveals: none past the one function
- every fact stands in one place: the spawn row is read in ToolAnswerOf alone

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
