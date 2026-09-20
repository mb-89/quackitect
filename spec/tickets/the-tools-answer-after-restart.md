---
kind: [[ticket]]
state: open
steps:
  - name: design
    reads: [[spec/guidance/voice]]
    steps:
      - name: draft
        does: writes the approach the ask calls for
        from: anyone
        by: anyone
        input: ask
        evidence:
          - name: approach
            form: text
            says: the approach here where it takes minutes, or a link to the design output where it takes a note
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
    input: design/draft
    checklist: ["the change touches no file the ask leaves out", "every door the change reaches has a fake", "a comment names the approach the change implements"]
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
      - name: reflect
        does: names the class of error in the findings, and the fix for the class
        when: returned
        input: verdict
        evidence:
          - name: class
            form: text
            says: the class of error the findings describe, and the fix for the class
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
  - name: verdict
    does: reads every hunk against the ask and the approach
    not: implement
    on_fail: implement/reflect
    reads: [[spec/guidance/review/reviewing]]
    input: ["diff", "implement"]
    to: retro
    checklist: ["every fact the change adds stands in one place, and a note points at the file instead of repeating it"]
    evidence:
      - name: read
        form: files
        says: every file you read, one a line
      - name: verdict
        form: verdict
        says: pass or fail, findings one a line
group: the-bridge-keeps-transport
process: [[spec/processes/standard]]
process_hash: 838dd6d003506639
step: implement/tests-red
record:
  - step: design/draft
    hand: box fa49097ce66c · claude-code-remote
    hash_before: f095174f8c061828b09ab9b0e4eb3c5452105eca
    hash_after: f095174f8c061828b09ab9b0e4eb3c5452105eca
  - step: design/review
    hand: box fa49097ce66c · claude-code-remote · helper-2
    hash_before: 4950ae0fa9291bb147c2ee8a94b23ef5e46c5516
    hash_after: 4950ae0fa9291bb147c2ee8a94b23ef5e46c5516
    returns: 1
    why: the reader sits in the registration branch of `decide`, which runs after the door. Seat it beside `freshens`.; the call meeting the restarted server reads an empty box under that order, which is the fault the ask names.; the four cases cover the registration and the context block. A case driving `tool.call` on a fresh box goes missing.; the reader refills the projections that `freshens` fills already on a fresh box. Leave that fill where it stands.; `box.tools` comes from `surveyHere`, which `src/bridge/guidance.js` exports nowhere. The change table names one file alone.; `decide` sets `box.specs` nowhere, and `toolsText` reads `box.specs ?? []`. Name that assignment in the change.; the mint throws on a fresh box, because `mintedNote` calls `schemas.get(kind)` over nothing. The draft names the empty enum alone.; `{ register }` registers on any event, by the answer table in `spec/design_output/level0.md`. The road for the patch tool holds.; the scope call holds. The window with no server standing belongs to [[spec/tickets/the-bridge-says-it-falls]].; the table on what a fresh box holds matches the tree. The write door fills `box.schemas` itself, and earns a row.; the draft touches the ticket file alone, so the diff stands inside the brief.
  - step: design/draft
    hand: box fa49097ce66c · claude-code-remote
    hash_before: 0ca55c2c641de362c0dc0b682ebffbe56842183e
    hash_after: 0ca55c2c641de362c0dc0b682ebffbe56842183e
  - step: design/review
    hand: box fa49097ce66c · claude-code-remote · helper-4
    hash_before: 9c6d407f5dee5b289df025a62cc96d518cc2fa0d
    hash_after: 9c6d407f5dee5b289df025a62cc96d518cc2fa0d
---

# Ask

the tools the engine registers answer through the session

a hand writes a script where a dead tool stands, and the guidance points at nothing

- the patch tool and the note mint answer after a server restart
- a case covers a tool call meeting a server that restarts under it

# design

## draft

<!-- writes the approach the ask calls for -->

### approach

<!-- the approach here where it takes minutes, or a link to the design output where it takes a note -->

<!-- the form is text -->

