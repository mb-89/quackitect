---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: holds-beat-with-the-session/gate
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
point: gate
todo: false
step: do
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
group: boxes-hold-and-hand-back
parent: holds-beat-with-the-session
record:
  - step: do
    hand: box 3341fdcd540f · claude-code-remote
    hash_before: 579dad53c6e6d7de83fd8fade30a98cb98222949
    hash_after: a0b95fb37f8ddd673fe6a68ef848d88a2795a69c
    answered:
      - name: tests
        exit: 0
        said: green, 38 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "    1.7  test/contract/desk-start.test.js a server the proc door starts detached writes its marker after its starter exi"
    inputs:
      - name: ask
        hash: e7c5b388f204d0c2
        size: 418
    def: 493538c21ebdc181
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

src/scripts/prepush.js refuses an agent push of refs/beats/<group>, since no green stamp reaches a parentless commit, and its staleBy reads tip age alone, so the door refuses the take --over claim on an ended hold whose tip stands fresh. The size leaves prepush.js and its test out, and the Go tests reach no hook, so they pass while a real box fails. Skip refs/beats/* in the stamp loop, and read the beat in staleBy.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/prepush.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The push door lets an agent push a beat on any stamp, since a beat carries no work, and its stale reader reads the beat before the tip: an end at or past the tip reads dead, a beat inside work.beatAfter reads held. On a real cloud box the git proxy answered 403 to refs/beats, so the beat now stands on the branch beats/<group>, which the proxy passes, and a run on this box landed one on origin.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change stays in the push hook, its test, the beat in the branches package and the work design note, since the proxy refusal moved the ref
- the hook reads git through the repo door, and the cases drive its fake
- each new rule points at the design section a-hold-beats-with-its-session

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
