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
    hash_before: c24f93521f5fb48e72243394f67fee43779fa4bf
    hash_after: c24f93521f5fb48e72243394f67fee43779fa4bf
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/hooks/command passes
      - name: check
        exit: 0
        said: "   77.5  in all"
    inputs:
      - name: ask
        hash: b5b34ab7363d9056
        size: 553
    def: df12650931d480c9
reason: done
---

# Ask

A push counts as a trunk push where the destination of its ref words is trunk alone. A work branch or a commit message naming main then pushes clean.

`pushesMain` matches `work/fix-main-page` and a message saying push main. The trunk guard then sends a cloud box to hand its branch back: `src/modules/hooks/command/trunk.go:29`, finding 4.

- `./RUNME.sh test src/modules/hooks/command` passes `LandsOnTrunk` cases for a branch and a message naming main
- the same test refuses a push to `main` and to `HEAD:refs/heads/main`
- `./RUNME.sh check` passes

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

    ./RUNME.sh test src/modules/hooks/command

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The trunk guard reads each `git push` segment's ref words past its remote, and counts a push as a trunk push where a ref's destination is main. The destination reads past a leading `+`, past the colon, and past `refs/heads/`. A work branch whose name holds main, or a commit message saying push main, then pushes clean. The parse reads through a `sh -c` body, git's valued global options and the push options that take a value. `namesABranch` reads the same parse. The code landed in d521550e7.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: `TestLandsOnTrunkReadsTheBridgesLanding` passes a branch and a message naming main, and refuses `main`, `HEAD:refs/heads/main`, `+work/a:main` and `refs/heads/main`
- the cleanup the change reveals: `pushesMain`, `pushWords` and `verbWords` leave with the regex reading
- the destination stands once, as `destOf` in `trunk.go`, and git's valued options once, as `gitValued`

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
