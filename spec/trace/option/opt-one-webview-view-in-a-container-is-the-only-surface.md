---
minted_in: i4-the-panel-round-the-archived-iteration-b
id: opt-one-webview-view-in-a-container-is-the-only-surface
type: "[[option]]"
statement: the walk is shown on exactly one surface, a webview view living in an editor container, and no second rendering of the same state exists anywhere
cluster: the-account
question: how the walk is shown to a person
found_by: prior-art
source: VS Code Extension API, UX Guidelines / Webviews, https://code.visualstudio.com/api/ux-guidelines/webviews, page dated 8/19/2026
---

## Mechanism

ONE SURFACE, PLACED IN A CONTAINER THE EDITOR OWNS. The publisher's own
guidance names this shape: "You can also place webviews into any view
container (sidebar or panel) and these elements are called webview views. The
same webview guidance applies to webview views."

THE SECOND RENDERING IS NOT REDUCED, IT IS REMOVED. There is no fallback page,
no standalone window and no separate document. Whatever a person needs to see
is drawn by the one view or it is not drawn.

## Why the prior art points here

TWO LINES OF THE PUBLISHER'S OWN GUIDANCE carry it, and both are in the Don't
list or the opening paragraph.

- "webviews should only be used if you absolutely need them."
- Don't "Repeat existing functionality (Welcome page, Settings, configuration,
  etc.)"

THE SECOND IS THE SINGLE-POINT-OF-TRUTH RULE, written by the host vendor about
its own surfaces. A second rendering of state the editor can already show is
the repetition that line forbids.

THE FIRST IS A COST ARGUMENT AND IT CUTS BOTH WAYS HERE. It says a webview is
expensive enough that one needs justifying. It does not say two are twice as
expensive; it says the second one has to justify itself independently, and
nobody has ever tried.

## What it buys

WHAT A PERSON SEES AND WHAT AN AGENT ARGUES FROM BECOME THE SAME OBJECT. The
failure this option removes is not drift between two renderings. It is an
agent editing a surface nobody reads, then reasoning from it while the person
looks at a different one.

## What it costs

EVERY CAPABILITY THE REMOVED SURFACE HAD MUST ARRIVE OR BE DROPPED ON PURPOSE.
That is a per-capability decision and not a migration. Where the host bounds
what the surviving view may render, a capability may be undeliverable rather
than merely unbuilt.

## Not established

WHETHER THE HOST BOUNDS ANYTHING HERE. No limit was found, and none was
looked for beyond the guidance page. That gap is carried as an assumption
rather than as a finding.
