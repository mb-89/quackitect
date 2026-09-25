---
kind: [[ticket]]
state: open
step: design/person-1
steps:
  - name: design
    reads: [[spec/guidance/voice]]
    steps:
      - name: person-1
        does: answers the question the engine asks
        by: person
        to: engine
        asks: "design/review fails back 2 times: | finding | fix |; |---|---|; | `privateStands` in `src/bridge/stop.js` passes on any open private ticket under `.se/tickets` through `openPrivate`, whoever holds it and where nobody holds it, so a helper's private ticket or an unpulled breakdown passes a session holding nothing | Drop `privateStands` from the door, and keep it in `src/bridge/stop.js`. `handed` in `src/scripts/pull-hand.js` writes a hold for a private ticket too, so `holdOf` answers both rows |; | The draft names no test for the first round's first finding | Name the tests: a helper holds a ticket and the session holds none, and an open private ticket stands that the session holds no hold on. Both refuse |; The earlier findings, read against the code:; the helper's hold: answered. `holdOf` at `handOf` reads the session's own hold, and `heldReadsIn` in `src/scripts/guidance-hand.js` shows how the bridge builds the `it` it reads; the door order: answered. `onWrite` runs `markDoor`, `ownerDoor`, `privateDoor`, `schemaDoor` and `voiceDoor`; the shared reader: dissolves under the first fix, since the move goes; the callers: answered. `onWrite` has three callers: `onToolCall` in `src/bridge/server.js`, `checked` in `src/bridge/apply.js` and `mintsNote` in `src/bridge/tools.js`; the god row: answered. `standsDown` stands exported, `BINDING` names `engine.binding`, and `src/bridge/stop.js` imports nothing reaching `src/bridge/write.js`. The door passes `ticket-in-hand` as the name, since `standsDown` reads a name off `ENGINE_CHECKS`; `./RUNME.sh check` reads at implement, and no retro rides a design handback."
        evidence:
          - name: answer
            form: text
            says: the answer, which the step behind this one reads
      - name: draft
        does: writes the approach the ask calls for
        from: anyone
        by: anyone
        input: ask
        evidence:
          - name: approach
            form: text
            says: the approach here where it takes minutes, or a link to the design output where it takes a note
          - name: callers
            form: list
            says: every caller of what the approach changes, one a line, as a file and a function
          - name: answers
            form: list
            says: every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft
      - name: review
        does: reads the approach against the ask
        not: draft
        on_fail: draft
        reads: [[spec/guidance/review/reviewing]]
        input: design/draft
        evidence:
          - name: verdict
            form: verdict
            says: pass or fail, with findings one a line
  - name: implement
    reads: [[spec/guidance/code/testing]]
    needs: ["branch test"]
    input: ["design/draft", "design/review"]
    checklist: ["the change touches no file the ask leaves out", "every door the change reaches has a fake", "a comment names the approach the change implements", "every fact the change adds stands in one place, and a note points at the file instead of repeating it"]
    steps:
      - name: tests-red
        does: writes the tests the ask calls for
        evidence:
          - name: tests
            form: command
            expects: assertion
            says: the tests you write fail on their own assertion
          - name: seen
            form: text
            says: what you see, and what surprises you
      - name: change
        does: makes the change
        reads: [[spec/guidance/code/code]]
        evidence:
          - name: lint
            form: command
            expects: 0
            says: the tree builds and lints
      - name: tests-green
        does: makes the tests pass
        input: tests-red
        to: retro
        evidence:
          - name: tests
            form: command
            expects: green
            says: the same tests pass
          - name: check
            form: command
            expects: 0
            says: the check is green on the commit
          - name: says
            form: text
            says: what changes and why, for a reader who was not there
