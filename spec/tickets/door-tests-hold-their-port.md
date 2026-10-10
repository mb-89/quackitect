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
    hand: box af15433560d6 · claude-code-remote
    hash_before: 11cec0dd4fc4ec86bb29589803cebec93f043951
    hash_after: 11cec0dd4fc4ec86bb29589803cebec93f043951
    answered:
      - name: tests
        exit: 0
        said: green, src/tui/frame passes
      - name: check
        exit: 0
        said: "   65.8  in all"
    inputs:
      - name: ask
        hash: e5e563a7da5400f4
        size: 610
    def: df12650931d480c9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

freePort in `src/tui/frame/door_contract_test.go` closes its listener before the door binds the port, so a parallel case can take the port in the gap. The door takes port zero and answers the address it bound, so a test keeps its listener from bind to use. The closed-port case closes its own listener right before it tells.

The gain is door tests that hold their port, on Linux and on Windows alike.

Without it a parallel case can take the freed port, and the door test fails on address in use.

- no door test frees a port before the door binds it
- `go -C src/tui test -tags contract ./frame/...` is green

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

OpenDoor in src/tui/frame/door.go now listens and hands the listener to ServeDoor, which serves the door on a listener the caller already holds. The window still opens its door through OpenDoor on its fixed port. The contract cases bind port zero through heldPort and serve the door on that listener, so the port stands held from the bind on and no parallel case can take it in a gap. The case for a port where no door answers holds its own listener, which drops each call, so the tell answers false and no other case binds that port. The second-door case still opens OpenDoor on the held port and meets the error.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the door serves a held listener, and no case frees a port before use
- the cleanup the change reveals stands in the change: freePort leaves
- every fact the change adds stands in one place: ServeDoor points at this ticket

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
