---
id: template-morph-box
statement: The morphological box — clusters down the side, their options across, and a curve through one option per cluster is one candidate.
editor: morph-box
resolves: artifact
line_pattern: ^\| .+ \|
line_help: one row per candidate; draw it on the chart rather than typing it
---

# morph-box

Zwicky's box, drawn. The ROWS are the function clusters. The CELLS in a row are
the options that serve that cluster. A CURVE through one cell per row is one
candidate architecture.

## Nothing here is typed in

The grid is DERIVED from the option nodes the seven finders minted. Each option
already carries the cluster it serves, its statement, which finder found it and
whether it was pruned — so there is no table to fill and no second copy to
drift.

An option is changed in its own note. The chart shows it at the next look.

## What the field declares

```
- name: chart
  template: morph-box
```

Nothing else. The rows, the cells and the lines all come from the register, so
a chart has no arguments to get wrong.

## Drawing a candidate

Hold SHIFT and click one cell per row. Each click adds a waypoint; clicking a
second cell in a row you already visited moves that waypoint rather than adding
one, because a candidate takes exactly one option per cluster.

Release shift to keep the line. Escape abandons it.

A drawn dot can be DRAGGED to another cell in its own row. Across rows it would
mean something else entirely, so it is refused rather than guessed at.

## The lines join dots, not cells

One cell can sit on four different candidates, so a cell cannot carry a colour.

Every cell holds a fixed row of dot SLOTS, one per candidate. A candidate's dot
always sits in its own slot, wherever it goes, and the curve joins those dots.
So four candidates through one cell show four dots side by side, and two lines
through the same cells stay apart instead of overlapping exactly.

The slots WRAP inside the cell. Two dozen candidates give a second and third
row of dots rather than a cell that grows sideways.

## The colours

Hue-spaced across the whole wheel and re-spaced on every change — the rule
pyqtgraph's `intColor(index, hues=n)` uses. Two lines land opposite each other;
twenty land close but still ordered.

Adding a line re-cuts the wheel, so every colour moves. That is why no colour
is ever stored on a node.

Each line also carries its NAME at its first dot, so the chart reads without
colour vision.

## A line is a candidate only when it is complete

One option per cluster. A line that has not visited every row is drawn DASHED
and says how many rows are left.

It is kept rather than thrown away — a person part-way through a thought is the
normal case — but it does not become a [[candidate]] node until it is whole.

## Pruning

An option struck out of the chart still SHOWS, greyed and struck through, so a
reader can see what was considered. No curve may pass through it, and a curve
that already did loses that waypoint and goes back to unfinished.

A strike asks for its reason. An option struck without one gets reinvented next
iteration by somebody who had no way to know it was considered.

## Stored form

A markdown table, so the file stays readable to somebody who never opens the
form. One row per candidate, in drawing order — and that order is the palette
order, so reordering the file recolours the chart.

```
| candidate | name | what it is | visits |
| --- | --- | --- | --- |
| [[cand-1-thin-client]] | Thin client | every decision on the server | [[opt-proxy]] · [[opt-blob]] |
```

The stored copy is a RENDERING. It is rebuilt from the nodes on every look, so
an edit made in a candidate's own note wins over whatever the file holds.
