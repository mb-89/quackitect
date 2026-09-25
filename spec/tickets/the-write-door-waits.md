---
kind: [[ticket]]
state: open
steps:
  - name: answer
    does: answers the question the ask carries
    by: person
    to: engine
    input: ask
    evidence:
      - name: answer
        form: text
        says: the answer, which the step behind this one reads
  - name: do
    does: carries the answer out, with the test that covers it
    from: anyone
    by: anyone
    to: retro
    input: answer
    reads: [[spec/guidance/working]]
    needs: ["branch test"]
    checklist: ["the change follows the answer, or the discussion says why it departs", "the cleanup the change reveals is in the change, or is a note of its own", "every fact the change adds stands in one place, and a note points at the file instead of repeating it"]
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
process: [[spec/processes/question]]
process_hash: 1f3006ec4b044a89
step: answer
---

# Ask

<!-- question, as text: what a person decides, and the ticket the question comes from -->
<!-- waits, as list: one line each, naming what stands still until the answer lands -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

Does the design of [[spec/tickets/a-write-needs-a-ticket]] take both fixes its second review names? The owner's answer stands there under `design/person-1`, and the findings stand under `Discussion`.

- the ticket door on a write

- a write refuses where the session holds no ticket and names the pull, and a test drives it
- a ticket mint, a note and the handover pass with no ticket held, and the test drives each
- `./RUNME.sh check` passes

# answer

<!-- answers the question the ask carries -->

## answer

<!-- the answer, which the step behind this one reads -->

<!-- the form is text -->

# do

<!-- carries the answer out, with the test that covers it -->

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

- [[spec/tickets/a-write-needs-a-ticket]] hands this over at `design/person-1`, which waits for a person.
  - design/review fails back 2 times: | finding | fix |
  - |---|---|
  - | `privateStands` in `src/bridge/stop.js` passes on any open private ticket under `.se/tickets` through `openPrivate`, whoever holds it and where nobody holds it, so a helper's private ticket or an unpulled breakdown passes a session holding nothing | Drop `privateStands` from the door, and keep it in `src/bridge/stop.js`. `handed` in `src/scripts/pull-hand.js` writes a hold for a private ticket too, so `holdOf` answers both rows |
  - | The draft names no test for the first round's first finding | Name the tests: a helper holds a ticket and the session holds none, and an open private ticket stands that the session holds no hold on. Both refuse |
  - The earlier findings, read against the code:
  - the helper's hold: answered. `holdOf` at `handOf` reads the session's own hold, and `heldReadsIn` in `src/scripts/guidance-hand.js` shows how the bridge builds the `it` it reads
  - the door order: answered. `onWrite` runs `markDoor`, `ownerDoor`, `privateDoor`, `schemaDoor` and `voiceDoor`
  - the shared reader: dissolves under the first fix, since the move goes
  - the callers: answered. `onWrite` has three callers: `onToolCall` in `src/bridge/server.js`, `checked` in `src/bridge/apply.js` and `mintsNote` in `src/bridge/tools.js`
  - the god row: answered. `standsDown` stands exported, `BINDING` names `engine.binding`, and `src/bridge/stop.js` imports nothing reaching `src/bridge/write.js`. The door passes `ticket-in-hand` as the name, since `standsDown` reads a name off `ENGINE_CHECKS`
  - `./RUNME.sh check` reads at implement, and no retro rides a design handback.
