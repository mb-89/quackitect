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
group: code-is-pure-tests-behave
step: do
record:
  - step: do
    hand: box 37997ca97a74 · claude-code-remote
    hash_before: 62709d2a5934af2e8ae351f7bbf2b8150ceba4ad
    hash_after: d878b4317a3623af4d34b9c1bebd12d0bda8ce0e
    answered:
      - name: tests
        exit: 0
        said: green, src/imports passes; green, src/index passes
      - name: check
        exit: 0
        said: "   96.6  in all"
    inputs:
      - name: ask
        hash: f4ba7bf0a4c6835e
        size: 505
    def: df12650931d480c9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
The `src/index` tests run beside each other, so the package takes the time of its slowest case and a test needing an order shows red.

<!-- breaks, as text: what breaks if it is never done -->
Every `src/index` test runs alone, one after the other, and the package stays among the battery's slowest.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
- `src/index` joins `slowPackages` in `src/imports/serial_test.go`, and `go test ./src/imports -run TestTheSlowPackagesRunEveryTestBesideTheOthers` passes
- `go test -race -count=3 ./src/index` passes, and the Discussion holds the package's time before and after

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

Every src/index test calls t.Parallel, and src/index joins slowPackages, so the serial guard holds it. The package drops from about nine seconds to under three on this box, and go test -race -count=3 ./src/index stands clean. V1 splits into V1At(root), so its case takes the root as an argument in place of t.Setenv. The cases swapping a package variable, spawns through fakeSpawn and stderr in the failed settle case, carry the marker level0: RunsAlone - <why>. The serial guard in src/imports/serial.go now bars a function carrying that marker, and every caller of it, as it bars t.Setenv. Go runs those serial cases before it releases the parallel ones, so no reader races them. The swap itself leaves when the process door the tests-meet-the-doors-once group builds takes spawns.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask, and adds the RunsAlone marker the race forced, named in the says line
- the swapped package variables stay, since both sibling branches rewrite spawns, and the says line names who moves them
- the marker stands once, in the guard, and each case names its reason

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
