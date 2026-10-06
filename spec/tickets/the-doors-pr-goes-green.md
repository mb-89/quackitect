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

`go test ./src/branches/ ./src/proc/ ./src/modules/git/ ./src/quack/` and `node --test test/level0/probe-clear.test.js` pass on the box.

<!-- the form is command -->

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

## says

<!-- what changes and why, for a reader who was not there -->

Main merges in. Its fleet, route and prompt verbs now reach git and the disk through the doors the group built, and their tests run on the fake tree. Main's unpark of the probe's clone holds over the group's own copy of it. The git door writes MERGE_HEAD as a file in the git folder, because git from 2.45 on refuses `update-ref` on a pseudoref. The process door's folder case reads a file the run leaves by a relative name, because MSYS sh prints its folder in the `/c/...` form on Windows.

<!-- the form is text -->

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
