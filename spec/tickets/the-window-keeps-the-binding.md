---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-retro-holds-the-clear/design/review
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
group: the-gates-read-the-state
parent: the-retro-holds-the-clear
record:
  - step: do
    hand: box c28a93a32b71 · claude-code-remote
    hash_before: 7f038d5adf5e7b737f94e3b4fa86fd9ab88bb916
    hash_after: 7f038d5adf5e7b737f94e3b4fa86fd9ab88bb916
    answered:
      - name: tests
        exit: 0
        said: green, 36 test(s) pass in 2 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/the-window-keeps-the-binding.md:39:130: Sentence: A sentence holds 25 words. Cut this one in two."
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

`opened` in `src/extension/sidebar.js` wipes a local `engine.binding` at every new window, and the tracked `queue` then answers. The draft logs that wipe, and the Ask's "the binding holds until the owner changes it" still waits on a fix that carries the binding across a new window

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

./RUNME.sh test test/level0/binding.test.js test/level0/sidebar.test.js

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

`opened` in `src/extension/lib/session.js` carries `engine.binding` across a new window, under `KEPT`. It drops every other local value as before, and `cleared` names those alone. So the binding holds until the owner changes it, and the tracked `queue` answers no more after a window opens. `extension.md` says so under `The local file dies`.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change follows the ask: the binding crosses a new window
- the cleanup: `cleared` names no kept key
- the kept keys stand in `KEPT` once

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
