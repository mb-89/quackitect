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

gain: work/tests-meet-the-doors-once takes main in, so its pull request merges and the door refactor lands on trunk.

breaks: the done branch stands behind main with four conflicts, and its work never reaches trunk.

done_when:

- `./RUNME.sh check` answers green on the merge commit
- `git diff --check` finds no conflict marker

# do

<!-- makes the change, with the test that covers it -->

## tests

`go test ./src/branches/` answers ok, and `node --test test/level0/probe-clear.test.js` passes every case.

## check

`./RUNME.sh check` exits 0 on the merge.

## says

The sync of main into the branch resolves four conflicts:

| file | resolution |
|---|---|
| `src/branches/take.go` | main's `session` entry, through the branch's `Repo.Add` door |
| `src/quack/io_test.go` | the branch's `silentRun`, which reads the mark the merged fake commits |
| `src/scripts/probe-clear.js` and its test | main's `unparked`, which holds the trunk's reading of `todo: true` |

Main's fleet, route and prompt code called doors the branch removes. `fleet` reads pull heads through `Repo.RemoteRefs`, and the fleet, record and prompt cases run on the fake git and the fake disk.

Origin's branch carried the same port from another hand, under the-doors-pr-goes-green. The second sync takes origin's side of every hunk, so this merge adds no code past origin's.

A third sync takes main's retro and coordinator work, and resolves two conflicts:

| file | resolution |
|---|---|
| `spec/guidance/code/testing.md` | main's rule 5, which names the probe as the failing case of a defect, and the branch's rules 6 to 8, which its examples back |
| `src/branches/review.go` | the branch's reads through the git door, and main's `Unreached` row |

Main's unreached scan called the runner the branch removes. It reads the added files through `Repo.MergeBase` and `Repo.Diff`, a folder's files through `Repo.Files`, and the import search through one `Repo.ShowMany`. The auto-merged `retro_mint.go` takes back the `errors` import that main's `retroMintKeeps` calls.

## checked

- the change follows the ask: the branch takes main in, and the check stands green
- the cleanup the merge reveals is in the change: the unused `TAGGED` and its comment leave
- every fact stands in one place: the port keeps origin's `pullRefs`, and adds no second door

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
