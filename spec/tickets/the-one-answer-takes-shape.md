---
kind: [[ticket]]
state: open
urgency: now
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
group: the-warnings-feed-a-refactorer
step: do
record:
  - step: answer
    hand: box dd2a59294365 · claude-code-remote · the owner says so
    hash_before: 5034b47e9a02043f4fbb86c28f2f60cc06a1cc19
    hash_after: 5034b47e9a02043f4fbb86c28f2f60cc06a1cc19
---

# Ask

<!-- question, as text: what a person decides, and the ticket the question comes from -->

[[spec/tickets/one-function-answers-the-hand]] asks for one function answering whether a hand works a leaf. Two reviews returned the approach, and the engine inserted a person step. The question under both returns is the same: how far does the one answer reach?

| way | what it costs |
|---|---|
| the function answers `by` alone | the door reads no `ownerSays` and no `atRetro`, so it refuses a leaf the pull admits |
| the function answers the whole hand rule | the door reads the pull's command line and every ticket in the group, which it holds nowhere |
| the door takes the answer the pull writes | the hold carries it, and a write outside a pull meets no rule |

The reviews name the wall each way meets:

- `ownerSays` comes off `--owner-says` on the pull's command line, and nothing under `src/bridge` reads it
- `atRetro` reads every ticket in the group, and the door holds one file
- a third site, `handFaults` in `src/scripts/pull-chapter.js`, holds the rule inline

<!-- waits, as list: one line each, naming what stands still until the answer lands -->

- [[spec/tickets/one-function-answers-the-hand]] closes became, and its design waits on this
- the write door keeps refusing on the engine's fields alone, so an agent writes a person's chapter

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

- the answer names which of the three ways stands, and what the door reads for it
- `./RUNME.sh check` answers 0 on the commit carrying the change

# answer

<!-- answers the question the ask carries -->

## answer

<!-- the answer, which the step behind this one reads -->

<!-- the form is text -->

The function answers the leaf's `by` alone, and the door takes the answer the pull writes into the hold. So:

- `writesHere(leaf, hand)` reads `by`, and lives in `.claude/skills/level0/lib/ticket.js`
- the pull calls it at three sites, and each keeps the fields its caller reads
- the write door reads the hold, which names the leaf and the hand that took it

**Why the door reads the hold.** The door holds one file and one moment. `ownerSays` comes off the pull's command line, and `atRetro` reads every ticket in the group. A door working either out for itself reads what it cannot see, and the pull already knows both.

| what the hold carries today | what it gains |
|---|---|
| the ticket, its path, the step, the hand | the leaf's `by`, and whether that hand writes there |

So the door compares the write's chapter against the hold's step, and refuses a chapter the hold says this hand writes nowhere. A write with no hold standing meets no rule, which is the case a desk already lives with.

**The three sites.** Each calls the one function, and each keeps what it answers today.

| caller | where | what it keeps |
|---|---|---|
| `admits` | `src/scripts/pull-hand.js` | the `person` and `other` fields the hand-out reads |
| `takeable` | the same file | the empty string for a ticket this hand works nowhere |
| `handFaults` | `src/scripts/pull-chapter.js` | its own findings, with the `by` one off the function |

`needs` and `excludes` stay where they stand, because one reads the box's verbs and the other reads the record.

**What the leaf walk does.** `leafOf` moves beside the function, because a plugin imports nothing past its own root. Its name clashes with one in the plugin's voice module, so the moved one reads `leafAt`.

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

- [[spec/tickets/one-function-answers-the-hand]] hands this over at `design/person-1`, which waits for a person.
  - design/review failed back 2 times: Say where the door reads `ownerSays`, because the flag stands on the pull's command line.
  - Say where the door reads `atRetro`, because that answer reads every ticket in the group.
  - `handFaults` holds the `by: person` rule inline, and the caller table leaves that site out.
  - `schemaDoor` stands unexported, so say which exported function the case drives.
  - The named case file drives `wholeAfter` alone, and the ticket cases stand beside `ticketFaults`.
  - The move takes `walkOf` too, because `leafOf` calls it.
  - `entriesIn` stands inside the plugin already, so the move leaves it where it stands.
  - `leafOf` names another function in the plugin's voice module, so name the moved one apart.
  - `./RUNME.sh check` answers 0 on this commit.
