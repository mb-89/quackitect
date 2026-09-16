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
---

# Ask

<!-- gain, as text: what is gained by doing it, and not only what it does -->
A fail's reason lands in the record as a YAML value every reader parses, so Vale reads the ticket after a review returns it.

<!-- breaks, as text: what breaks if it is never done -->
A finding carrying a colon and a space breaks the frontmatter. Vale then reads no file of the ticket, and the lint exits one over the tree. The check stays red until a hand quotes the record. The ticket door refuses that hand, because the record is the engine's. The group `the-bridgehead-installs-upstream` met it at its first review.

<!-- done_when, as list: one line each, decidable, naming the command that decides it -->
- the record writer in `src/scripts/pull.js` quotes a `why` value carrying a colon, a hash or a leading quote
- a unit test proves each of the three
- `./RUNME.sh lint` reads a ticket whose record carries such a reason, and names no YAML fault

# do

<!-- makes the change, with the test that covers it -->

## tests

<!-- the tests that cover the change, or the check where it touches no code -->

<!-- the form is command -->

    ./RUNME.sh branch test test/level0/quoted.test.js test/level0/group.test.js

## check

<!-- the check is green on the commit -->

<!-- the form is command -->

    ./RUNME.sh check

## says

<!-- what changes and why, for a reader who was not there -->

<!-- the form is text -->

Every value the record writer puts on a row now passes through `quoted`. It wraps a value in double quotes where a YAML reader takes it for a mapping, a comment, a collection or an anchor. It escapes the backslash and the quote inside. A reviewer's finding with a colon in it lands whole, and the frontmatter still reads. The ask names the `why` field, and the same fault reaches every other value, so the writer quotes them all.

## checked

<!-- one line per item of the checklist, on how you take it into account -->

<!-- the form is checklist -->

- the change follows the ask, and reaches every value the record holds
- the cleanup the change reveals is in the change. The lint reads the ticket that met this first

# Discussion

<!-- what anybody adds, at any time, on this ticket -->

Nothing stands here yet.
