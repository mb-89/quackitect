---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: test-walks-move-onto-fakes/gate
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
group: doors-declare-what-they-own
parent: test-walks-move-onto-fakes
record:
  - step: do
    hand: box dcf1ea3c64fd · claude-code-remote
    hash_before: 473ee8db3d619f8f57d9df2f5f2be453b13cc874
    hash_after: db9c42b1c252d4db5dd9a23dc49ab1aa1e89bebd
    answered:
      - name: tests
        exit: 0
        said: green, src/imports passes
      - name: check
        exit: 0
        said: "   61.4  in all"
    inputs:
      - name: ask
        hash: 0aaef0a08994e99b
        size: 572
    def: 16c92ada996c9f36
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

spec/design_output/doors.md names JS doors the tree no longer holds. The stands-on table and the contract table name `awake` (src/doors/awake.js, src/doors/fake/awake.js, test/contract/awake.test.js) and `biome` (src/doors/biome.js, test/contract/biome.test.js), and the bridgehead chapter names src/doors/fake/bridgehead.js. dead-js-tests-leave removed them in 8094440a2, and the-bridge-server-leaves removed the bridgehead fake in 1e7ebd952. The rows name only doors src/doors and test/contract hold, and the check that reads the family row spans reads these tables too.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/imports/clock_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

spec/design_output/doors.md named the awake and biome doors and the bridgehead fake, which earlier commits removed. Their rows leave, and the bridgehead chapter keeps the door and drops its fake. The note also named lib/paths.js by a path no file stands at, so it now names .claude/skills/level0/lib/paths.js. StaleSpans in src/imports/clock.go now reads every span naming a file by its folder, not Go tests alone. The tree case matches those spans against the files under src, test, .claude and spec. It went red on these seven spans before the note changed.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: the tables name doors that src/doors and test/contract hold, and the guard reads these tables too.
the cleanup this change reveals is in it: the guard found lib/paths.js named by a short path, and the note now names its full path.
the note names each door once, and the guard reads the spans off the note itself with no second list.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
