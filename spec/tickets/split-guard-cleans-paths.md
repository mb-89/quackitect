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
    hash_before: a04976f01099264889c430d4962068011a5c6227
    hash_after: 10f90a1e2f83e8b21dda68d4df4a22aadad2f038
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "   58.6  in all"
    inputs:
      - name: ask
        hash: 0fa6db32d83f6a1f
        size: 459
    def: df12650931d480c9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
gain: split refuses a target naming its source in any spelling, and a target outside the work root.

<!-- breaks, as text: what breaks if it is never done -->
breaks: the guard in `src/quack/verb_split.go` compares raw strings, so `--to ./a.go` passes, the source write lands over the target, and the cut lines leave the tree while the verb reports success.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
done_when:

- `go test ./src/quack/ -run TestSplitRefusesItsSourceInAnySpelling` passes over `./a.go`, `sub/../a.go` and `../x`
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

`splitKey` in `src/quack/verb_split.go` slashes and cleans a path, and the source guard and `splitRepeated` both compare through it, so `./a.go` and `sub/../a.go` stop the split as the source. A target cleaning to `..`, under `../` or absolute stops it too. `TestSplitRefusesItsSourceInAnySpelling` failed red, with the cut lines gone from the tree, and passes now.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the fix sketch
- the path key stands in `splitKey` alone, and both guards read it
- the source keeps every line on each refused spelling

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
