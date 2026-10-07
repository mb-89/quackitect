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
    hash_before: 647214682ec4d3adfb8af3eee53801b5b9aacf72
    hash_after: 647214682ec4d3adfb8af3eee53801b5b9aacf72
    answered:
      - name: tests
        exit: 0
        said: green, src/branches passes
      - name: check
        exit: 0
        said: "   59.9  in all"
    inputs:
      - name: ask
        hash: 294b4ab5f33b00f0
        size: 329
    def: df12650931d480c9
reason: done
---

# Ask

gain: work/tests-meet-the-doors-once takes main in, so its pull request merges and the door refactor lands on trunk.

breaks: the done branch stands behind main with four conflicts, and its work never reaches trunk.

done_when:

- `./RUNME.sh check` answers green on the merge commit
- `git diff --check` finds no conflict marker

# do

<!-- makes the change, with the test that covers it -->

## tests

./RUNME.sh branch test src/branches/take_test.go

## check

./RUNME.sh check

## says

The sync of main into the branch resolves four conflicts:

| file | resolution |
|---|---|
| `src/branches/take.go` | main's `session` entry, through the branch's `Repo.Add` door |
| `src/quack/io_test.go` | the branch's `silentRun`, which reads the mark the merged fake commits |
| `src/scripts/probe-clear.js` and its test | main's `unparked`, which holds the trunk's reading of `todo: true` |

Main's fleet, route and prompt code called doors the branch removes. `fleet` reads pull heads through `Repo.RemoteRefs`, and the fleet, record and prompt cases run on the fake git and the fake disk.

Origin's branch carried the same port from another hand, under the-doors-pr-goes-green. The second sync takes origin's side of every hunk, so this merge adds no code past origin's.

## checked

- the change follows the ask: the branch takes main in, and the check stands green
- the cleanup the merge reveals is in the change: the unused `TAGGED` and its comment leave
- every fact stands in one place: the port keeps origin's `pullRefs`, and adds no second door

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
