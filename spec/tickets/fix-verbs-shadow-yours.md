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
step: do
record:
  - step: do
    hand: box d8571371c5d9 · claude-code-remote
    hash_before: b94d07cfa9407f4911731d9a01200bb691a0111b
    hash_after: b94d07cfa9407f4911731d9a01200bb691a0111b
    answered:
      - name: tests
        exit: 0
        said: green, src/index passes; green, src/modules/tickets passes; green, src/quack passes
      - name: check
        exit: 0
        said: "spec/tickets/vale-ls-windows-trial.md:41:1: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: e555f2142edfd5fd
        size: 851
    def: df12650931d480c9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

The verbs shadow names `ticket yours` as answering apart from cli.js, so the coordinator cannot turn `migration.phase4switch` on. Two faults cause it. The tickets module reads only the `step:` line, where `stepOf` in src/engine/group.js falls to the first leaf of `steps`, so a draft ticket answers an empty step. The `/v1/values` route reads the snapshot before the scheduler settles, so the first read after the index starts answers the default, an empty list.

With both fixed, the switch turns on, and the verbs that stand behind it answer as cli.js does.

- `./RUNME.sh ticket yours` runs both paths, and `./RUNME.sh log --kind shadow` names no new mismatch of it
- `./RUNME.sh retro notes` and `./RUNME.sh branch list --queue` add no mismatch to `./RUNME.sh log --kind shadow`
- `./RUNME.sh test src/index src/modules/tickets src/quack` is green

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/index src/modules/tickets src/quack

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

Three faults made ticket yours answer apart from cli.js. The tickets module read only the step line, where stepOf falls to the first leaf of steps, so a draft answered an empty step: Of now falls to the first leaf, and TestStepFallsToTheFirstLeaf failed before the fix. The tickets module read person only on an open ticket, where personStep reads the step hand whatever the state, so a draft at a person step answered false: Of now reads the hand alone. The v1 values route read the snapshot before the scheduler settled, so the first read after the index started answered the empty default: valueOf now settles first, as the door value call does, and TestV1SettlesBeforeItReads holds it. I restarted the index, drove ticket yours, ticket yours --next, retro notes and branch list --queue, and the shadow log named no new row. Assumption: the prose shadow rows on the ticket ask stand outside the verbs slice.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: three fixes with tests, no phase switch flipped
- the cleanup it reveals: the prose shadow row on this ticket ask is a note for the prose slice
- every fact stands once: the run lives on this ticket

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