process: [[spec/processes/standard]]
process_hash: 6bfe67ab65bf2e6d
record:
  - step: design/draft
    hand: box d6f05e3a585030 · claude-code
    hash_before: 9263e768b3783f2ae879601391c50cf7382f424f
    hash_after: 9263e768b3783f2ae879601391c50cf7382f424f
  - step: design/review
    hand: box d6f05e3a585030 · claude-code · helper-2
    hash_before: b809c934adb7818e6b5220386c1c9b1dcb88beab
    hash_after: b809c934adb7818e6b5220386c1c9b1dcb88beab
    returns: 1
    why: "| finding | fix |; |---|---|; | `holdStands` in `src/bridge/stop.js` reads any `.json` under `HOLDS`, and a hold stands one a hand, so a helper's hold passes a session holding nothing | Read the session's own hold, through `holdAt` or `holdOf` in `src/scripts/guidance-hand.js` and the session's hand, and add a test where a helper holds a ticket and the session holds none |; | `holdDoor` stands nowhere; `onWrite` in `src/bridge/write.js` runs `markDoor`, `ownerDoor`, `privateDoor`, `schemaDoor` and `voiceDoor` | Name the door the new one follows in that list |; | `holdStands` and `privateStands` stand unexported inside `src/bridge/stop.js` | Name the module the shared reader moves to, and both importers |; | The callers name `onToolCall` in `src/bridge/server.js` alone, while `checked` in `src/bridge/apply.js` and `mintsNote` in `src/bridge/tools.js` call `onWrite` directly | Add both, each as a file and a function |; | The `god` row reads as an owner's assumption, while [[spec/design_output/config#the-engine-controls]] decides it and `standsDown` in `src/bridge/stop.js` already stands `ticket-in-hand` down there | Point at that chapter, and call `standsDown` in place of a check of its own |; The rest holds against the code:; `onToolCall` reaches `onWrite` for Write, Edit and MultiEdit through `TOOLS` in `src/bridge/server.js`.; `checked` and `mintsNote` pass the call's `agentId` into `onWrite`, so the helper row reads it.; `HANDOVER` in `.claude/skills/level0/lib/folders.js` names `.se/HANDOVER.md`, and `TICKETS` names `.se/tickets`.; `./RUNME.sh check` reads at implement, since a design leaf carries no branch, and no retro rides a design handback."
  - step: design/draft
    hand: box d6f05e3a585030 · claude-code
    hash_before: bd39522d303c32e481121d4debba8055292f3ddd
    hash_after: bd39522d303c32e481121d4debba8055292f3ddd
  - step: design/review
    hand: box d6f05e3a585030 · claude-code · helper-4
    hash_before: a469fa75b12aad5eb77505a9e47deed35d5f2945
    hash_after: a469fa75b12aad5eb77505a9e47deed35d5f2945
    returns: 2
    why: "| finding | fix |; |---|---|; | `privateStands` in `src/bridge/stop.js` passes on any open private ticket under `.se/tickets` through `openPrivate`, whoever holds it and where nobody holds it, so a helper's private ticket or an unpulled breakdown passes a session holding nothing | Drop `privateStands` from the door, and keep it in `src/bridge/stop.js`. `handed` in `src/scripts/pull-hand.js` writes a hold for a private ticket too, so `holdOf` answers both rows |; | The draft names no test for the first round's first finding | Name the tests: a helper holds a ticket and the session holds none, and an open private ticket stands that the session holds no hold on. Both refuse |; The earlier findings, read against the code:; the helper's hold: answered. `holdOf` at `handOf` reads the session's own hold, and `heldReadsIn` in `src/scripts/guidance-hand.js` shows how the bridge builds the `it` it reads; the door order: answered. `onWrite` runs `markDoor`, `ownerDoor`, `privateDoor`, `schemaDoor` and `voiceDoor`; the shared reader: dissolves under the first fix, since the move goes; the callers: answered. `onWrite` has three callers: `onToolCall` in `src/bridge/server.js`, `checked` in `src/bridge/apply.js` and `mintsNote` in `src/bridge/tools.js`; the god row: answered. `standsDown` stands exported, `BINDING` names `engine.binding`, and `src/bridge/stop.js` imports nothing reaching `src/bridge/write.js`. The door passes `ticket-in-hand` as the name, since `standsDown` reads a name off `ENGINE_CHECKS`; `./RUNME.sh check` reads at implement, and no retro rides a design handback."
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
<!-- breaks, as text: what breaks if it is never done -->
<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

Every write in the tree serves the ticket the session holds, and the work tab names that ticket. The owner reads which ask a write answers.

Without it a session edits and mints while the work tab shows nothing in its hand, and the owner finds work no ticket asks for.

- a write refuses where the session holds no ticket and names the pull, and a test drives it
- a ticket mint, a note and the handover pass with no ticket held, and the test drives each
- `./RUNME.sh check` passes

# design

## person-1

<!-- design/review fails back 2 times: | finding | fix |; |---|---|; | `privateStands` in `src/bridge/stop.js` passes on any open private ticket under `.se/tickets` through `openPrivate`, whoever holds it and where nobody holds it, so a helper's private ticket or an unpulled breakdown passes a session holding nothing | Drop `privateStands` from the door, and keep it in `src/bridge/stop.js`. `handed` in `src/scripts/pull-hand.js` writes a hold for a private ticket too, so `holdOf` answers both rows |; | The draft names no test for the first round's first finding | Name the tests: a helper holds a ticket and the session holds none, and an open private ticket stands that the session holds no hold on. Both refuse |; The earlier findings, read against the code:; the helper's hold: answered. `holdOf` at `handOf` reads the session's own hold, and `heldReadsIn` in `src/scripts/guidance-hand.js` shows how the bridge builds the `it` it reads; the door order: answered. `onWrite` runs `markDoor`, `ownerDoor`, `privateDoor`, `schemaDoor` and `voiceDoor`; the shared reader: dissolves under the first fix, since the move goes; the callers: answered. `onWrite` has three callers: `onToolCall` in `src/bridge/server.js`, `checked` in `src/bridge/apply.js` and `mintsNote` in `src/bridge/tools.js`; the god row: answered. `standsDown` stands exported, `BINDING` names `engine.binding`, and `src/bridge/stop.js` imports nothing reaching `src/bridge/write.js`. The door passes `ticket-in-hand` as the name, since `standsDown` reads a name off `ENGINE_CHECKS`; `./RUNME.sh check` reads at implement, and no retro rides a design handback. -->

