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
    hash_before: 153af28d261cc1982a22dcdfb99ac06b6a5c30b3
    hash_after: 03ae43fcaf13f79746c1e50ecc108ee5da53d52e
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/check passes
      - name: check
        exit: 0
        said: "   59.4  in all"
    inputs:
      - name: ask
        hash: 217bb10ffd15b067
        size: 528
    def: df12650931d480c9
reason: done
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

    ./RUNME.sh test src/modules/check

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

`NoLogDeleted` reads the JavaScript, Go and shell under `src` and `.claude`, past the Go tests, which clear their own temp logs. `deletesAt` in `src/modules/check/install.go` takes `os.Remove`, `os.RemoveAll` and `rmSync` in any case. A grep of the tracked tree with the widened patterns finds no line deleting a log, so the check raises no new row. `TestNoLogDeletedRefusesALineReachingALog` covers Go, rmSync and shell, and failed red on each before the change.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the fix sketch, with the Go tests left out
- the probe over the tree found no false row, and the check stayed green
- the source shape stands in `sourceFile` alone

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
