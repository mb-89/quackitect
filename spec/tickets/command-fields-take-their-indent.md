---
kind: [[ticket]]
state: draft
steps:
  - name: do
    does: makes the change the ask names
    to: retro
    evidence:
      - name: change
        form: text
        says: what you change, and what surprises you
process: [[spec/processes/standard]]
group: the-engine-fixes-its-faults
---

# Ask

`carriedIn` in `.claude/skills/level0/lib/tested.js` reads a test off a command line indented four spaces. A hand-back passing a command field with no indent writes it bare, so the commit hook finds no carried test, and it refuses code whose test the ticket names.

The hand-back writes a command field in the indented form itself, whatever indent the hand passes.

The hook then reads the tests a ticket carries, and no hand learns the indent by a refusal.

Without it, every hand-back of code meets the refusal once, and a handover has to carry the indent as a rule.

- a case hands back a command field with no indent, and reads it written indented four spaces
- a case commits code whose test only the ticket's command field names, and reads the hook pass
- `./RUNME.sh check` exits 0

# do

<!-- makes the change the ask names -->

## change

<!-- what you change, and what surprises you -->

<!-- the form is text -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
