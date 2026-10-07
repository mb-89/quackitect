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
group: lint-without-vale
parent: lint-without-vale
step: do
record:
  - step: do
    hand: box 612227244607 · claude-code-remote
    hash_before: dc6afa7c62495ae56f6d0ab4b39b562bf95af327
    hash_after: 73dd742106bb5892a32a3fee31f851f2b06d5da0
    answered:
      - name: tests
        exit: 0
        said: green, 5 test(s) pass in 1 file(s); green, src/quack passes
      - name: check
        exit: 0
        said: "   65.0  in all"
    inputs:
      - name: ask
        hash: 9c4d21f883b424f7
        size: 477
    def: df12650931d480c9
reason: done
---

# Ask

The files main brings in pass the Go lint. The Problems panel outside the tickets folders then stands clear.

Without it the push waits on these warnings, and every hand meets them again.

- `./RUNME.sh lint` names no warning in `.claude/skills/level0/lib/index-tools.js`.
- `./RUNME.sh lint` names no warning in `src/quack/runme_test.go` or `src/quack/verb_mint_test.go`.
- `./RUNME.sh lint` names no warning in `test/level0/index-tools.test.js`.
- `./RUNME.sh check` exits 0.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/quack/runme_test.go src/quack/verb_mint_test.go test/level0/index-tools.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

Four files main brings in carry lint warnings, and the push waits on them. Each comment in runme_test.go gains its pointer, two comments in index-tools.js lose a modal and a never, the unused argv takes an underscore, and the refusal table of TestMintVerb moves to TestMintVerbRefusals under the function ceiling. The new case takes no t.Parallel, since runsVerb calls t.Setenv and Go refuses that in a parallel test.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask, and the says field names the one departure from the handover: no t.Parallel
- the cleanup stands in the change, and the vocabulary line on the group ticket stays as the hand-back asks
- the change adds no fact: the pointers name the standing ticket

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
