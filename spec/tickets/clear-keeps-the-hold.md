---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: boxes-hold-and-hand-back/accept
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
parent: boxes-hold-and-hand-back
record:
  - step: do
    hand: box 3341fdcd540f · claude-code-remote
    hash_before: 0b76c341581afe2c35d945b4408bb270dd39689e
    hash_after: 0b76c341581afe2c35d945b4408bb270dd39689e
    answered:
      - name: tests
        exit: 0
        said: green, 1 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: "  118.1  in all"
    inputs:
      - name: ask
        hash: fb5bda2ed1f8a453
        size: 82
    def: 91dd16d99485afac
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

SessionEnd fires on a clear, so a live box writes an end beat and frees its branch

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/contract/end-beat-hook.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The SessionEnd hook that writes the end beat now carries a matcher naming every exit reason past clear. Claude Code fires SessionEnd on a /clear too, so a live box wrote an end beat, its hold read dead at once, and any box could take its branch while its unpushed commits stood on its disk. A contract case reads .claude/settings.json and asserts the matcher skips clear and takes logout, prompt_input_exit and other. work.md says the matcher leaves out clear. The docs helper read the reasons off the Claude Code hooks reference.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: the end beat skips a clear, and every other end still writes it
the cleanup the change reveals: the reviewer's other three points stand answered in the retro, none of them a fault in the goal
every fact stands in one place: the matcher lives in settings.json, the case pins it, and work.md says why in one line

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
