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
    hand: box dd2a59294365 · claude-code-remote
    hash_before: 039f29da1acb76ddd82b6e95d5415fd2c916016a
    hash_after: 039f29da1acb76ddd82b6e95d5415fd2c916016a
---

# Ask

<!-- question, as text: what a person decides, and the ticket the question comes from -->

[[spec/tickets/the-hook-spawns-a-refactorer]] asks a session past the number to spawn a refactoring hand and carry on. Two reviews returned the approach on the same wall, so the engine inserted a person step.

The wall: the stop road starts no hand, and the spawn road hands no guidance.

| what the ask wants | what the road holds |
|---|---|
| the vote holds the turn open, and a hand starts beside it | `seen` takes the `spawn` branch before it reads `result`, so one answer carries one of the two |
| the hand costs the work no turns | `spawns` awaits the call, so the session waits on the hand |
| the hand reads a note the working hand reads nowhere | `onAgentSpawn` reads no kind, and the review spawn names `general-purpose` too |
| a note says who reads it | no code reads a note's `scope`, though the schema wants one |

So the owner decides three things:

- which door starts the hand, where the stop door answers a vote alone
- whether a spawn the session waits on still answers the ask, or a second road starts one it walks past
- which field a spawn carries so a layer reaches that hand, where `subagentType` names many

One name clashes beside all this: `refactor.mostInARow` counts hands, and `stop.mostInARow` counts turns. The answer names the new key apart.

<!-- waits, as list: one line each, naming what stands still until the answer lands -->

- [[spec/tickets/the-hook-spawns-a-refactorer]] closes became, and its implement waits on this
- [[spec/tickets/one-list-holds-the-warnings]] names the list this hand drains, and the two answer together

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->

- the answer names the door starting the hand, and what the session does while it runs
- the answer names the field a spawn carries, and the key the count takes
- `./RUNME.sh check` answers 0 on the commit carrying the change

# answer

<!-- answers the question the ask carries -->

## answer

<!-- the answer, which the step behind this one reads -->

<!-- the form is text -->

The stop door starts the hand, the session waits on it, and the spawn carries its own kind. So:

| the question | the answer |
|---|---|
| which door starts the hand | the stop door, through a second answer beside the vote |
| what the session does while it runs | it waits, and the ask's "costs no turns" reads as costs no turn of its own |
| what field a layer lands on | `kind`, which the spawn carries beside `subagentType` |
| what the count takes for a name | `refactor.mostAtOnce`, which counts hands |

**Why the stop door starts it.** `seen` takes the `spawn` branch before it reads `result`, so one answer carries one of the two.

- the door answers the vote's block, and a second call starts the hand
- the hook already runs two calls in a turn, so the road stands

**Why the session waits.** `spawns` awaits the call, and unpicking that reaches past this ask. The gain the ask names holds anyway.

| what the ask wants | what this gives |
|---|---|
| the cleaning costs the work no turns | the work spends no turn choosing what to clean, and none cleaning it |
| the session carries on | it carries on the moment the hand lands, inside one turn |
| the wait goes | a later ticket takes it off, where the owner wants it off |

**Why a field and no kind guess.** `onAgentSpawn` reads the spawn, and the review spawn names `general-purpose` too. So the refactoring spawn sets `kind: "refactor"`, and the layer lands on that. A spawn naming no kind takes the helper layer, as today.

**What reads a note's scope.** `guidanceHere` starts reading it, and builds one layer a kind. A note naming no scope reaches every layer, which is what the notes do today.

**The count.** `stop.mostInARow` counts turns, so the new key reads `refactor.mostAtOnce` and counts hands. Two names, two things.

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

- [[spec/tickets/the-hook-spawns-a-refactorer]] hands this over at `design/person-1`, which waits for a person.
  - design/review failed back 2 times. One answer leaves the stop door: `seen` takes the `spawn` branch, dropping `result`.
  - So the `continue` side hands back no block, and the turn ends where the rule holds it open.
  - `spawns` awaits `$.agent.spawn`, so the session waits on the hand the ask says costs no turns.
  - Name the door that starts the hand beside the stop door, since one answer carries both nowhere.
  - `onAgentSpawn` reads no kind, and the review spawn carries `subagentType` `general-purpose` too.
  - Name the field the refactoring spawn sets, so the refactor layer reaches that hand alone.
  - No code reads a note's `scope` today, so say that `guidanceHere` starts reading it.
  - `refactor.mostInARow` counts hands and `stop.mostInARow` counts turns, so name the new key apart.
  - `./RUNME.sh check` answers 1, on warnings standing across the tree before this branch.
  - The git source, the successor pointer and the note's `scope` answer the earlier findings.
  - The stop rule, the four keys, the flag and the file the hand takes answer the rest of the ask.
