---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: go-cage-switches-over/accept
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
parent: go-cage-switches-over
record:
  - step: do
    hand: box 4388ca41f5 · claude-code-remote
    hash_before: 00afbc0477eef16a2320156a9afc57d483ac7b94
    hash_after: 00afbc0477eef16a2320156a9afc57d483ac7b94
    answered:
      - name: tests
        exit: 0
        said: green, 6 test(s) pass in 1 file(s); green, src/modules/migration passes; green, src/quack passes
      - name: check
        exit: 0
        said: "spec/tickets/the-cage-slice-stands-new.md:41:142: Sentence: A sentence holds 25 words. Cut this one in two."
    inputs:
      - name: ask
        hash: 01a2a22b2aaac4a1
        size: 415
    def: 5cb50ab53e936bec
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

src/modules/migration/migration.go builds the cage slice in as old with old, shadow and new, while every switched slice stands at new alone. The bridgehead hands each event outside new to the bridge path, and no bridge server answers there, so a box at old or shadow runs uncaged. The slice takes new alone, built in as new, the schema and the generated config commands follow, and the bridgehead reads no cage key.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/modules/migration src/quack test/level0/caged-door.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The cage slice takes `new` alone, built in as `new`, the shape the window slice took at its switch. The tracked key leaves `spec/config/level0.json`, since the built-in holds it, and the bridgehead reads `new` off the schema in its place. The schema, the config commands and the size golden follow off their writers, so `cage-old` and `cage-shadow` leave and the config verb sets no box back onto the bridge. The bridgehead keeps its key read: its bridge road still pins register, clear, reply, spawn and the stop hold under 22 tests, and that road leaves with the JS bridgehead in phase 10.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask for the slice, the schema and the commands, and departs on the bridgehead: the says field names why
- the cleanup it reveals, the bridge road for doored events, waits on [[spec/tickets/node-leaves-the-boxes]], since the JS bridgehead leaves whole there
- the mode list stands in `migration.go` alone, and the schema and commands read it off `quack schema` and `./RUNME.sh project`

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
