---
minted_in: i4-the-panel-round-the-archived-iteration-b
id: opt-the-host-tree-view-replaces-the-custom-drawing
type: "[[option]]"
statement: the custom drawing is trimmed away and the editor's own tree view shows where the walk stands, so the surface we maintain shrinks to the parts the host has no widget for
cluster: the-account
question: which widgets are ours to draw
found_by: without
source: "VS Code Extension API, UX Guidelines / Webviews, https://code.visualstudio.com/api/ux-guidelines/webviews — Don't: Repeat existing functionality"
---

## Mechanism

TRIM THE CUSTOM WIDGET AND ASK WHO DOES ITS JOB. The answer is the host. An
editor tree view already draws a labelled hierarchy with icons, colours,
selection, context menus and keyboard navigation, and it comes themed and
accessible without being asked.

THE STATES BECOME TREE ITEMS. Position, colour and the reason a state is grey
are all label, icon and description on an item the host draws.

WHAT STAYS CUSTOM IS ONLY WHAT THE HOST HAS NO WIDGET FOR. A form with mixed
editors is a real gap in the host's vocabulary. A list of states with icons
is not.

## Why trimming points here

THE PUBLISHER'S OWN GUIDANCE LISTS "Repeat existing functionality" UNDER DON'T,
and a custom-drawn list of items with icons is that repetition.

THE OWNER RULED THE SAME WAY on 2026-08-23, before seeing this option: "For
every editor we have, we check if there is a native VS Code solution for it. I
would always prefer that."

## What it buys

EVERY PIXEL THE HOST DRAWS IS A PIXEL NOBODY HERE MAINTAINS, themes, or makes
accessible. Contrast, ARIA labels and keyboard navigation arrive for free and
stay correct when the host changes.

IT SHRINKS THE SURFACE RATHER THAN MOVING IT. The other options make one
surface out of two. This one makes the remaining surface smaller.

## What it costs

A TREE IS NOT A GRAPH. A walk with branches, a route line and a target chip is
not a hierarchy, and forcing it into one loses the shape that makes the
drawing worth looking at.

THE COST IS THEREFORE PAID IN EXPRESSIVENESS, and it is paid exactly where the
drawing is most useful.

## Not established

WHETHER THE WALK IS TREE-SHAPED ENOUGH. Nobody has taken the current drawing
and asked which of its parts survive as tree items. That is a reading exercise
over one file and it has not been done.

THE OWNER'S OWN CAVEAT STANDS AGAINST IT: "My experience is this hasn't worked
so far." Recorded here because an option that ignores the owner's field
experience is one that gets chosen once and regretted twice.
