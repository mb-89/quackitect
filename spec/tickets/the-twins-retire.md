---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-twins-leave-whole/gate
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
point: gate
todo: false
step: do
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: failures-stand-registered
parent: the-twins-leave-whole
record:
  - step: do
    hand: box 83c32b2b4d58 · claude-code-remote
    hash_before: 163fe0aeb52b3dbf9f179ea6d85b7d8a1aaeec75
    hash_after: 69e546a23cc44038f742cec48c7efe272de66297
    answered:
      - name: tests
        exit: 0
        said: green, 3 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: green
    inputs:
      - name: ask
        hash: 720715339a4265ef
        size: 581
    def: b3995cb871db2080
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the draft departs from done_when lines one and two and says why, and the tree bears it out: work.js has a caller outside the tests in .claude/skills/level0/lib/copilot-dispatch.js, and pull.js and pull-hand.js are imported by ephemeral-pull.js, pull-escalate.js, pull-writes.js, pull-gate.js, pull-chapter.js, pull-route.js, work-answer.js, work-unblock.js, work-free.js, work-held.js, work-review.js, ticket.js, ticket-yours.js and work-test.js. Moving those importers off the twins and deleting the three files is a migration of its own, so those two lines ride out as this child

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test test/level0/copilot-dispatch.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check > /dev/null 2>&1 && echo green

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

Copilot dispatch now claims its group through the Go branch take, run through the proc door, and reads groupStanding from work-stands.js. Before, it ran the JS take in src/scripts/work.js, which drifts from src/branches/take.go, and it was the one runtime road into the twins past the dry probe. The two done_when lines this child carries stay open on purpose. A trace of the imports from every runtime entry (the plugin hooks, copilot.js, the probe scripts, the battery reporter, the editor extension) shows the twins head a JS pull stack that only one import keeps alive: probe-clear.js reads RESUME from src/bridge/handover.js, a copy of the prompt src/modules/hooks/stops.go owns. Deleting the three files alone would move their live helpers into some other file of that same dead stack. The retirement of the whole stack, with the tests covering it alone, stands as the note the-js-pull-stack-retires for the retro to mint as a group of its own.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change departs from the ask's two lines, and says why: the twins head a stack a group of its own retires
- the cleanup the change reveals is the dead JS pull stack, parked as the note the-js-pull-stack-retires
- the change adds no fact: spec/design_output/copilot.md already says the dispatcher calls branch take, and the code now matches it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
