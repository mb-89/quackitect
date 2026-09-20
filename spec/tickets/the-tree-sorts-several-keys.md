---
kind: [[ticket]]
state: closed
urgent: true
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
group: the-work-editor-draws
step: do
record:
  - step: do
    hand: box 4089f1b3b6bc · claude-code-remote
    hash_before: 21bd1dd9da2447650262f36827d1347beaf0d0e7
    hash_after: 21bd1dd9da2447650262f36827d1347beaf0d0e7
    answered:
      - name: tests
        exit: 0
        said: green, 10 test(s) pass in 1 file(s); green, src/tui passes
      - name: check
        exit: 0
        said: 84 stand at warning, which the panel draws and check allows.
reason: done
---

# Ask

The tree view sorts by nothing. `src/tui/sort.go` sorts the log, and it
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
- `go -C src/tui test ./...` is green
- `./RUNME.sh check` is green

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

    ./RUNME.sh branch test

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

The tree sorts on a list of keys, each with its own direction. The sort stands
beside the filter, between the data and the view:

| what a press does | what the list holds |
|---|---|
| a press on a column head | that key, at the end of the list |
| a second press on it | that key, turned around |
| a third press | the list without it |
| a press on another head | that key under the first |

A later key breaks the ties an earlier one leaves. Two values reading as
numbers compare as numbers, and a row carrying no value stands after the rows
that carry one. The sort orders one level at a time, so the nesting survives.

The work view opens on the keys `spec/views/work.base` names: the rows a person
owns, then the place the queue gives.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change follows the ask: the tree sorts on several keys, each with its own direction
- the cleanup it reveals: `branch test` runs a changed Go test too, so a Go change answers green
- the sort stands in `treesort.go`, and the base file and the press both point at it

# Discussion

- The ask names the rows a person owns as the first key, and the answer carries that key now
- `branch test` ran the JavaScript alone, so a change in Go read missing. It runs both now
