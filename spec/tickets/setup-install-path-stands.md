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
group: tests-and-ci-hold
step: do
record:
  - step: do
    hand: box 54da26a4513f · claude-code-remote
    hash_before: b72cabcc51c19241a0f144e3f6d37819b047f503
    hash_after: b72cabcc51c19241a0f144e3f6d37819b047f503
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "   65.9  in all"
    inputs:
      - name: ask
        hash: 693b23432ab3c1ed
        size: 735
    def: df12650931d480c9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

The claude.ai environment's setup script, an owner-only setting outside the tree, runs `src/scripts/install.sh`, and the install moved to the root `install.sh`. A shim at the old path runs the root install with its arguments, and holds no install logic of its own.

The gain is a new cloud box that starts installed again, with no wait on the owner changing a setting.

Without it every new cloud box starts with no binary, and the first verb on it fails.

- `src/scripts/install.sh` runs the root `install.sh` with every argument it takes, in two lines
- `./RUNME.sh check` accepts the shim beside the check that lists the files a shell runs
- a test runs the shim and sees the root install reached, under `go -C src/quack test ./...`

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

    ./RUNME.sh branch test

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The claude.ai setup script runs src/scripts/install.sh, and the install moved to the root. A shim at the old path now runs the root install with every argument it takes. It holds no install logic of its own. A new cloud box starts installed again with no change to the owner setting. The RUNME cases share one planter and one runner, so the new case keeps the src/quack tests under its code.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the shim runs the root install with every argument in two lines, as the ask says
- the cleanup the change reveals, the repeated planting and running in runme_test.go, folds into two helpers in this change
- the install logic stands once, in the root install.sh, and the shim points at it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
