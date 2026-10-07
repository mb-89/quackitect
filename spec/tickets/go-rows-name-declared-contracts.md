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
    hash_before: 4c32958dda714938e67150bb223a75f554b31510
    hash_after: d2875d0a794c68baea979297c2fb8dd23ab84aff
    answered:
      - name: tests
        exit: 0
        said: green, src/owns passes; green, src/imports passes; green, src/index passes
      - name: check
        exit: 0
        said: "   60.9  in all"
    inputs:
      - name: ask
        hash: fd75c16a757201a0
        size: 551
    def: 16c92ada996c9f36
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

the Go contract table in spec/design_output/doors.md names `src/index/fakeindex_contract_test.go`, `src/index/bus_contract_test.go` and `src/index/procs_test.go` as contract suites, but src/index/owns.yaml declares only index_contract_test.go, detach_contract_test.go and detach_windows_contract_test.go under contract, and none of the three ends `_contract_test.go` as the chapter A door names its contract tests asks. The rows name the suites the declaration holds, or say the fake-keeps-a-contract suite stands apart from the door's contract tests.

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/owns src/imports/clock_test.go src/index/bus_contract_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

Three rows of the Go contract table named suites that src/index/owns.yaml did not declare. The bus test drives a real bus on loopback, and the fake index suite holds the real index to the fake. Both are contract tests, so both take the _contract_test.go name, and the index door declares them under contract. The placed process test runs on the fake spawn and drives no real thing. So its row names the detach suites and the spawned process suite, which drive a real spawn. TestEveryContractTestNamesItsDoor refuses a renamed file no door declares.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

the change follows the ask: each row names suites the declaration holds, and each ends _contract_test.go.
the cleanup this change reveals is in it: the rename verb rewrote the ask names, and the discussion says which names the ask read before.
owns.yaml declares each suite once, and the table names those same files.

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

The rename verb rewrote the ask's names. The ask first named `src/index/contract_test.go` and `src/index/bus_test.go`, which this change renames to the two contract files the ask now shows.
