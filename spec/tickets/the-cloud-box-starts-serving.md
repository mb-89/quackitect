---
kind: [[ticket]]
state: open
urgency: now
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

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

Nothing stands here yet.
