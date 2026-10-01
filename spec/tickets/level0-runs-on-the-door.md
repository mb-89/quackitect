---
kind: [[ticket]]
state: open
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: anyone
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
process: [[spec/processes/trivial]]
process_hash: 2b5ab398855a1aba
step: do
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

Main carries a level zero that loads and reaches its door, yet the rules and the canary reach no model. The cold probe fails its canary on main since the cage moved to new. The hook drops the named blocks the door hands the prompt context. It hands the client the door's rewritten prompt as a bare answer, and posts the prompt with no origin. It posts every event the door leaves to the bridge, which left the tree, so each box reads LEVEL ZERO ANSWERS NOTHING on every step.

Nothing caught it, for three reasons:

- the check runs unit tests alone
- the cold probe needs a model, and runs on demand
- the push door reads the stamp for trunk alone

The gain is a tree that turns red the moment level zero stops running, with no model and no key. A box then pushes nothing red.

- `./RUNME.sh test test/level0/caged-door.test.js` holds a case for each road the door missed
- `./RUNME.sh probe dry` passes on this tree, and fails four checks on main at 1b5569ecb
- `./RUNME.sh check` runs the dry probe as its level0 part, and exits 0
- `./RUNME.sh test test/level0/prepush.test.js` refuses an agent's push that no green stamp reaches
- `./RUNME.sh probe cold` passes every check, the new quiet check among them

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test test/level0/caged-door.test.js test/level0/probe-dry.test.js test/level0/prepush.test.js

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The hook now runs whole on the door road:

- the prompt context takes the door's named blocks, so the rules and the canary reach the model
- a prompt the door rewrites goes on rewritten, and carries its origin and the newest row
- every event finding the door down waits on the one start road
- only a post still falling past that road says it falls, and the line names the door's address
- no event reaches the bridge

`./RUNME.sh probe dry` stands the box the cold probe stands, and runs the hook module under a scripted session. It needs no model. It checks seven things, which `DRY.checks` in src/scripts/probe-dry.js names. On main at 1b5569ecb it fails four of them. The check runs it as its level0 part, so CI reads red the moment level zero stops running.

The push door now holds every branch an agent pushes. A cloud box, the engine and a Claude Code session each push as an agent. The tip takes the green stamp, or stands past it with ticket state alone changed since. The owner's own terminal push stays ungated, as push-gate-needs-the-engine left it.

The cold probe with the model passes all six checks on this branch, the canary among them.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask, and grows into the dry probe and the push door, which the owner asked for
- the cleanup it reveals: the Windows start road looks for an index with no .exe
- every fact stands once: the checks live in src/scripts/probe-dry.js, and this ticket points at them

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