### answer

<!-- the answer, which the step behind this one reads -->

<!-- the form is text -->

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

A `ticketDoor` joins the checks in `onWrite` in `src/bridge/write.js`, after `ownerDoor` and before `privateDoor`. It refuses a write where the session holds no ticket, and names `./RUNME.sh ticket pull`.

The door reads the session's own hand, and no other hand's:

- the hold: `holdOf` in `src/scripts/guidance-hand.js`, at the hand `handOf` names
- a private ticket: `privateStands` moves out of `src/bridge/stop.js` into `src/scripts/guidance-hand.js`, and both files import it
- the binding: `standsDown` in `src/bridge/stop.js`, over `engine.binding` through `asks`

The `ticket-in-hand` stop check keeps `holdStands`, which reads every hand on the box.

| the write | what the door does |
|---|---|
| a session holding no ticket | refuses, and names the pull |
| a session holding a ticket, public or private | passes |
| a helper's write, carrying an `agentId` | passes, because the refactoring hand and a helper work beside the session |
| a new ticket under `spec/tickets` or a note under `.se/tickets` | passes, because the mint and the note open the ask |
| `.se/HANDOVER.md` | passes |
| `engine.binding` at `god` | passes through `standsDown`. For details, see [[spec/design_output/config#the-engine-controls]] |

### callers

<!-- every caller of what the approach changes, one a line, as a file and a function -->

<!-- the form is list -->

- `src/bridge/write.js`, `onWrite`, which runs the doors
- `src/bridge/server.js`, `onToolCall`, which reaches `onWrite` for Write, Edit and MultiEdit
- `src/bridge/apply.js`, `checked`, which reaches `onWrite` for the patch
- `src/bridge/tools.js`, `mintsNote`, which reaches `onWrite` for the mint
- `src/bridge/stop.js`, `privateStands`, which moves out
- `src/bridge/stop.js`, `standsDown`, which the door calls
- `src/scripts/guidance-hand.js`, `holdOf`, which the door calls
- `src/scripts/pull-hand-of.js`, `handOf`, which names the session's hand

### answers

<!-- every finding an earlier review names, one a line, with the answer the approach gives it, or first on a first draft -->

<!-- the form is list -->

- a helper's hold passes a session holding nothing: the door reads the session's own hold through `holdOf`
- `holdDoor` stands nowhere: the door follows `ownerDoor`
- the shared reader has no home: `privateStands` moves to `src/scripts/guidance-hand.js`
- the callers miss two: `checked` and `mintsNote` join the list
- the owner decides the god row: `standsDown` decides it, per the config design

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

fail

| finding | fix |
|---|---|
| `privateStands` in `src/bridge/stop.js` passes on any open private ticket under `.se/tickets` through `openPrivate`, whoever holds it and where nobody holds it, so a helper's private ticket or an unpulled breakdown passes a session holding nothing | Drop `privateStands` from the door, and keep it in `src/bridge/stop.js`. `handed` in `src/scripts/pull-hand.js` writes a hold for a private ticket too, so `holdOf` answers both rows |
| The draft names no test for the first round's first finding | Name the tests: a helper holds a ticket and the session holds none, and an open private ticket stands that the session holds no hold on. Both refuse |

The earlier findings, read against the code:

- the helper's hold: answered. `holdOf` at `handOf` reads the session's own hold, and `heldReadsIn` in `src/scripts/guidance-hand.js` shows how the bridge builds the `it` it reads
- the door order: answered. `onWrite` runs `markDoor`, `ownerDoor`, `privateDoor`, `schemaDoor` and `voiceDoor`
- the shared reader: dissolves under the first fix, since the move goes
- the callers: answered. `onWrite` has three callers: `onToolCall` in `src/bridge/server.js`, `checked` in `src/bridge/apply.js` and `mintsNote` in `src/bridge/tools.js`
- the god row: answered. `standsDown` stands exported, `BINDING` names `engine.binding`, and `src/bridge/stop.js` imports nothing reaching `src/bridge/write.js`. The door passes `ticket-in-hand` as the name, since `standsDown` reads a name off `ENGINE_CHECKS`

`./RUNME.sh check` reads at implement, and no retro rides a design handback.

# implement

## tests-red

<!-- writes the tests the ask calls for -->

### tests

<!-- the tests you write fail on their own assertion -->

<!-- the form is command -->

### seen

<!-- what you see, and what surprises you -->

<!-- the form is text -->

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

## change

<!-- makes the change -->

### lint

<!-- the tree builds and lints -->

<!-- the form is command -->

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

## tests-green

<!-- makes the tests pass -->

### tests

<!-- the same tests pass -->

<!-- the form is command -->

### check

<!-- the check is green on the commit -->

<!-- the form is command -->

### says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

### checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
