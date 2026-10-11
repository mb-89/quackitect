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
group: branches-and-pull-report-truly
step: do
record:
  - step: do
    hand: box e310323746a3 · claude-code-remote
    hash_before: 964b41b33302c57c37085aa16bb48fb403672316
    hash_after: 964b41b33302c57c37085aa16bb48fb403672316
    answered:
      - name: tests
        exit: 0
        said: green, src/pull passes
      - name: check
        exit: 0
        said: "   96.6  in all"
    inputs:
      - name: ask
        hash: 66834950b63c54a2
        size: 440
    def: df12650931d480c9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
gain: a desk pull says a group's branch is pushed once the push lands, and pushes a cut branch again until origin holds it.

<!-- breaks, as text: what breaks if it is never done -->
breaks: `cutForGroups` in `src/pull/pull_branch.go` drops the push's result and says pushed either way. A later pull meets the local branch, skips it, and the group stays off the cloud.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
done_when:

- `go test ./src/pull/ -run TestARefusedGroupPushSaysSoAndRetries` passes
- `./RUNME.sh check` answers 0 on this box

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

    ./RUNME.sh branch test src/pull/pull_landed_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

`cutForGroups` reads the push result. It says pushed once origin takes the branch, and names the refusal otherwise. A later pull pushes a branch an earlier pull cut, and a failed `RemoteHeads` read cuts nothing.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask and the fix sketch
- the change reveals no cleanup
- the refusal line stands in `cutForGroups` alone

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
