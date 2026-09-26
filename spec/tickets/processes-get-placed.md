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
process: [[spec/processes/trivial]]
process_hash: 05e53b89dab63152
group: the-migration-writes-its-specs
step: do
---

# Ask

A design note specifies how the system places the processes. It covers the start
of the index, the spawn of the doors and each module, and the standing file. It
covers how a changed module rebuilds and restarts alone. [[spec/design_input/the-index-holds-the-model#the-system-places-the-processes]]
asks it.

The deployment phase splits the modules into processes on this note. Without
it the split lands as each box sees fit.

- a design note under `spec/design_output` says it, and `./RUNME.sh lint` passes over it
- `./RUNME.sh check` exits 0

# do

<!-- makes the change, with the test that covers it -->

## tests

    ./RUNME.sh check > /dev/null 2>&1 && echo green

## check

    ./RUNME.sh check

## says

[[spec/design_output/processes]] specifies how the system places the
processes:

- one binary, `quack`, with a verb for the index, the doors and a module
- the start road, the same on Linux and Windows, and the stop over the bus
- the standing file and its fields
- placements under a config key, and a process of its own for every other topic
- a crash against a hang: defaults for an exit, a stale mark for a lease
- a module that rebuilds and restarts alone

The note reveals a clash in [[spec/design_output/inner-protocol]]. A stamp of
the whole build refuses a module rebuilt alone, so the stamp now covers the `q`
package. The protocol's rationale says the same.

Weighed: defaults or stale values for a module that dies. The design input asks
for both, so an exit reads as defaults and a hang as stale. Assumed: a cloud box
leaves the rebuild watch off.

## checked

- the change follows the ask: the note covers the start, the spawn, the standing file and the rebuild
- the cleanup it reveals: the stamp in the protocol note and its rationale, in this change
- the note points at the doors and watchdogs notes, and restates neither


# Discussion

<!-- what anybody adds, at any time, on this ticket -->
