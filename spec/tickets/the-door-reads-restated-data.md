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

The write door refuses prose that says again what the structured data beside it holds. It refuses a count spelled in words the way it refuses a digit. Today a group's ask names its children, which stand under it already, and a count as four passes the digit rule. Done when a group's ask naming a child comes back refused with the rule's name, and a count in words meets DigitInProse. A case proves each.

# do

<!-- makes the change, with the test that covers it -->

## tests

```
node --test test/level0/ticket.test.js test/level0/write.test.js test/contract/vale.test.js
```

## check

```
./RUNME.sh check
```

## says

The ticket door gains a rule, `Ticket.restated`. A group's ask naming one of its children comes back refused, because the children stand under the group already. The write door reads the children off the work root, the tickets naming the group under `group`. The digit rule, `DigitInProse`, now reads a count spelled in words before a plural the way it reads a digit. The count rule that watched sentence openings alone folds into it, so one rule owns the count.

## checked

- the change follows the ask: the refusal names its rule, and a count in words meets the digit rule
- the cleanup is in the change: the sentence-opening count rule goes, and the digit rule carries its message
- every fact stands in one place: the work note names the refusal, and the digit rule says what it counts

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
