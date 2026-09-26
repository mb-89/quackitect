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
    reads: [[spec/guidance/working]]
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
step: do
process: [[spec/processes/trivial]]
process_hash: 05e53b89dab63152
group: the-migration-writes-its-specs
---

# Ask

A design note specifies the answer protocol between the hook module and the index. It covers streaming, context fill, transcript rows, clear and resubmit, `model.classify` and `ui.log`. It names the tool list the build writes for the session start. [[spec/design_output/migration#the-gaps-and-their-answers]] asks it.

Phase 5 ports the cage onto this protocol. The hook answers more than a forward, and a port missing a road breaks a session.

- a design note under `spec/design_output` says it, and `./RUNME.sh lint` passes over it
- `./RUNME.sh check` exits 0

# do

<!-- makes the change, with the test that covers it -->

## tests

    ./RUNME.sh check > /dev/null 2>&1 && echo green

## check

    ./RUNME.sh check

## says

[[spec/design_output/hook-protocol]] specifies the answer protocol. The hook
module posts each event to the hooks door with the session, the fill and the
`before` id. The door answers a list of effects the hook module runs in order.

- `rows`, `spawn` and `classify` ask back with a call id, so the answer gate and the judge run through the door
- a step's stream posts once, as `turn.said`
- `clear` ends the turn, clears and resubmits, and `log` writes through `ui.log`
- the build writes the tool list, and the hook registers it at session start

Weighed: HTTP for the hook module, against the bus. HTTP wins, because the hook
module imports its own folder alone and carries no bus client. Assumed: a round
of asks takes a cap the door sets.

## checked

- the change follows the ask: the note covers each road the ask names, and the tool list
- the cleanup it reveals: the judge's own road in `pull-tool.js` goes when the cage ports
- the note points at the cage rationale for the refusal, and restates none of it


# Discussion

<!-- what anybody adds, at any time, on this ticket -->
