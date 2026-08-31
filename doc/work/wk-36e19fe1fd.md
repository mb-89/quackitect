---
id: wk-36e19fe1fd
seq: "39"
type: work
title: a child draws nested
status: open
assignee: main
scope: single-step
traced: true
parent: wk-66a28ca311
minted_by: person
---

## detail

A sub-token draws under its parent, nested and collapsible, like a group.

WHAT THE OWNER SEES TODAY: a sub-token sits in the list beside every other
token, so the breakdown of a piece of work is invisible and the parent looks
like one more row.

WHY IT IS NOT A GROUPING. The editor draws groups from a property's value: every
row with bucket later goes under later. A parent is not a value, it is a link
from one row to another, and a parent is itself a row. So this is a tree rather
than a grouping, and grouping by parent would draw the parent twice, once as a
heading and once as a row somewhere else.

WHAT IS ALREADY THERE: the renderer draws nested groups with a depth and a
fold, and it remembers which are folded across a change in the data. That is
the half that is easy.

WHAT IS NOT: the engine answers a flat list of groups and rows. It has to
answer a row that carries its children, and the fold has to be remembered by
the token's id rather than by a group name, because two tokens can share a
title and never share an id.

A CHILD IS DRAWN ONCE. A sub-token that also matches a pinned group would
otherwise appear under the pin and under its parent, and the page stops being a
partition.

CHECKED BY DRIVING THE PAGE, not by reading the markup. A parent with two
children renders one row with two under it, folding the parent hides both, and
the fold survives new data arriving.

