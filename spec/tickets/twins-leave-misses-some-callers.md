---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-js-twins-leave/gate
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
group: read-topics-switch-over
parent: the-js-twins-leave
record:
  - step: do
    hand: box d857c176ced7 · claude-code-remote
    hash_before: c092f5a8a2b75871ac85511de263d1d6f04fe618
    hash_after: c092f5a8a2b75871ac85511de263d1d6f04fe618
    answered:
      - name: tests
        exit: 0
        said: green, 83 test(s) pass in 7 file(s)
      - name: check
        exit: 0
        said: "test/level0/cli-read.test.js:8:1: correctness/noUnusedImports: Several of these imports are unused."
    inputs:
      - name: ask
        hash: 08b01735e3d26025
        size: 506
    def: bc525a46695a1153
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the builder fixes these in place. test/level0/check-server.test.js holds a case on the log verb's shadow doors. src/modules/hooks/cage.go names src/scripts/log-shadow.js as the owner of the shadow row in two comments. src/scripts/cli-read.js carries the prose shadow's config and log. The help text of the five keys in spec/config/level0.schema.json still names old and shadow. The callers list says pull-hand.js imports processNameOf from guidance-shadow.js, but it already imports it from quack-topic.js.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/contract/twins-left.test.js test/level0/topic-readers.test.js test/level0/tested.test.js test/contract/tree.test.js test/contract/cli-check-doors.test.js test/level0/check-server.test.js test/level0/cli-read.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The builder fixes each caller the gate names in place, and the comparison twins leave with them. The config, log, guidance and prose twins leave the tree with their seven test files. Their wiring leaves the config verb, the log verb, the guidance verb, the pull's hand-out and both prose readers. The window's doors and the check's own doors drop the config and the log, since only the shadows read them. The two prose modes now stand in quack-topic.js. The five keys take new alone in the schema, and the projection drops their old and shadow commands. The cage names needs-shadow.js as the writer of the shadow row. The pull-hand line the gate names already read true, so it stays as it stands. Along the way the check refused a staged deletion: the tree's paths read every file git tracks, a file the working tree deleted among them. The commit verb runs the check before it stages, so a deleted server module blocked its own commit. The tree now leaves out a tracked path the disk no longer holds, and a case in tested.test.js holds it. The size golden takes the schema's shorter line count.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: each caller the gate names changes, and the pull-hand line already stood true
- the cleanup the change reveals is in the change: the tree's paths leave out a deleted file, with its case
- every fact stands in one place: the prose modes live in quack-topic.js alone, and the readers import them there

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
