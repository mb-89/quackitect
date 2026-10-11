---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change with tests covering every rule of the ask, commits both on a clean tree, and stops once they pass
    from: route-keeps-its-chapters/gate
    by: anyone
    to: retro
    input: ask
    tags: ["code", "testing"]
    needs: ["branch test"]
    checklist: ["the change follows the ask, or the discussion says why it departs", "the cleanup the change reveals is in the change, or is a note of its own", "every fact the change adds stands in one place, and a note points at the file instead of repeating it", "stop when the tests cover every rule of the ask and pass, and leave working code alone"]
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
process_hash: 2a00b62f7c4bc60b
group: tickets-keep-their-chapters
parent: route-keeps-its-chapters
record:
  - step: do
    hand: box 1ad094d8843c · claude-code-remote
    hash_before: ea8ca0c73c0d4f46a4de4695cb2e3c9e01337e7b
    hash_after: ea8ca0c73c0d4f46a4de4695cb2e3c9e01337e7b
    answered:
      - name: tests
        exit: 0
        said: green, src/modules/check passes
      - name: check
        exit: 0
        said: "   62.7  in all"
    inputs:
      - name: ask
        hash: fb5bbaa9fb63f684
        size: 326
    def: 711dc9f682ed2c1e
reason: done
---

# Ask

The route ticket names every caller of `ReRouted`, its second test among them, so a reviewer weighs each.

A caller left out of the list meets a signature change with no review.

- the discussion of route-keeps-its-chapters names `src/modules/check/reroute_test.go` beside the three guarded callers
- ./RUNME.sh check is green

# do

<!-- makes the change with tests covering every rule of the ask, commits both on a clean tree, and stops once they pass -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

    ./RUNME.sh test src/modules/check

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The discussion of route-keeps-its-chapters names src/modules/check/reroute_test.go beside the three guarded callers of ReRouted, each with how it reads the call. It landed in ea8ca0c73.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask
- no cleanup stands past the change
- the fact stands once, where the change writes it
- the tests cover the ask and pass, and the change leaves working code alone

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
