---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: index-reads-loaded-projections/gate
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
group: quack-verbs-switch-over
parent: index-reads-loaded-projections
record:
  - step: do
    hand: box d8888f6242d7 · claude-code-remote
    hash_before: 14522c2d0c82c19c1e44df1195409aa417f97222
    hash_after: 14522c2d0c82c19c1e44df1195409aa417f97222
    answered:
      - name: tests
        exit: 0
        said: green, src/q passes
      - name: check
        exit: 0
        said: "spec/tickets/index-reads-loaded-projections.md:333:153: Characters: The character / stands outside the set a paragraph a"
    inputs:
      - name: ask
        hash: a870c2d91da9e23f
        size: 123
    def: 75d8d0f2720c47bf
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the curl line has no command. The hand answers it at tests-green against a running index, and the evidence names the reply.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/q

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The curl checkpoint stands answered against a running index on commit 14522c2d0. `curl http://127.0.0.1:<v1>/v1/values/migration/config/cage` answers `shadow` at revision 296 after a fresh start, and `shadow` is what `spec/config/level0.json` holds under `migration.cage`. The built-in mode of `cage` in `src/modules/migration/migration.go` is `old`, so the reply comes off the tracked file and not the default. The parent's ask names `migration/config/config`, whose only mode is `new`, so it answers `new` either way and decides nothing. The checkpoint reads `migration/config/cage` in its place.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: the curl answer stands named, and the key departs from the parent's ask for the reason `says` gives
the cleanup the change reveals: the parent's ask names a key that cannot tell the file from the default, and its tests-green evidence carries the `cage` key
every fact stands in one place: the tracked value lives in `spec/config/level0.json` and the default in `src/modules/migration/migration.go`, and this evidence points at both

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
