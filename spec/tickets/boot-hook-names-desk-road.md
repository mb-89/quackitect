---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: level0-drops-what-standard-replaces/gate
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
group: level-zero-becomes-a-typed-mod
parent: level0-drops-what-standard-replaces
record:
  - step: do
    hand: box eabbd46a6a23 · claude-code-remote
    hash_before: fa6eb3ff9e00840a31b9e67b680baa6088821186
    hash_after: 4b13c08766fabd982a2d6d125541df401fcff5b3
    answered:
      - name: tests
        exit: 0
        said: green, 8 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "   88.8  in all"
    inputs:
      - name: ask
        hash: d85d145a0afd2ec0
        size: 356
    def: 917614cfa7232c98
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

spec/design_output/level0.md section The boot hook still says that off a cloud box boot.js runs nothing, while src/scripts/boot.js asks hands the hook input to the start verb there; the implement step rewrites that sentence beside the row it already fixes in What the standard road leaves, so the note names both roads in one place and the row points at it

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/hooks.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The boot hook section of spec/design_output/level0.md holds a table of the roads src/scripts/boot.js takes: the install on a cloud box lacking the manifest, nothing on a cloud box holding it, and the start verb at a desk, each with why it stays a settings hook. The standard road row points at that section, so both roads stand in one place. The hooks test pins the desk road the note names. Commit 4b13c0876.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: the section names the desk road, and the row points at it
the cleanup the change reveals: the row reason moves into the section table, and nothing else surfaces
every fact stands in one place: the roads and their reasons stand in the boot hook section alone, and the row links to it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
