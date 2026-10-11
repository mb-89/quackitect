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
    hash_before: 85acbcf71ae83e3dd1cb7c3bdc2d549f8b8d0c5c
    hash_after: 85acbcf71ae83e3dd1cb7c3bdc2d549f8b8d0c5c
    answered:
      - name: tests
        exit: 0
        said: green, src/branches passes
      - name: check
        exit: 0
        said: "  104.5  in all"
    inputs:
      - name: ask
        hash: 3884ef18ef1a17ee
        size: 445
    def: df12650931d480c9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
gain: a group whose branch stands after a refused dispatch write carries its cloud marker on main.

<!-- breaks, as text: what breaks if it is never done -->
breaks: `carried` in `src/branches/dispatch.go` pushes the work branches before the commit carrying their marker. A refused commit leaves the branches bare, and every later run skips a group whose branch stands.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
done_when:

- `go test ./src/branches/ -run TestARefusedWriteMarksTheGroupNextRun` passes
- `./RUNME.sh check` answers 0 on this box

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

    ./RUNME.sh branch test src/branches/dispatch_write_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

`carried` in `src/branches/dispatch.go` pushes each new work branch before the write commit that marks its group. A refused write left the branch standing bare, and `opensOf` skips a branched group, so no later run marked it. `remarksOf` in `src/branches/dispatch_write.go` now names each open group whose branch stands while trunk's copy carries no marker. The write commit marks those beside the groups it opens, and pushes no branch for them. Every path that opens a work branch marks trunk, so a bare branch means a lost marker write.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the next run marks a group whose branch stands
- the change reveals no cleanup
- the fact stands once: `remarksOf` alone names the bare groups

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
