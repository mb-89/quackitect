---
kind: [[ticket]]
state: draft
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
---

# Ask

gain: the fleet group's pull request merges, so the fleet verb and its config keys reach main.

breaks: the group's work stays off main while the Windows check stays red.

done_when:

- `go test ./src/quack` passes on both CI runners
- `./RUNME.sh check` exits 0
- the pull request for `work/the-fleet-watches-itself` merges

# do

<!-- makes the change, with the test that covers it -->

## tests

`go test ./src/quack -run TestASilentModuleProcessRestartsAndRaisesAnAlarm -count=40` beside four full runs of `go test ./src/quack`: it failed twice with the Windows message before the change, and passes all forty after.

## check

`./RUNME.sh check` exits 0.

## says

The silent-module test holds its fake to a lease of two seconds, up from a fifth of one. On a loaded box the restarted fake took longer than the short lease to spawn. So it expired before it committed its pid, and the alarm fell on two faults with one pid seen. The Windows runner of the fleet group's pull request failed on that race.

## checked

- the change follows the ask: the Windows red goes, and the test still demands a restart before the alarm
- the sibling IO test keeps its short lease, since it waits on the alarm alone
- the term stands once, in the test that reads it

<!-- the form is checklist -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
