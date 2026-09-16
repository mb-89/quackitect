---
kind: [[ticket]]
state: closed
urgency: soon
steps:
  - name: do
    does: makes the change the ask names
    to: retro
    evidence:
      - name: change
        form: text
        says: what you change, and what surprises you
step: do
process: [[trivial]]
group: a-group-is-a-branch
record:
  - step: do
    hand: box b9be613824b0
    hash_before: cd3a1746c3e46e9987392c0d5397267ca8357c90
    hash_after: 07e76fcb4d4de2f641b1ae92711360080ac19e34
reason: done
---

# Ask

`branch list` reads a group's tickets off the branch that holds them, so a person on trunk sees the loose ones and nothing else.

Done is a row per ticket of the held group, under the group's row, drawn off the branch tip that `list` already fetches.

# do

<!-- makes the change the ask names -->

## change

`list` draws a row per ticket naming the group, indented under the group's row,
off `origin/<branch>` it already fetches. `childRows` reads the branch tip
through `ticketsOn`, keeps the tickets whose `group` field names the group, and
says the name, `ticket`, the state and the step. A brief draws none, because a
brief names no tickets. [[spec/design_output/work#a-ticket-under-its-group]]
holds the shape, and two cases in `test/level0/work.test.js` hold the code.

Two things surprise me. The first is that `ticketsOn` already takes any ref, so
the whole read costs one call and no new door. The second is that the step, not
the urgency, is what a child row wants. The group row answers urgency once, and
a reader under it asks where each ticket stands.

# Discussion

The branch is the filter, and today `list` reads a group's own note and stops there. A reader wanting the tickets inside it runs `git show` by hand.

This waits on the pull, because a ticket at an agent step is what the row has to say.
