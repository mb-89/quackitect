---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-hooks-feed-the-sentinel/gate
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
group: failures-stand-registered
parent: the-hooks-feed-the-sentinel
record:
  - step: do
    hand: box 83c32b2b4d58 · claude-code-remote
    hash_before: d5012ff2c73cde4aefcfce46c37acf5205ab9908
    hash_after: 3ea120be3785761db15a62117d74fcfbcb1220f5
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: green
    inputs:
      - name: ask
        hash: d4eaf9e4f1de39b8
        size: 149
    def: d79e6f2f77a124a8
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

src/quack/main.go, the callers list names listens, and the hooks.Outside builder is listensHooks. Wire Hear there, and fix the callers line in place.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/quack/sentinel_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check > /dev/null 2>&1 && echo green

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

listensHooks in src/quack/main.go, the one builder of hooks.Outside, now hands Hear a sentinel. sentinelHere in src/quack/sentinel.go builds it over the tree's failure nodes, the clock door, the process door at the root and the session log. A case drives it over a temp root and reads the fired row in the session log. The draft named listens as the builder. The door keeps the draft's chapter closed, so the correction stands under the parent's Discussion.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask, except the callers fix lands under Discussion, since the door refuses a write to the draft's chapter
- no cleanup waits: Hook still hands no post to Hear, which is the parent's own change
- the session log path reads sessionLog, and the wiring calls sentinelHere once

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
