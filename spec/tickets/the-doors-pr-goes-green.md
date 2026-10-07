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
    hash_before: 12538a0a5dbc1cd933e6b570fcd6bddfd25dc9e6
    hash_after: 12538a0a5dbc1cd933e6b570fcd6bddfd25dc9e6
    answered:
      - name: tests
        exit: 0
        said: green, src/proc passes
      - name: check
        exit: 0
        said: "   62.9  in all"
    inputs:
      - name: ask
        hash: 11f9bc48728fcbcb
        size: 461
    def: df12650931d480c9
reason: done
---

# Ask

gain: the tests-meet-the-doors-once group lands on main, so the doors-declare-what-they-own group, which waits on it, goes on.

breaks: the group's pull request stands red and in conflict with main, and every box waiting on its doors stands still.

done_when:

- `git merge-base --is-ancestor origin/main HEAD` answers 0 on the group's branch
- `go test ./src/proc/` passes on the Windows and the Ubuntu runner of the pull request
- `./RUNME.sh check` answers 0

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh branch test src/proc/

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->

Main merges in. Its fleet, route and prompt verbs now reach git and the disk through the doors the group built, and their tests run on the fake tree. Main's unpark of the probe's clone holds over the group's own copy of it. The git door writes MERGE_HEAD as a file in the git folder, because git from 2.45 on refuses `update-ref` on a pseudoref. The process door's folder case reads a file the run leaves by a relative name, because MSYS sh prints its folder in the `/c/...` form on Windows. The process door reads an exit code with a signal in its high byte and none in its low as Signalled on Windows, since MSYS sh ends on a signal that way and Windows carries none. The Vale-run case builds the path it looks for through `filepath`, as the box writes it. Main's beat and rescue reach git through the repo door: the door gains `EmptyCommit` and `ForcePushTo`, with a contract case on the real repo and the fake, and their tests run on the fake tree.

<!-- the form is text -->

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: PR #116 merged work/tests-meet-the-doors-once into main as a3b839def, so the group stands on trunk
- the cleanup the change reveals is in the change: the merge carried it, and this ticket adds no code
- every fact stands in one place: the merge commit holds the port, and this ticket points at it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
