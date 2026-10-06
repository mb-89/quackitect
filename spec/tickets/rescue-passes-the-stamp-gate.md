---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: takeover-rescues-unpushed-commits/gate
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
parent: takeover-rescues-unpushed-commits
record:
  - step: do
    hand: box 3341fdcd540f · claude-code-remote
    hash_before: 2d8704c8f1924f2635770ca7acc42746ab781fe9
    hash_after: 2d8704c8f1924f2635770ca7acc42746ab781fe9
    answered:
      - name: tests
        exit: 0
        said: green, 39 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "    1.9  test/contract/vale-paths.test.js a rationale reads the same by its absolute path as by its relative one"
    inputs:
      - name: ask
        hash: 8f582a6031563d8b
        size: 371
    def: 38c3e335ed14370b
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

`src/scripts/prepush.js` stands outside the size list. The rescue rides a branch under `refs/heads`, which the cloud proxy takes. Here `.github/workflows/check.yml` stands, so the stamp loop skips the rescue. A tree without that workflow refuses the red rescue push. Skip `refs/heads/rescue/` beside the beat skip in `holds`, with a case in `test/level0/prepush.test.js`.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/prepush.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The push gate in holds of src/scripts/prepush.js now skips a push to refs/heads/rescue/ beside the beat skip. A rescue branch carries a red commit off a dying box on purpose, so a tree without the check workflow refused it at the stamp loop. A case in test/level0/prepush.test.js pushes a rescue ref on an empty stamp and reads the gate pass.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: the rescue skip stands beside the beat skip in holds, with its case
the cleanup the change reveals: none surfaced; the two prefix skips stay two lines, each with its own reason
every fact stands in one place: the prefix is one constant at the top of the module, and its comment points at this ticket

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
