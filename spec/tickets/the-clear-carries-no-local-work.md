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
step: do
record:
  - step: do
    hand: box d8921a909c1fa5 · claude-code-remote
    hash_before: e0996ed63392cddd15ca0b78d63d0b7939f16a8b
    hash_after: e0996ed63392cddd15ca0b78d63d0b7939f16a8b
    answered:
      - name: tests
        exit: 0
        said: green, 9 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "   63.0  in all"
    inputs:
      - name: ask
        hash: 9397312c563d4a4e
        size: 766
    def: df12650931d480c9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

A cloud box clears its context and keeps working, so its handover must lose nothing and must not loop. The handover's hand-back now refuses work that lives on the box alone: a commit origin lacks, or a changed file not committed. It also refuses a second handover on the tip the last one passed on. A whole context that pushed nothing then stops and says what blocks it, and stops burning tokens.

A box stopped earlier this week after two and a half hours of clears with nothing pushed. The hold also goes stale after sixty minutes now, in place of ninety.

- `./RUNME.sh test test/level0/pull-ephemeral.test.js` passes the case for unpushed work, uncommitted work and a looped handover
- `./RUNME.sh config work.staleAfter` reads `60m`
- `./RUNME.sh check` exits 0

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/pull-ephemeral.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The handover's hand-back in `ephemeral-pull.js` now runs `localWorkFault` after the file check, on a cloud box alone. The fault names the commits origin lacks and the tracked files left uncommitted, and the handover stays in hand until the box pushes. A red push to a work branch lands, so the box can always comply.

A pass writes the tip under `.se/.runtime/handover-tip.json`. The pull refuses the next handover on the same tip, so a context that pushed nothing ends with the box saying what blocks it. `work.staleAfter` drops to sixty minutes, because a working box now pushes far more often than that.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: two refusals at the handover and one config value
- the cleanup it reveals: none
- every fact stands once: the tip file path lives in HANDOVER_TIP in ephemeral.js

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
