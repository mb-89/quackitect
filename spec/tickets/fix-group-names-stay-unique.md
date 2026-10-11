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
    hand: box 8339730da099 · claude-code-remote
    hash_before: cc615e50d62972e5a8f10555f48774adc06b9e4d
    hash_after: cc615e50d62972e5a8f10555f48774adc06b9e4d
    answered:
      - name: tests
        exit: 0
        said: green, src/branches passes
      - name: check
        exit: 0
        said: "  101.2  in all"
    inputs:
      - name: ask
        hash: 16b1113f7945d9e5
        size: 499
    def: df12650931d480c9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
gain: each bundle of a dispatch run lands under a fix group of its own, filed under its own parent.

<!-- breaks, as text: what breaks if it is never done -->
breaks: `fixName` in `src/branches/dispatch_write.go` cuts the parent to its first words, so two parents sharing them take one name. `writesOf` then writes the second bundle over the first, and the first bundle's tickets land under the wrong parent.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
done_when:

- `go test ./src/branches/ -run TestTwoParentsSharingTheirFirstWordsTakeTwoFixGroups` passes
- `./RUNME.sh check` answers 0 on this box

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

    ./RUNME.sh branch test src/branches/dispatch_write_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

`fixName` in `src/branches/dispatch_write.go` cuts a parent's name to the words the cap keeps, so two parents sharing those words took one fix group name. `writesOf` then wrote the second bundle over the first. `freeName` now gives a name another ticket holds a counter in place of its last kept word. Every bundle of a run then lands under its own fix group, filed under its own parent, under the cap.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask: each bundle lands under a fix group of its own
- the change reveals no cleanup
- the fact stands once: `freeName` alone keeps a fix group name free

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
