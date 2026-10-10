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
group: tests-and-ci-hold
step: do
record:
  - step: do
    hand: box af15433560d6 · claude-code-remote
    hash_before: 63b290a38173ff3c0d6fef08cb57945cbad6e724
    hash_after: 63b290a38173ff3c0d6fef08cb57945cbad6e724
    answered:
      - name: tests
        exit: 0
        said: green, src/index passes; green, src/quack passes
      - name: check
        exit: 0
        said: "   57.3  in all"
    inputs:
      - name: ask
        hash: df619754b882eb00
        size: 914
    def: df12650931d480c9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

TestAServerStandingBeforeTheCheckAnswersAfterIt in `src/quack/ending_contract_test.go` proves the door alive with `kill(pid, 0)`, which a zombie passes, since the door is reaped only in the deferred Wait. TestADoorStandsInASessionOfItsOwn in `src/index/detach_contract_test.go` checks the group id alone, which Setpgid without Setsid passes too. The liveness check reads the door's state without reaping it, and the detach test checks the session id.

The gain is two tests that fail where the thing they name breaks.

Without it a group kill reaching the door, or a detach back on Setpgid, keeps every test green.

- the liveness check fails on a killed, unreaped door, under `go -C src/quack test -tags contract -run TestAServerStandingBeforeTheCheckAnswersAfterIt`
- the detach test asserts the door's session id equals its pid, under `go -C src/index test -tags contract -run TestADoorStandsInASessionOfItsOwn`

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

The server case asks wait4 with WNOHANG for the door, which answers 0 for a running door and the pid for a dead one. A killed door stands a zombie until a wait reaps it, and kill(pid, 0) passes a zombie, so the old check could not fail. A probe on this box showed kill(pid, 0) passing a killed door and wait4 naming it. The detach case reads the session id through the getsid call, since the group check alone passes under Setpgid. With detached turned to Setpgid the detach case failed on the session id, and it passes on Setsid.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: the liveness check reads wait4, and the detach case reads the session id
- the cleanup the change reveals stands in the change: none further
- every fact the change adds stands in one place: each comment points at this ticket

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
