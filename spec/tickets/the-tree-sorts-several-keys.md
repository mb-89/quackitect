---
kind: [[ticket]]
state: open
urgency: now
depends_on: [the-work-tab-draws]
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: anyone
    by: anyone
    to: retro
    input: ask
    reads: [[spec/guidance/working]]
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
process_hash: 05e53b89dab63152
group: work/the-work-editor-draws
step: do
---

# Ask

The tree view sorts by nothing. `src/viewer/sort.go` sorts the log, and it
reads the log's own columns and rows by name, one key at a time.

| what a board wants | what `sort.go` holds |
|---|---|
| a sort belonging to the tree | one belonging to the log |
| several keys, in the order a person picks | one key |
| a direction a key | one direction for the sort |
| a stable order, so later keys survive | `sort.SliceStable`, which is right |

The board opens on two keys: the rows a person owns first, then the queue
place. So a person reads their own work above the agent's, in one list.

The sort stands between the data and the view, and leaves the items as they
are. The filter already stands there, and the design asks for both.
[[spec/design_output/tree-view#the-view-draws-a-tree]]

The gain is a board that opens in the order a person needs. A preset then
carries its own sort, which is the ticket after this one.

- the tree sorts by a list of keys, each with its own direction
- a later key breaks the ties an earlier one leaves
- a press on a column head sorts by it, and a second turns it around
- a person picks a second key the same way, and it stands under the first
- the items stay as they stand, and the sort reaches the rows alone
- `go -C src/viewer test ./...` is green
- `./RUNME.sh check` is green

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
