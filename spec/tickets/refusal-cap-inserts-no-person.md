---
kind: [[ticket]]
state: closed
group: the-person-step-holds
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: anyone
    by: anyone
    to: retro
    input: ask
    reads: [[spec/guidance/working]]
    needs: ["work test"]
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
process_hash: 568f402efe3adab7
record:
  - step: do
    hand: box ca870d4f20f4 · claude-code-remote
    hash_before: c04d4927859ef560adfd2e70716472216229dddc
    hash_after: c04d4927859ef560adfd2e70716472216229dddc
    answered:
      - name: tests
        exit: 0
        said: green, 17 test(s) pass in 2 file(s)
      - name: check
        exit: 0
        said: 87 stand at warning, which the panel draws and check allows.
reason: done
---

# Ask

The pull inserts no person step. A hand-back that meets the refusal cap fails the leaf back with the findings. A step that fails back past the cap drops its hold and answers wait. The owner rules that no step waits for a person on a box. So the escalation verb alone puts a person step in, and only where a person sits beside the box. Done is the two caps in the config gone or renamed, the two insertions in the pull replaced, and the tests reading the fail-back.

# do

<!-- makes the change, with the test that covers it -->

## tests

    ./RUNME.sh branch test

<!-- the form is command -->

## check

    ./RUNME.sh check

<!-- the form is command -->

## says

The pull inserts no step of its own. Each count now answers on its own road, and the escalation verb is the one road a step goes in by.

| the count, renamed | what the pull did | what it does now |
|---|---|---|
| `work.refusalsBeforeFail` | inserted a settle step before the held leaf | fails the leaf back, carrying the count and the first finding |
| `work.failsBeforeWait` | inserted a settle step before the target | drops the hold and answers `wait` |

The settle step went in where two hands disagreed. Past the split cap it turned into a person step, which on a box waits for a person nobody sends.

- the fail-back puts the leaf in front of the next hand, with the reason in the record
- the wait leaves the target open, so another hand takes it where it stands
- `withPersonStep` stays, because the escalation verb the design output names is its one caller

The design output owns these facts. The chapters The fail, The hand-back refused and A count inserts no step read the new roads. The config schema carries the new keys with their help, and the projection writes the commands off it.

<!-- the form is text -->

## checked

- the ask names the caps, the insertions and the tests, and the change touches those and the notes owning them
- the settle inserter is the cleanup the change reveals, and it goes in the change, because nothing calls it now
- each renamed key stands in the config schema, and the design output points at it

<!-- the form is checklist -->

# Discussion

The first run of the pull put a person step before the verdict of agent-pulls-ticket after five refusals. Every refusal came from an engine fault. Until this lands, a person takes a standing person step out of a route by hand.
