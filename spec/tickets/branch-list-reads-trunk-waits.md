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
    hash_before: 17d496718817ac3e96c57fed73365e87be17faa8
    hash_after: 17d496718817ac3e96c57fed73365e87be17faa8
    answered:
      - name: tests
        exit: 0
        said: green, src/branches passes
      - name: check
        exit: 0
        said: "  103.5  in all"
    inputs:
      - name: ask
        hash: 1bc369b8c218f3a1
        size: 359
    def: df12650931d480c9
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
gain: `branch list` shows a group waiting where take and dispatch hold it back.

<!-- breaks, as text: what breaks if it is never done -->
breaks: `rowOf` in `src/branches/list.go` passes no trunk tickets to `waitsOf`, so a trunk-only dependency and a parent's dependency drop from the row.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
done_when:

- `go test ./src/branches/ -run TestTheListShowsATrunkOnlyWait` passes
- `./RUNME.sh check` answers 0 on this box

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->
<!-- the form is command -->

    ./RUNME.sh branch test src/branches/port_d_list_test.go

## check

<!-- the check is green on the commit -->
<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->
<!-- the form is text -->

branch list passes trunk tickets to waitsOf, as take, free and dispatch do. A group waiting on an open group that stands on trunk alone, or on a parent group whose depends_on waits, now shows the wait and drops urgent.

## checked

<!-- one line per item of the checklist, on how you take it into account -->
<!-- the form is checklist -->

- the change follows the ask, and takes the fix sketch as written
- the change reveals no cleanup
- the trunk map comes from trunkOf, which owns it

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
