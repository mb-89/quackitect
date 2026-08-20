---
id: template-compare-card
statement: One pair at a time — the engine asks, you answer, the answer lands on the node and the next pair comes up.
editor: compare-card
resolves: artifact
line_pattern: ^\| .+ \|
line_help: "THE ANSWER LANDS ON THE NODE, not in this table: write the verdict into the frontmatter key named by `writes` on the item it is about, e.g. `weighs_against:` with a line `- <other-id> >` meaning THIS item matters more. This table is the rendering, rebuilt from the nodes on every look, and its columns are `| a | verdict | b |` with the verdict BETWEEN the two items. Editing the table alone changes nothing."
---

# compare-card

A long table nobody fills becomes a short question anybody answers.

The engine holds a set. It puts up two of them, you say which matters more,
and it writes that on the node. Then the next pair.

## Why a card and not a table

A hundred rows of pairwise cells is a form people close. One pair with two
buttons is a form people finish on a train.

The engine also gets to choose the ORDER. It asks the pair that teaches it
most, and it never asks a pair your earlier answers already settled.

## What the field declares

```
- name: comparisons
  template: compare-card
  relation: order
  items:
    - $criterion_axes
  writes: weighs_against
```

- `relation` — `order` or `equivalence`. It decides what may be inferred.
- `items` — the set to walk.
- `writes` — the frontmatter key each answer lands in.
- `reason` — an optional second key, for a card that also wants a sentence.

## The two relations

- `order` — which matters more. Transitive, so a beats b and b beats c
  settles a against c.
- `equivalence` — are these the same thing. Only positives spread; "not the
  same" says nothing about a third item.

## You may stop anywhere

Every answer is written the moment you give it. Close the panel at pair nine
of sixty and come back next week — the walk rebuilds from what is on the
nodes, so it resumes exactly there.

There is no draft and nothing to save.

## The counter goes up sometimes

It shows answered and an ESTIMATE of what is left. The estimate is what the
walk has cost so far, projected over the items still unplaced.

A run of surprising answers makes the walk cost more, so the number rises.
That is the counter being honest about a cost that depends on answers nobody
has given yet.

## Stored form

A markdown table, so the file stays readable to somebody who never opens the
card.

```
| a | verdict | b |
| --- | --- | --- |
| [[req-lane-is-the-only-door]] | > | [[req-every-call-logged]] |
```

The stored copy is a RENDERING. The nodes are the truth, and the table is
rebuilt from them on every look.
