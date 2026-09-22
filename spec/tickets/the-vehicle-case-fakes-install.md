---
kind: [[ticket]]
state: closed
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
group: the-battery-earns-its-time
step: do
record:
  - step: do
    hand: box 14d41de46d55 · claude-code-remote
    hash_before: c9826f9143076e854bc4ed5ed00892568447e092
    hash_after: c9826f9143076e854bc4ed5ed00892568447e092
    answered:
      - name: tests
        exit: 0
        said: green, 10 test(s) pass in 2 file(s)
      - name: check
        exit: 0
        said: The rules pass.
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
The vehicle contract proves a vehicle in another folder answers its own verbs. It proves that over a fake install, so it reaches no network, no editor, no package manager and no home register.

<!-- breaks, as text: what breaks if it is never done -->
The case runs the vehicle's real install. That install fetches binaries, links the editor and writes the home register, and takes ten seconds on a good day.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
- `test/contract/vehicle.test.js` and `test/contract/stub.test.js` run the install with every fetching want skipped
- the shim case points at the fake vehicle the file writes
- the two files spawn node once a case, which `grep -c 'outside.run' test/contract/stub.test.js` decides
- `./RUNME.sh check` is green, and neither file stands in the stamp's slowest ten

# do

<!-- makes the change, with the test that covers it -->

## tests

    ./RUNME.sh branch test test/contract/vehicle.test.js test/contract/stub.test.js

## check

    ./RUNME.sh check

## says

`test/contract/fetching.js` names the wants of the install that reach past the box. Both files skip every one through `SE_INSTALL_SKIP`. The copy case borrows the method's modules through a link and the survey this box holds. Its home is a folder the case makes, and one copy serves the file's cases. So its `RUNME` runs the install's own checks and its verb, and fetches nothing. The chapter A vehicle stands alone, under `spec/design_output/vehicle.md`, says so.

The stub's shim cases point at a vehicle of one script the file writes, which prints what reaches it. The shim's two roads take one case each, and the shim finding no vehicle takes a case of its own. The command line case writes one stub under the upstream it names. So each case spawns once, and the count of `outside.run` in the stub file answers the cases it holds.

| case | on this box, under the whole battery | place in the ten |
|---|---|---|
| a copy answers its own verbs | 422 ms | seventh |
| the command line writes a stub where it says | 249 ms | tenth |

## checked

- the change follows the ask on three lines, and the discussion says why the fourth departs
- the cleanup it reveals is in the change: one skip list, and the lost road as a case
- the vehicle note holds the fake install, and both files point at it

# Discussion

The last line asks that neither file stands in the slowest ten, and one case of each file stands there still. What remains in each is one start of this tree's command line, under a shell for the copy. That start costs what the tenth place costs on this box. Producing a copy writes every file of the method through the disk door, one by one, and the method holds over a thousand. A folder copy in the disk door is a change to a door. So the private note a-copy-writes-each-file carries it to the retro.

The shim's real road stands in the slow case alone, where the vehicle's own library writes the stub's settings. A vehicle of one script carries no library.
