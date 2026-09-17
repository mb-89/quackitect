---
kind: [[ticket]]
state: draft
urgency: now
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
group: work/the-window-grows-tabs
---

# Ask

The tree view draws its items, and a person reaching one in a long list has no
road. The design input asks for the log's own filter language over an item.
[[spec/design_input/the-tree-view-editor]]

The gain is one language. A person learns the filter once, in the log, and
types the same thing in every tab the tree view draws.

Without it each tab grows a way of narrowing its own. A person then learns one
language a tab, and the footer marks something different in each.

- an item answers the three questions the language asks of a row
- a node stands while it matches, or while an item under it matches
- a child matching nothing goes, even under a parent that matches
- `go -C src/viewer test ./...` is green

# do

<!-- makes the change, with the test that covers it -->

## tests

    go -C src/viewer test ./...

## check

    ./RUNME.sh check

## says

`Item` answers the three questions `Row` asks, so the filter the log parses runs
over an item with no second parser and no second language:

| the question | what an item answers |
|---|---|
| a bare word | the name, then every value, in the order of the keys |
| `name: value` | the name for `name`, and the key of that name otherwise |
| `details: word` | every key and its value, a line each |

The flattening reads the filter. A node stands while it matches, or while an
item under it matches, so the road to a deep match stands with it. A child
matching nothing goes, even under a parent that matches, and a parent the
filter empties carries no mark.

## checked

- the change follows the ask: the log's language reads an item, and a parent stands for a match
- the cleanup it reveals: the filter takes a `Row`, so the tree adds no parser
- the language stands in one note, and the tree view's note points at it

# Discussion

A filter reaches no row under a parent a person shut, because a shut parent
draws no child. Whether a filter opens the parents carrying a match is a
question for the design, and this ticket leaves the collapse a person made
alone.

Each tab holding its own filter waits for the tab that draws this view. The
footer already asks the open tab whether one holds.
[[spec/design_output/viewer#the-footer-carries-status]]
