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
group: loose-fixes-a3b839d
step: do
record:
  - step: do
    hand: box 31f16efb1b52 · claude-code-remote
    hash_before: 6ac132b056e68a89c436eb2d28cf5d071c86ca90
    hash_after: 6ac132b056e68a89c436eb2d28cf5d071c86ca90
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "   61.1  in all"
    inputs:
      - name: ask
        hash: b64cebb75460a6f3
        size: 324
    def: df12650931d480c9
reason: done
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

./RUNME.sh branch test src/quack/

## check

./RUNME.sh check

## says

The silent-module test holds its fake to a lease of two seconds, up from a fifth of one. On a loaded box the restarted fake took longer than the short lease to spawn. So it expired before it committed its pid, and the alarm fell on two faults with one pid seen. The Windows runner of the fleet group's pull request failed on that race.

## checked

- the change follows the ask: the Windows red goes, and the test still demands a restart before the alarm
- the sibling IO test keeps its short lease, since it waits on the alarm alone
- the term stands once, in the test that reads it

<!-- the form is checklist -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
