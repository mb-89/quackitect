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
    hand: box 8057eb8f1ee7 · claude-code-remote
    hash_before: e3316345d2ad2c57507afffea6ee5649193f8c22
    hash_after: e3316345d2ad2c57507afffea6ee5649193f8c22
    answered:
      - name: tests
        exit: 0
        said: green, 15 test(s) pass in 3 file(s); green, src/modules/hooks passes
      - name: check
        exit: 0
        said: The rules pass.
    inputs:
      - name: ask
        hash: f737dd67dfda93a1
        size: 936
    def: df12650931d480c9
reason: done
---

# Ask

A session past `context.handoverAt` clears its own conversation and keeps working. It writes `.se/HANDOVER.md`, and the conversation clears. The next one opens on the resume prompt and reads the handover through `read-handover`. The handover stays inside the session, and hands nothing to another box.

Today a cloud box writes the handover, ends its turn, and stands idle with the clear in hand. So the queue stops on every box that reaches the key.

- the dry probe's `clear` check sees `/clear`, then the resume prompt, at a turn's end past the key. `./RUNME.sh probe dry` decides it
- the stops fold answers the clear whichever end of the turn lands first, in cases of `src/modules/hooks`. `go test ./src/modules/hooks/...` decides it
- the plugin runs `/clear` and the resume prompt outside the hook the turn waits on, in a case of `test/level0`. `node --test test/level0/door-clear.test.js` decides it
- `./RUNME.sh check` exits 0

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/modules/hooks/clear_test.go src/modules/hooks/stops_test.go test/level0/door-clear.test.js test/level0/probe-clear.test.js test/level0/probe-dry.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

A session past `context.handoverAt` ended its turn with the clear in hand and stood idle. The dry probe now drives the real hooks and the real door past a low key, through the handover and the clear tickets the real pull hands, and reads whether `/clear` runs and the resume prompt follows. It found two faults, each red on its own:

- The stops fold set the clear at the Stop and answered it at the next `turn.complete`. The design reads both orders of the two ends, and a box meeting `turn.complete` first ended idle with the clear in hand. The probe in that order saw no clear answered and no warn row.
- `clears` in level0.js awaited `/clear` inside the hook the turn waits on, which the client's API refuses. The probe's harness keeps that refusal, and the Stop-first order met it: the warn row read `command.run rejects inside a hook the turn is waiting on`.

The fix:

- `holdsForHandover` in stops.go answers the clear at the Stop that decides it, and drops the handover there, so the order of the two ends no longer matters. `blocked` answers the clear word on the Stop. The `turn.complete` branch goes, since no clear phase waits for it.
- `clears` runs `/clear` and the resume prompt through `$.clock.after`, a dispatch of its own past the hook. The client queues both until the session stands idle, so the clear still follows the turn's end.

What I weigh: the Stop already decides the clear, with the waits-on-owner rule and the binding in hand, so answering there removes the order race without a second flag. I assume no Stop fires on a turn the person breaks off, as the bridge's `reason: answer` guard covered before. The live trial on this box stands under Discussion.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: the probe's clear check, the fold's cases in both orders, the plugin's case past the hook, and the check green
the cleanup: the dead clear phase and its `turn.complete` branch leave the fold; the ceiling warning on level0.js stood on main before this change, and stands as it was
one place: the resume prompt stays in RESUME and its Go spelling, the probe's clear part lives in src/scripts/probe-clear.js, and the notes point at this ticket

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
