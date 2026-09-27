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
    hash_before: d589e9a050a3f9a2b61426c1a9a5d62e649cf671
    hash_after: d589e9a050a3f9a2b61426c1a9a5d62e649cf671
    answered:
      - name: tests
        exit: 0
        said: green, 16 test(s) pass in 2 file(s)
      - name: check
        exit: 0
        said: "spec/tickets/the-window-keeps-the-binding.md:39:130: Sentence: A sentence holds 25 words. Cut this one in two."
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the draft's `bindingLine` reads a change no line names as a change by hand, yet the sidebar `set`, the `./RUNME.sh config` verb in `src/scripts/cli-check.js` `readConfig`, and the new-window wipe each write their own line first. The builder words the bridge line as the binding it reads and the layer, and names no maker

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

./RUNME.sh test test/level0/retro-clear.test.js test/level0/binding.test.js

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

The bridge's binding line names the value and the file that sets it, and no maker. `submitsPrompt` in `src/bridge/server.js` now calls `bindingLine` at every prompt, so a change lands in the log at the next prompt. The maker's own line stands where one writes it: the sidebar's `set` and the config verb. The case a binding changed in its file writes a line at the next prompt, naming the layer, in `test/level0/retro-clear.test.js`, holds it. This commit carries the parent's whole change, which its own hand-back names.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change follows the ask: the line names the binding and the layer alone
- the cleanup: none stands
- the wording stands in `bindingLine` once

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
