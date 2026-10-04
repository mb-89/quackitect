---
kind: [[ticket]]
state: open
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
urgent: true
step: do
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

A box past a handover clear loads the plan tool with `ToolSearch` while the plan grace stands spent. It answers the plan ask and works on, and the refusal tells it how.

Today the spent grace refuses `ToolSearch` as well. A cleared box stays without the plan tool's schema, so it stands stuck and pushes nothing again. The phase 11 boxes check, config and work stand there now.

- `go test ./src/modules/hooks/` passes `TestToolSearchRidesASpentGrace`, where `ToolSearch` rides and Bash meets the refusal
- `node --test test/level0/grace.test.js` passes the same case on the JS twin
- `./RUNME.sh check` exits 0

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

./RUNME.sh test src/modules/hooks test/level0/grace.test.js

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

A spent plan grace refused every call but the plan tool and the calls ending a turn. A handover clear drops the plan tool's schema, and the grace refused `ToolSearch` too. So the box stood without the tool the grace asked for.

| the file | what changes |
|---|---|
| `src/modules/hooks/fold.go` | `chain` passes `ToolSearch` before the grace and the demand, and the call spends neither |
| `src/modules/hooks/fold.go` | `refusedByGrace` names the load, a `select:` query on the plan tool |
| `src/bridge/grace.js` | the twin takes the same rule and text |
| `test/replay/cage/call-holds-cases.json` | the parity table carries the new text and a `ToolSearch` case |

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change follows the ask: `ToolSearch` rides, the refusal names the load, and a test stands beside each side
- the cleanup it reveals: none in this change
- every fact stands once: `schemaTool` holds the name in Go, and `SCHEMA_TOOL` in JS

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

Decisions, taken on a cloud box nobody watches:

| the decision | why |
|---|---|
| the JS twin changes too | the door answers every call under `migration.cage` at `new`, and no live road calls `holdsGrace`. The parity test reads a table of the bridge's answers, so the bridge says the same |
| the owner's hold still refuses the load | the stop hold asks for no tool, so nothing stands stuck behind it |
| the load still counts toward `plan.everyCalls` | the ask names the grace, and the plan's answer starts the count over |
| a fresh branch off `main`, through the GitHub connector | the cage refuses `git switch`, and `branch open` wants a group ticket on `main` already. The fix rides apart from the config group, since other boxes wait on it |
