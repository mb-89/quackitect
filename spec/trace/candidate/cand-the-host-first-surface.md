---
minted_in: i4-the-panel-round-the-archived-iteration-b
id: cand-the-host-first-surface
type: "[[candidate]]"
name: "The host-first surface"
statement: "one surface survives and most of it is the editor's own widgets"
picks:
  - "[[opt-one-webview-view-in-a-container-is-the-only-surface]]"
  - "[[opt-the-host-tree-view-replaces-the-custom-drawing]]"
---

## What it leans on

THE PUBLISHER'S OWN UX GUIDANCE, read as primary rather than summarised.

THE OWNER'S RULING of 2026-08-23 preferring a native control wherever one
fits.

THE UNPROBED ASSUMPTION THAT THE WALK IS TREE-SHAPED ENOUGH. Nobody has taken
the current drawing and asked which parts survive as tree items, and a script
cannot answer it.

## Why this one

THE PUBLISHER SAYS SO ABOUT ITS OWN SURFACES: webviews "should only be used if
you absolutely need them", and "Repeat existing functionality" sits under
Don't.

THE OWNER RULED THE SAME WAY INDEPENDENTLY on 2026-08-23: "For every editor we
have, we check if there is a native VS Code solution for it. I would always
prefer that."

TWO SOURCES REACHING ONE CONCLUSION FROM DIFFERENT DIRECTIONS is the strongest
support any candidate here has.

## How it works

THE STATES BECOME TREE ITEMS the host draws, with label, icon and description
carrying position, colour and the reason a state is grey.

WHAT STAYS CUSTOM IS THE FORM, which is a genuine gap in the host's
vocabulary, and whatever graph-shaped parts survive the move.

## The seams

THERE ARE TWO SEAMS HERE RATHER THAN ONE, which is this candidate's real cost.

THE FIRST IS BETWEEN THE HOST'S WIDGETS AND OURS. States live in the host's
tree; the form lives in our view. A person moves between them and must not
feel the join, which is a design problem rather than a wiring one.

THE SECOND IS THE HOST'S OWN ITEM MODEL. What a tree item can carry is fixed
by the editor, so anything the walk needs to show that does not fit label,
icon and description has nowhere to go.

SELECTION IS THE AWKWARD PART. Selecting a state in the tree and selecting one
in the drawing are the same act to a person and two different mechanisms
underneath.

## What it costs

A TREE IS NOT A GRAPH. Branches, a route line and a target chip are not a
hierarchy, and this candidate pays its price exactly where the drawing is most
useful.

## The evidence against it

THE OWNER'S OWN FIELD EXPERIENCE: "My experience is this hasn't worked so
far." That is recorded here rather than in a footnote, because a candidate
that ignores it will be chosen once and regretted twice.

IT IS ALSO THE ONLY CANDIDATE WHOSE FEASIBILITY IS UNPROBED. Whether the walk
is tree-shaped enough has never been checked, and a script cannot check it.