- one reader filling the fields a session start fills, run where the box holds none
- `decide` runs it beside `freshens`, so the door and the registration read a full box
- cases driving a fresh box, the way a restart hands one over

**What stands.** `opensSession` fills the box at `session.start`, and a restart
builds a new box with none of it. The harness sends one `session.start` a
session, and the session runs on past a restart.

| what a session start fills | who reads it | what a fresh box holds |
|---|---|---|
| `box.schemas` | the mint spec, the mint, the write door | nothing, and the write door fills it itself |
| `box.tools` | the block naming what this box has | nothing |
| `box.specs` | the same block | nothing |
| `box.projections`, `box.sources` | the write door | nothing, and `freshens` fills them itself |
| the warm index | the search tools | a cold index |

**The fault.** `SPECS` in `src/bridge/tools.js` builds the mint spec off
`box.schemas`. A fresh box gives it no kinds, so the spec registers an empty
list of them and no call satisfies it. `mintedNote` then throws on
`schemas.get`, and the tool call answers an error.

The registration itself goes out. `decide` answers `register` where
`box.registered` stands false, and a fresh box stands false. The answer table
in [[spec/design_output/level0]] takes `register` on any event, so the road
holds. The tools come back named, and the mint comes back empty.

**The change.** One reader fills what a fresh box lacks, and `decide` runs it
ahead of the door.

| what changes | where |
|---|---|
| a reader filling `box.schemas`, `box.tools` and `box.specs` | `src/bridge/server.js` |
| `decide` calls it beside `freshens`, ahead of the door | the same file |
| `opensSession` calls it in place of the lines it holds | the same file |
| `surveyHere` leaves the module, so the reader reads the survey | `src/bridge/guidance.js` |

The reader reads the way `guidanceOf` does: it fills a field once and answers
it after. `box.specs` takes `specsOf(box)` there, so the block naming what this
box has reads a full list. The projections stay with `freshens`, which fills
them on a fresh box already. The warm index stays out, because a cold index
answers and warms itself.

**The cases.** Each drives a box holding no session start, the way a restart
hands one over.

- a `tool.call` on a fresh box registers the patch tool and the check tool
- the mint spec names every kind the schemas hold
- the mint tool answers a refusal on a fresh box, in place of throwing
- a second event registers nothing, because the first one registers
- the block naming what this box has reaches the session

**What this leaves.** A tool call landing inside the restart window meets no
server, and the bridgehead passes it through. That window belongs to
[[spec/tickets/the-bridge-says-it-falls]], which says the fall out loud. This
ticket covers the events after the server stands again.

## review

<!-- reads the approach against the ask -->

### verdict

<!-- pass or fail, with findings one a line -->

<!-- the form is verdict -->

pass

- the reader sits beside `freshens` in `decide`, ahead of the door. A restarted box fills before the first event.
- the fault reads true. `SPECS` hands `mintSpec` an empty `box.schemas`, and the kind enum registers empty. `mintedNote` then throws on `schemas.get`.
- the change table names `src/bridge/guidance.js`, where `surveyHere` stands unexported. It names the `box.specs` fill that `toolsText` reads.
- the projections stay with `freshens`, which fills them on a fresh box itself.
- the cases drive a `tool.call` on a fresh box, which the ask asks for. The mint case covers the throw.
- the scope call holds. The window with no server standing belongs to [[spec/tickets/the-bridge-says-it-falls]].
- `./RUNME.sh check` exits 0 on this branch. The retro stands absent, which a branch mid-ticket calls for.
- the draft touches the ticket file alone, so the diff stands inside the brief.
- for implement: `decide` builds `specsOf(box)` again in its registration branch. Answer `box.specs` there instead.
- for implement: the mint refuses an unknown kind, and writes a known one, once the schemas stand.

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

## reflect

<!-- names the class of error in the findings, and the fix for the class -->

### class

<!-- the class of error the findings describe, and the fix for the class -->

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

# verdict

<!-- reads every hunk against the ask and the approach -->

## read

<!-- every file you read, one a line -->

<!-- the form is files -->

## verdict

<!-- pass or fail, findings one a line -->

<!-- the form is verdict -->

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
