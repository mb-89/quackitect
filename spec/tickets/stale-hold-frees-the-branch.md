---
kind: [[ticket]]
state: open
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
group: loose-fixes-99f4547
---

# Ask

A work branch frees itself once its tip stands quiet past `work.staleAfter`. A fresh box then takes it over, and the queue keeps moving.

Without it, the push door refuses every push to a branch no box works. That covers `branch release` and a fresh `branch take`, so the branch stands locked for good.

- `./RUNME.sh test test/level0/prepush.test.js` passes a stale hold, and refuses a fresh one
- `./RUNME.sh test test/level0/work-held.test.js` takes over and releases a stale hold, and writes the hand-over in the record
- `./RUNME.sh config work.staleAfter` answers `30m`
- `./RUNME.sh check` answers 0

# do

<!-- makes the change, with the test that covers it -->

## tests

    ./RUNME.sh branch test test/level0/prepush.test.js test/level0/work-held.test.js

## check

    ./RUNME.sh check

## says

A hold now lasts while its box pushes. `staleBy` in `src/scripts/prepush.js`
reads the time of the tip on origin, and `staleClaim` weighs it against
`work.staleAfter`, the same reading `branch list` and `branch take` use. Past the
span the push door lets any box through, and under it the door refuses as
before.

`branch take` now passes the clock to `readFree`, so a stale hold reads free. A
take over it writes `hash_after` onto the stale take before its own entry, and
the commit names the box it takes over from. `branch release` closes every open
take as before, and its commit names the hand-over where another box held it.
`handedOver` and `letGo` stand in `src/scripts/work-held.js`, beside the hold.

`work.staleAfter` drops to `30m`, because a box pushes after every finished
step. The chapter on a stale group in `spec/design_output/work.md` names the
tip's age as the lease.

## checked

- the change follows the ask. The ticket and the branch carry five words, because both doors cap a name there
- the cleanup it reveals: `letGo` moves out of `work.js`, which stood past its line ceiling
- the span stands in `spec/config/level0.json` alone, and the door reads it through the config

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
