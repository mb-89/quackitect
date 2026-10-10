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
group: hooks-v1-hold-the-line
step: do
record:
  - step: do
    hand: box f9a277082525 · claude-code-remote
    hash_before: d521550e7b7a7364d7209e749a91f5b9db2c0ed2
    hash_after: d521550e7b7a7364d7209e749a91f5b9db2c0ed2
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/hooks passes
      - name: check
        exit: 0
        said: "   79.1  in all"
    inputs:
      - name: ask
        hash: 176114f470c4cc37
        size: 419
    def: df12650931d480c9
reason: done
---

# Ask

The hook door computes a post's fields before it takes its lock. A slow git or disk read on one post then stalls no other session's call.

`writes()` holds `d.mu` across the field readers, whose git calls wait up to their span. Every other post waits on it: `src/modules/hooks/hooks.go:318`, finding 12.

- `./RUNME.sh test src/modules/hooks` passes, with the field readers run before `d.mu`
- `./RUNME.sh check` passes

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

    ./RUNME.sh test src/modules/hooks

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

`writes()` computes the post's fields before it takes `d.mu`. The held field, the stop facts and the brief stamp read git and the disk, and none of them reads state the lock guards. A slow read on one post then stalls no other session's call. The lock now guards the session's place, the handed mark and the commit alone. The code landed in d521550e7.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: `TestTheFieldReadersRunBeforeTheDoorsLock` in `src/modules/hooks/holds_test.go` fails where a git read meets the lock held
- the cleanup the change reveals: none, since `stoppedOf` and `stampOf` read no field the lock guards
- the reason stands once, in the comment over `writes` in `src/modules/hooks/hooks.go`

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
