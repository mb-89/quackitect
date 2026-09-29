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
group: boxes-keep-their-own-tickets
step: do
record:
  - step: do
    hand: box d81cb7b9efd7 · claude-code-remote
    hash_before: a6173dcf1f4b3c95ed71801189c201b60ae45622
    hash_after: a6173dcf1f4b3c95ed71801189c201b60ae45622
    answered:
      - name: tests
        exit: 0
        said: green, 12 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/vale-ls-windows-trial.md:41:1: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: 75440062c88c3cd7
        size: 557
    def: df12650931d480c9
reason: done
---

# Ask

Every loose ticket on main waiting on a person's answer gets decided where an agent can decide it, with the answer and what it weighed on the ticket, and the answer carried through. A ticket only a person can do stays loose on main, with every command the owner needs in its ask.

Without it the queue stands still on answers nobody gives, and the dispatch keeps naming the same questions.

- `./RUNME.sh dispatch --dry` names no loose question an agent can answer
- every ticket left for a person carries its commands in its ask
- `./RUNME.sh check` passes

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/contract/process.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The loose tickets on main waiting on a person, past the two another box holds, each take a decision:

| the ticket | the decision |
|---|---|
| the-owner-names-three-things | a box's answer under Discussion: the work button, the work tab, the count |
| findings-reach-the-owner | a box's answer under Discussion: a ticket in the box's group, the person route, or a note |
| the-owner-shapes-the-editor | a box's answer under Discussion, taken off the editor's design input |
| a-desk-runs-probe-reply | person work, carried by desk-probe-reply-trial on the person route |
| the-owner-walks-a-process | person work, carried by owner-walks-process-trial on the person route |
| vale-ls-on-windows | person work, carried by vale-ls-windows-trial on the person route |
| helpers-pull-past-plans | waits on nobody: its owner-read step applies to a handover alone |
| list-fields-split-lines | waits on nobody, the same way |
| gate-points-pass-the-push | its ask stands whole, so it opens |

What I weighed: the engine binds a cloud box to its own group, so the pull hands no loose ticket to this box, and an open ticket takes writes under Discussion alone. So each answer stands under Discussion. The dispatch, once it opens no issues, hands each question ticket to a fix group, and that box records the answer and carries out the do step. The groups' own person steps, such as those under the-engine-fixes-its-faults, stay with the boxes working those groups. The test names the contract holding the person route the successors stand on.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask, or the discussion says why it departs: the answers stand under Discussion, because the engine refuses this box the loose tickets' steps
- the cleanup the change reveals is in the change: two tickets stuck on a handover step say so
- every fact the change adds stands in one place: each trial's commands stand in its successor's ask, and the original points there

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
