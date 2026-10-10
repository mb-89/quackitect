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
    hash_before: 400a4669a33376d19fd5f5c573b937ec98e9738a
    hash_after: 03999e875167654438b4f2ec66eb1837583615d7
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/check passes
      - name: check
        exit: 0
        said: "   59.1  in all"
    inputs:
      - name: ask
        hash: d8835ad421da9c2c
        size: 549
    def: df12650931d480c9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
gain: a pointer to a missing heading draws one row, and a pointer inside a fence or a Go string draws none.

<!-- breaks, as text: what breaks if it is never done -->
breaks: `anchorFaults` in `src/modules/check/anchor.go` scans every raw line, so a fenced example or a fixture string raises an error nobody clears, and a note's dead heading draws `DeadAnchor` beside `EveryPointerResolves`.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
done_when:

- `go test ./src/modules/check/ -run TestADeadHeadingDrawsOneRow` passes: a note pointer to a missing heading draws one row, and a fenced pointer and a Go string draw none
- `./RUNME.sh check` answers 0

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

`DeadAnchor` and `src/modules/check/anchor.go` go. `unresolved` in `pointer.go` already names a chapter nobody wrote, over the lines `EveryPointerResolves` reads, so a dead heading draws one row and a fenced pointer or a Go string draws none. `TestADeadHeadingDrawsOneRow` failed red on all three rows and passes now. The lsp design section points at the one rule.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change takes the fix sketch first choice
- the design note and the log test drop the old rule name
- the chapter check stands in `unresolved` alone

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
