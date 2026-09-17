---
kind: [[ticket]]
state: closed
urgency: now
step: do
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: anyone
    by: anyone
    to: retro
    input: ask
    reads: [[spec/guidance/working]]
    needs: ["work test"]
    checklist: ["the change follows the ask, or the discussion says why it departs", "the cleanup the change reveals is in the change, or is a note of its own"]
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
process_hash: 568f402efe3adab7
record:
  - step: do
    hand: box d42624a67d18a8
    hash_before: fbd152dedce7c8e0da56c2280fd44ecfe53b77f1
    hash_after: 069f9630b9638d1aff1506b62b92fa30e04c9545
    answered:
      - name: tests
        exit: 0
        said: green, 7 test(s) pass in 2 file(s)
      - name: check
        exit: 0
        said: 19 stand at warning, which the panel draws and check allows.
reason: done
---

# Ask

A function holds one thing and a file one topic, and the config names the ceiling: 150 lines a function and 600 lines a file. The write door and the check read it, so a function or a file past its ceiling meets a refusal with the line.

Without it a file grows past what a reader holds in one sitting. The rule lives in a memory note alone, where the door reads nothing.

- `spec/config/level0.json` carries the two ceilings under one key, and `./RUNME.sh config` prints them
- a write of a function past its ceiling meets a refusal naming it, and a test drives it
- a write of a file past its ceiling meets a refusal naming it, and a test drives it
- `./RUNME.sh check` names every function and file past its ceiling, and passes on this tree

# do

<!-- makes the change, with the test that covers it -->

## tests

    ./RUNME.sh branch test test/level0/size.test.js test/level0/code-door.test.js

## check

    ./RUNME.sh check

## says

The config names two ceilings under `code`: the lines a function holds and the lines a file holds. A size library counts both over a brace language, and two readers use it. The code door reads the text before and after a write. It refuses a write that grows past a ceiling, and names the function or the file and its lines. The check names what stands past a ceiling as a warning, so the panel draws the debt and the check passes on this tree.

## checked

- the change follows the ask, and the discussion says where it departs: the check warns, the door refuses
- the cleanup the change reveals is a note: `walk` skips `.claude`, so the check counts no lib file yet
- the two ceilings stand in the config alone, and the note points at it

# Discussion

The ask says the check names every function and file past its ceiling and passes on this tree. Seven files and one function stand past a ceiling today, so a check that refuses them stays red until they split. So the check warns, and the door refuses growth: a file past its ceiling takes a cut and refuses one more line. The debt shrinks with every write and grows with none.
