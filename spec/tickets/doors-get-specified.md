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

A design note specifies the doors: one file each with its fake, the inbound replay, and the doors process. It names the import rules the build checks. [[spec/design_input/the-index-holds-the-model#doors-on-both-sides]] asks it. So does [[spec/design_input/the-index-holds-the-model#the-build-holds-the-rules]].

A door is the one road to the outside, and a fake in the same file keeps every test in memory.

- a design note under `spec/design_output` says it, and `./RUNME.sh lint` passes over it
- `./RUNME.sh check` exits 0

# do

<!-- makes the change, with the test that covers it -->

## tests

    ./RUNME.sh check > /dev/null 2>&1 && echo green

## check

    ./RUNME.sh check

## says

[[spec/design_output/go-doors]] specifies the doors of the model. A door is one
Go file holding its interface, the real one, the fake and a registration. A
contract test under the `contract` tag runs one case list over both.

An inbound fake replays a recording off a session log at `debug`, over an index
in memory with every outbound fake. One process, `quack doors`, holds every
door. The analyzers `doorsonly`, `fakebeside`, `noname` and `fakeintest`
replace the Vale rules for the Go code.

Weighed: a note of its own, against a rewrite of the standing doors note. A note
of its own wins while the JavaScript doors still run. Assumed: recordings live
under `test/replay`, and phase 1 adds the analyzers.

## checked

- the change follows the ask: the note names the file shape, the replay, the process and the import rules
- the cleanup it reveals: the standing doors note leaves the tree once its doors do
- the note points at the standing doors note for the fake and contract rules, and restates none


# Discussion

<!-- what anybody adds, at any time, on this ticket -->
