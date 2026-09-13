---
kind: [[ticket]]
state: open
urgency: soon
steps:
  - name: do
    does: makes the change the ask names
    evidence:
      - name: change
        form: text
        says: what you change, and what surprises you
step: do
process: [[trivial]]
group: a-group-is-a-branch
---

# Ask

`work list` reads a group's tickets off the branch that holds them, so a person on trunk sees the loose ones and nothing else.

Done is a row per ticket of the held group, under the group's row, drawn off the branch tip that `list` already fetches.

# do

<!-- makes the change the ask names -->

## change

<!-- what you change, and what surprises you -->

<!-- the form is text -->

# Discussion

The branch is the filter, and today `list` reads a group's own note and stops there. A reader wanting the tickets inside it runs `git show` by hand.

This waits on the pull, because a ticket at an agent step is what the row has to say.
