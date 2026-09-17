---
kind: [[ticket]]
state: open
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
step: do
---

# Ask

A branch a box works stands free again once the box leaves it. The cloud then takes every branch a box puts down, and the queue runs dry only where the work runs out.

`branch take` claims a branch by writing a record entry with `hash_before`, and the claim stands for the session. `branch done` and `branch release` close it.

A box whose session ends with work still open closes neither, so the claim stands for good:

| what the box does | what it leaves |
|---|---|
| takes the branch | a claim with `hash_before` |
| works its children well | commits, and the claim still open |
| runs out of session | the claim, standing for good |

Two branches carry such a claim today. One box took its child through four steps and pushed 820 lines. Neither box could run `branch done`, because that verb refuses a group whose child stands at a step a hand can take.

The tree measures the age already, and the pieces stand in three places:

| what | where |
|---|---|
| the span a claim goes stale past | `STALE` in `src/scripts/group.js`, and `work.staleAfter` over it |
| the age of a claim | `tipAge` in `src/scripts/work.js` |
| the reading a person sees | `branch list`, which says `held 1d. Release it, take it over, or close it.` |

`freeIn` reads none of the three. It hands out a branch at `todo` alone, so a stale claim reaches no box. `cloud trigger` then answers that no branch stands free, and the owner reads an empty cloud while two branches carry work.

- `freeIn` hands out a branch whose claim stands older than the span
- the stale reading stands in one place, and the list and the take both read it
- a case drives the take over a fresh claim, and reads the branch passed over
- a case drives the take over a stale claim, and reads the branch handed out
- `./RUNME.sh cloud trigger` names a branch held past the span
- `./RUNME.sh check` answers 0

# do

<!-- makes the change, with the test that covers it -->

## tests

    ./RUNME.sh branch test test/level0/stand.test.js test/level0/work.test.js

## check

    ./RUNME.sh check

## says

A claim older than the span comes back to the queue, so a box that runs out of session strands no branch.

`src/scripts/stand.js` holds what stands free, and the stale reading stands in one place there:

| what | what it answers |
|---|---|
| `staleSpan` | the span, out of `work.staleAfter`, and `STALE` where the config says nothing |
| `staleClaim` | the age of a claim, and whether it stands past the span |
| `freeIn` | a branch at `todo`, and a branch whose claim goes stale |

`rowOf` in the work verbs read the span and the age itself. It reads `staleClaim` now, so the list and the take answer one reading.

`freeIn` takes the box and the clock. A caller handing neither reads no claim as stale, so `freeNow` keeps its old answer, and `trigger` hands the clock in.

The split the write door asks for lands with it:

| what moves | where it lands |
|---|---|
| `tipAge`, `freeIn`, `freeNow`, `trigger` | `src/scripts/stand.js` |
| the cases covering them | `test/level0/stand.test.js` |

Seven cases stand, and each drives one reading:

| the case | what it reads |
|---|---|
| the span, three ways | `work.staleAfter`, the default, and a value nobody parses |
| a fresh claim, and a stale one | the age, and the answer over the span |
| the take over each | the fresh one passed over, and the stale one handed out |
| a stale claim a dependency holds | held, stale or no |
| a take carrying no clock | no claim reads stale |

## checked

- the change follows the ask. `freeIn` reads the stale claim, and the list and the take share one reading.
- the cleanup stands in the change. `rowOf` gives up its own span and age, so the tree holds one.
- every fact stands in one place. `staleSpan` and `staleClaim` answer for both callers.

# Discussion

The owner reads an empty cloud while two branches carry work, and asks what stands in the way. A first reading blames a box dying mid-step. The owner refuses that reading, and the history bears the owner out: each box ran on past the sync and worked its children for hours.

So no box dies here, and no box meets a person step. A box takes a branch, works it, and runs out of session with the claim still open.

Two readings went before this one:

| the reading | what stood against it |
|---|---|
| a box dies mid-step | the history: each box worked its children for hours after the take |
| the claim is the group's `sync` step | `take` runs the sync itself, so closing it there closes the claim the take writes |

A standing case caught the second reading, and the fix went back. `./RUNME.sh branch release <name>` clears one by hand. It clears the mark, and the cause stands.
