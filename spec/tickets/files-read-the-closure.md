---
kind: [[ticket]]
state: closed
group: the-bridgehead-carries-its-closure
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: anyone
    by: anyone
    to: retro
    input: ask
    reads: [[spec/guidance/working]]
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
process_hash: 05e53b89dab63152
step: do
record:
  - step: do
    hand: box 201f76ea75a2 · claude-code-remote
    hash_before: 55f34cda8438d69e4ab2643f081c9d43a6b01506
    hash_after: 55f34cda8438d69e4ab2643f081c9d43a6b01506
    answered:
      - name: tests
        exit: 0
        said: green, 19 test(s) pass in 1 file(s)
      - name: check
        exit: 0
        said: 3 stand at warning. A commit and a push land over them, and the refactoring hand drains them past main's check.
reason: done
---

# Ask

A stub carries every file its bridgehead imports, read off the imports themselves.

`FILES` in `src/bridge/vehicle.js` spells that closure by hand, and
`test/level0/vehicle.test.js` spells it again. A hook taking a new import reds
neither, so a stub loses that file quietly and its bridgehead blocks there.

- `FILES` answers the closure off the hook's own imports
- a case adds an import to a fake hook, and reads the copy taking it
- `./RUNME.sh test` covers the closure over a hook importing two deep

# do

<!-- makes the change, with the test that covers it -->

## tests

    ./RUNME.sh branch test test/level0/vehicle.test.js

## check

    ./RUNME.sh check

## says

The copy into a stub reads the plugin folder's closure off the source, in place of a list spelled by hand. `filesOf` in `src/bridge/vehicle.js` starts at the two manifests and the modules the hooks manifest names, and follows every relative import it meets. `importsOf` and `modulesOf` in the lib read a module's imports and the manifest's modules, and read no disk.

What the hand-spelled list dropped, read off this tree: the hooks manifest names `pull-tool.js`, which imports `lib/pull.js`, and neither stood in the list. So a stub carried a manifest naming a module that stood nowhere. The closure takes both now, and a hook taking a new import hands the copy that file with no list to grow.

The cases drive a fake plugin folder whose imports run three deep, and one where the hook takes an import it lacked before. A lib nothing imports stays behind. The design chapter names `filesOf` in place of the list.

## checked

- the change follows the ask. The closure comes off the imports, one case adds an import, and the fake folder runs three deep.
- the cleanup in it: the marker derives from the plugin folder now, so the lib spells that folder once.
- the closure stands in `filesOf` alone, and the design chapter points at it. The case reads the copy against the source.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
