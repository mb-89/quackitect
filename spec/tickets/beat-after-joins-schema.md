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
    hash_before: 7319b4bac4d6af834f4125b79e48453eb7fe87ac
    hash_after: 4407c78e5b00df7d551b7e814bbdc87626fa46a0
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/settings passes
      - name: check
        exit: 0
        said: "  116.7  in all"
    inputs:
      - name: ask
        hash: fa4644d0ca86e9d3
        size: 319
    def: 493538c21ebdc181
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

work.beatAfter takes a row in spec/config/level0.schema.json beside staleAfter, which the size leaves out. The approach also reads the span off .se/.runtime/beat.json, which clashes with the config key. Read the span off work.beatAfter, and keep the last beat off origin's ref or name the runtime file as a cache alone.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/modules/settings/settings_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The key work.beatAfter joins the settings declarations at 10m, under work.staleAfter, so the generated schema, its command file and the size golden follow. A test holds the beat span shorter than the stale span. The parent ticket says under Discussion that the beat verb reads the span off this key alone, and the last beat off refs/beats.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change touches the settings declaration, its test, and the files the generators write from it
- the key reads through the config door, so no new door stands
- the test names the approach in its comment
- the span stands in the declaration alone, and the parent points at the key

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
