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
group: hooks-v1-hold-the-line
step: do
record:
  - step: do
    hand: box f9a277082525 · claude-code-remote
    hash_before: 31dfa132971a68a98c40794d34abd3b18b92a096
    hash_after: 35a3406f8c4234b5137c1e314e978d8fbfb4e3af
    answered:
      - name: tests
        exit: 0
        said: green, src/branches passes
      - name: check
        exit: 0
        said: "   76.5  in all"
    inputs:
      - name: ask
        hash: 17fc763e2ca7f029
        size: 509
    def: df12650931d480c9
reason: done
---

# Ask

The dispatch acts on pull requests whose head stands in this repository alone. A fork's check log then stays away from a worker holding push rights.

A fork's pull request named `work/<group>` fires a worker at the fork's red log. The `update-branch` call on it turns `update.yml` red on every push: `src/branches/dispatch_fire.go:160`, finding 8.

- `./RUNME.sh test src/branches` passes cases where `redPulls` and `updates` skip a pull request whose `head.repo.full_name` differs
- `./RUNME.sh check` passes

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

    ./RUNME.sh test src/branches

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The dispatch reads `head.repo.full_name` on every open pull request, and acts on one whose head stands in the run's own repository alone. A fork's pull request named under `work/` then meets no worker at its red log and no `update-branch` call, and a deleted fork's head, which reads no repository, meets neither. `redPulls` and `updates` share one test, `ownedBy` on `headRepo` in `src/branches/dispatch_fire.go`. The test is `TestDispatchSkipsAPullRequestWhoseHeadStandsInAFork`, and it fails with the test of `ownedBy` taken out.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: `TestDispatchSkipsAPullRequestWhoseHeadStandsInAFork` in `src/branches/dispatch_fire_test.go` covers `redPulls` and `updates`
- the cleanup the change reveals: the fakes of both readers now carry `head.repo`, as GitHub sends it
- the head test stands once, as `ownedBy` on `headRepo` in `src/branches/dispatch_fire.go`

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
