---
kind: [[ticket]]
state: closed
urgency: now
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: anyone
    by: anyone
    to: retro
    input: ask
    reads: [[spec/guidance/working]]
    needs: ["work test"]
    checklist: ["the change follows the ask, or the discussion says why it departs", "the cleanup the change reveals is in the change, or is a note of its own"]
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
process_hash: 62642eaf8f9c9c53
step: do
record:
  - step: do
    hand: box d42624a67d18a8
    hash_before: 0c5f3f635aa9640059f96a3b51a5648df24b998a
    hash_after: 3587acd3594b75bba1a4b552f93db18ffc82ce53
    answered:
      - name: tests
        exit: 0
        said: green, 22 test(s) pass in 2 file(s)
      - name: check
        exit: 0
        said: 64 stand at warning, which the panel draws and check allows.
reason: done
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
An Ask meets the voice rules before the engine takes it over, so the lint over the tree stays green while the ticket runs.

<!-- breaks, as text: what breaks if it is never done -->
An Ask minted with a tag, a bare path or a passive line opens as it stands. The ticket door then refuses every hand there, because the Ask is the engine's once the ticket opens. So the lint exits one on lines nobody can fix, and a hand names the lint's paths at the check instead. The group `the-bridgehead-installs-upstream` met it at its first write to the ticket.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
- `./RUNME.sh ticket open <ticket>` runs the voice rules over the Ask, and refuses one that breaks a rule
- a unit test hands the verb an Ask with a bare tag and reads the refusal
- the child `bridgehead-installs-upstream` lints clean once a person rewrites its Ask, and `./RUNME.sh lint` says so

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

    ./RUNME.sh branch test test/level0/ask-lint.test.js test/level0/ticket-verb.test.js

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

The open verb runs the voice rules over the Ask before it writes the open state. An Ask breaking a rule at the error level refuses the open, and the refusal names the line and the rule. The draft stands as it is until a person rewrites it. A warning leaves the open alone, and a box with no Vale opens as it stands. A new module holds the run, so the ticket module stays one topic.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change follows the ask. The child ticket it names lints clean at the error level now
- the cleanup the change reveals is in the change. The Vale run stands in a module of its own

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

Nothing stands here yet.
