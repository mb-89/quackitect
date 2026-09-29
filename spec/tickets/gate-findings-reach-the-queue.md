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

A gate's findings reach the queue as children the group waits on, in one hand-back. Two faults stand between them today:

- a reject at a group's `accept` inserts `children-2`, which passes at once, since the reject mints no child. A second reject copies nothing, because the step before `accept` is itself a copy.
- `accept with points` mints each child with `todo: true`. The push door refuses that tag on a ticket of the group branch.

A gate that finds a fault then hands its fix to the queue, and the push lands with no manual step.

Without it, every reject or point costs a hand extra work. The hand mints tickets, takes a tag off each, and commits before the push.

- a case rejects a group's `accept` with findings, and reads a minted child and the group waiting on it
- a case accepts with points on a group, and reads each child minted with no `todo` tag
- `./RUNME.sh check` exits 0

# do

<!-- makes the change the ask names -->

## change

<!-- what you change, and what surprises you -->

<!-- the form is text -->

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
