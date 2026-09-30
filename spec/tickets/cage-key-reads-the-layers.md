---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: a-down-index-refuses-calls/gate
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
group: go-cage-switches-over
parent: a-down-index-refuses-calls
record:
  - step: do
    hand: box d8901afed4d6 · claude-code-remote
    hash_before: 7bfb57b60ec167d9bb91c43719e3721b6da8ed47
    hash_after: bf79a21d3ac735938969614c65a33dd802f81aae
    answered:
      - name: tests
        exit: 0
        said: green, 6 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "test/level0/cage-shadow.test.js:44:65: Modal: This register holds the modals can, must, will. Say what is, or name the o"
    inputs:
      - name: ask
        hash: 187b9545b852aba5
        size: 418
    def: f84ece20b52206b7
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

design/draft-2 lists `test/level0/cage.test.js: a local override moves the cage as the tracked key does`, and the tree holds that case nowhere. `caged` in `.claude/skills/level0/hooks/level0.js` reads `migration.cage` through `configOf`, and `CAGED` in `test/level0/bridgehead.test.js` writes the tracked `spec/config/level0.json` alone. Add a case where an override alone reads `new`, and the hook takes the door road

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/caged-door.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The hook reads `migration.cage` through `configOf`, so every config layer moves it. Until now one fixture decided the cage, and it wrote the tracked file alone, so nothing held the override layer.

The case `an override layer alone puts the hook on the door road, and the tracked key alone leaves it off` takes two boxes. One writes the tracked key as `old` and lays `new` over it in the runtime config, and its guarded Bash call meets the refusal a down door answers. The other writes the tracked key as `old` and nothing over it, and its call reaches the harness. The pair decides the layer: drop the override and the first box passes the call through.

The fixtures name `TRACKED` and `LOCAL` off `.claude/skills/level0/lib/config.js` in place of the paths spelled out, so the resolver owns both paths.

The case grew `test/level0/bridgehead.test.js` past the file ceiling, so the cage cases move into `test/level0/caged-door.test.js`. The cut file builds its own hand, since `caged` overrides every door the shared helper gives it, and `src/modules/check/testdata/size.golden.json` takes the sizes again.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the case reads the override layer alone, and the hook takes the door road on it
- the cleanup rides along: the fixtures name the two config paths off the resolver, and the file past the ceiling takes its cut
- one place owns each fact: `TRACKED` and `LOCAL` come off `lib/config.js`, and the shared `DOOR` fixture carries the port both cages read

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
