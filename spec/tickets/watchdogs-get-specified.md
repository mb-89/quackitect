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

A design note specifies the leases, the deadlines, the stale marks, the restarts and `session/alarms`. [[spec/design_input/the-index-holds-the-model#every-part-holds-a-lease]] asks it.

A part that stops reads as stopped only where every part carries a lease.

- a design note under `spec/design_output` says it, and `./RUNME.sh lint` passes over it
- `./RUNME.sh check` exits 0

# do

<!-- makes the change, with the test that covers it -->

## tests

    ./RUNME.sh check > /dev/null 2>&1 && echo green

## check

    ./RUNME.sh check

## says

[[spec/design_output/watchdogs]] specifies the watchdogs:

- a lease with its term, renewed as a step of the work loop on `lease.<part>`
- a deadline a name or action declares, with a default per kind
- the stale mark a reader meets, and the commit that clears it
- restarts that wait longer each time, and an alarm after a run of faults
- the fields of `session/alarms`, and who draws and hands them on
- the doors process and the hook module watching the index's own lease

Weighed: restarts that go on forever, against restarts that stop at an alarm.
The stop wins, because a part that fails each start burns the box and hides the
fault. Assumed: the foundation adds the config keys with their defaults.

## checked

- the change follows the ask: the note covers the leases, deadlines, stale marks, restarts and alarms
- the cleanup it reveals: none, because the note changes no file a reader holds
- the note points at the protocol note for the subject and the operations note for `q.Op`


# Discussion

<!-- what anybody adds, at any time, on this ticket -->
