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
group: tickets-keep-their-chapters
step: do
record:
  - step: do
    hand: box 1ad094d8843c · claude-code-remote
    hash_before: bd673fc60914ed64cdbd7764da6d55b4ed269b73
    hash_after: 1e2cedce30cf0eea6b346a566201cadb8927419a
    answered:
      - name: tests
        exit: 0
        said: green, src/quack passes
      - name: check
        exit: 0
        said: "   64.2  in all"
    inputs:
      - name: ask
        hash: a67a1f84fe685484
        size: 638
    def: df12650931d480c9
reason: done
---

# Ask

The cold probe's clear check stands green on every run, because the probe deletes the group branch a former run pushes into the repository it clones, before it mints the group again.

The live client in the probe's clone pushes work/dry-probe-clears into the source repository. The next probe fetches that stale branch over the one it stands, the pull refuses with pull-origin-diverges, and the commit verb refuses every change until a hand deletes the branch.

- go test ./src/quack -run TestTheProbeMintsItsGroupUnderTheClonesRoot passes a case where the delete of the stale group branch runs before the mint
- ./RUNME.sh check is green

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

./RUNME.sh test src/quack/probe_dry_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

The probe's group mint in `src/quack/probe_clear.go` deletes the group branch from the clone's origin first. The live client in a former clone pushes that branch into the repository the probe clones, and the next probe fetched it over its own. The pull then refused with pull-origin-diverges, and the commit verb refused every change. `TestTheProbeMintsItsGroupUnderTheClonesRoot` asserts the delete runs ahead of the mint, and the cold runner case reads it in its run order. The commit landing this fix passed the cold probe with the stray branch standing beforehand.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask
- the client still pushes its group at the end, and the next probe drops it first, so no cleanup stands past the change
- the group name stands once, in `dryGroup`

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
