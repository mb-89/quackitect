---
kind: [[ticket]]
state: closed
urgent: true
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: anyone
    by: anyone
    to: retro
    input: ask
    reads: [[spec/guidance/working]]
    needs: ["work test"]
    checklist: ["the change follows the ask, or the discussion says why it departs", "the cleanup the change reveals is in the change, or is a note of its own"]
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
process_hash: 62642eaf8f9c9c53
step: do
record:
  - step: do
    hand: box d42624a67d18a8
    hash_before: e7f70164a51ce4d76d8e7ea27eaf86dd66a39b85
    hash_after: e68a1de179d91112e9a13ce11583359938aa8c1d
    answered:
      - name: tests
        exit: 0
        said: green, 56 test(s) pass in 2 file(s)
      - name: check
        exit: 0
        said: 64 stand at warning, which the panel draws and check allows.
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
A cloud session carries the cage from its first event, because a server answers the bridgehead there.

<!-- breaks, as text: what breaks if it is never done -->
Level zero holds no cloud session in this tree. The bridgehead posts to a port nobody listens on, writes one warn line, and every door stays shut. The session log of the group `the-bridgehead-installs-upstream` shows it: the server answers nothing until a hand runs `./RUNME.sh serve` by hand.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
- `./RUNME.sh branch take` on a cloud box starts the server detached where the port answers nothing, and says so
- a unit test over a fake process records the start, and records none where the port answers
- a cloud session's log carries the canary line, read off one routine run

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

    ./RUNME.sh branch test test/level0/serve.test.js test/level0/work.test.js

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

On a cloud box the pull takes the branch, and that take now ends on the server. A new module probes the health answer at the pointer's port and starts the server detached where nothing answers. The pull's last line says whether the server answers, starts, or fails to start. The ask names `branch take`, and the pull is the road that runs it on a cloud box, so the start lives on the take's return.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change follows the ask on its first two lines. The third waits for a routine run, and the discussion says so
- the cleanup the change reveals is in the change. The cloud pull test teaches the fake the probe and the start

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

The third line of the ask reads a cloud session's log off one routine run. Nothing on a desk stands in for it, so that line waits for the next routine run against this tree.

Nothing stands here yet.
