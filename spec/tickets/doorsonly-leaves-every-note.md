---
kind: [[ticket]]
state: closed
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: the-guard-refuses/gate
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
parent: the-guard-refuses
record:
  - step: do
    hand: box dcf1ea3c64fd · claude-code-remote
    hash_before: 6993c6c6416acdc88ce22d21c08f41a0d523b504
    hash_after: d0d3ef6a0975fe7b78fd75ceb94cd7bb1d1d0536
    answered:
      - name: tests
        exit: 0
        said: green
      - name: check
        exit: 0
        said: "   60.4  in all"
    inputs:
      - name: ask
        hash: c31c5047c95c51bd
        size: 217
    def: 1ba1f1de37804f52
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

spec/design_output/extension.md and spec/rationales/testing.md still name DoorsOnly and its pure modules, and the draft's size leaves both out. Carry the retirement into each, beside the doors note and the model note.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh check > /dev/null 2>&1 && echo green

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

Two notes still named DoorsOnly, the Vale rule the-guard-refuses retires. The extension note said DoorsOnly read the rest of the extension folder and found nothing to refuse. It now says nothing there walks around a door, and points at the doors note for the guard. The testing rationale's table of checks now names WalksAroundADoor where DoorsOnly stood. Its list of pure node: modules gives way to a pointer at src/owns/script.go, which holds that list once the guard refuses an undeclared module. A short history says why DoorsOnly retired. Both notes describe the state the group lands on main, so they run one step ahead of the code until the parent's implement step retires the rule. The change touches no code, so the check stands as its test.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: both notes the ask names carry the retirement, and the doors note and the model note stay with the parent's implement step, as the draft's move 7 says
the cleanup it reveals is in the change: the rationale's sentence on both Vale rules now names the one that stays, FakeDoorsInTest
the pure-module list stands once, in src/owns/script.go, and the rationale points at it in place of a second copy

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
