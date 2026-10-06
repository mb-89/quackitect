---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: probe-at-revision-guards-merges/gate
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
group: level-zero-smoke
parent: probe-at-revision-guards-merges
record:
  - step: do
    hand: box a694567529c5 · claude-code-remote
    hash_before: 812c88ffa0b93cc03a27b515daa2c1674cb4517c
    hash_after: cb4705516617922f85e8d141cf3a9405a12037ef
    answered:
      - name: tests
        exit: 0
        said: green, 14 test(s) pass in 1 file(s); green, src/quack passes
      - name: check
        exit: 0
        said: "   84.0  in all"
    inputs:
      - name: ask
        hash: 27c821b6ad5f4b81
        size: 602
    def: 7ed4c456d3f8a624
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the approach assumes the check runs `probe dry`, and level0Runs in src/quack/check.go now runs `probe smoke --working`, while probeVerb hands dry and smoke alike to the one Go probeDry and the entry picks probeSmoke on the smoke word. Resolve --at on the dry word alone, and refuse `smoke --at` and `--at` beside `--working` with one line, since smokeTree clones --shared and copies the root's built tools, which belong to another revision. A Go case decides each refusal. The four red cases fail on their own assertion at 260bda669, and TestTheSmokeProbeHandsItsRoadToTheEntry stays green beside them.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/quack/probe_verb_test.go test/level0/probe-dry.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The Go probe verb resolves --at to a commit on the dry road alone, through git rev-parse, and hands the entry the commit. It refuses --at on the smoke, and beside --working, with one line and no run, since the smoke clones the tree as it is with the root built tools, and the working change names the tree as it is. coldTree checks the clone out at the commit before the install, and the entry hands --at to the dry road with no working change. Two Go cases decide the refusals. The change also lands the revision road of probe-at-revision-guards-merges, since both stand in one function.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask, and takes the parent revision road with it, as the discussion says
the cleanup: the dry and smoke cases share one branch of probeVerb now
the flag stands once a language, atFlag in Go and AT in the entry, each naming the other

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

This change also lands the revision road of [[spec/tickets/probe-at-revision-guards-merges]], since the refusals stand in the same function. The cold tree case covers the JavaScript half:

    node --test test/level0/probe-dry.test.js
