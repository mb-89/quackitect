---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-bridge-outlives-its-starter/gate
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
step: do
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: the-engine-fixes-its-faults
parent: the-bridge-outlives-its-starter
record:
  - step: do
    hand: box d7e124b659cd · claude-code-remote
    hash_before: 0b45492c334a79d885cd2c6b9ce9df61f4fd1a0e
    hash_after: 5ea0352ccf2e3eb26f80d31c224bf432d89578e5
    answered:
      - name: tests
        exit: 0
        said: green, 31 test(s) pass in 4 file(s)
      - name: check
        exit: 0
        said: "src/scripts/pull-hand-of.js:61:38: Antithesis: Say what is. 'never' opens a half that says what the thing is not."
    inputs:
      - name: ask
        hash: 97306bd87c399224
        size: 411
    def: b55bbe11bbd0f8bf
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

`portIn` in `src/scripts/serve.js` reads the pointer, and a vehicle tree carries none, so the probe asks `PORT_BASE`. A server started with no `--port` listens where `registeredPort` in `src/bridge/vehicle.js` says. Where the register hands this vehicle another port, `./RUNME.sh serve` meets another vehicle's bridge and starts nothing, and `servesHere` shares the read. The probe and the listen take one port.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

    ./RUNME.sh test test/level0/serve-port.test.js test/contract/cli-doors.test.js test/level0/pull-unbound.test.js test/level0/work-group.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

`portIn` in `src/scripts/serve.js` reads the pointer, and where a vehicle tree carries none, it reads `SE_BRIDGE_PORT` and then `registeredPort`, the same reads the listen in `src/bridge/server.js` takes. A vehicle the register hands another port now meets its own bridge, and `servesHere` shares that read. The CLI doors carry `windows`, so the register splits its folders as the server does. A door holding no clock reads the base, since the register stamps its entry with the clock.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the probe and the listen take one port
- the clock-less door reads the base, which the pull cases build, and the real doors always carry a clock
- the listen's order stands once, in `server.js`, and `portIn` points at it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
