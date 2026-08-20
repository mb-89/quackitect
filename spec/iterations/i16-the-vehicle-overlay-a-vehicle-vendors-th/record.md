---
id: i16-the-vehicle-overlay-a-vehicle-vendors-th
status: shipped
closed: 2026-08-18T21:25:09.336Z
carried_count: 2
carried:
  - tsp-a-vehicle-is-made-and-then-drives-something-else — raid-iss-the-vehicle-demonstration-has-never-been-performed (verification.md)
  - tsp-the-engine-keeps-no-record-of-what-it-produced — raid-iss-the-call-log-names-every-vehicle-the-engine-produced (verification.md)
started: 2026-08-18T08:08:41.605Z
opened: 2026-08-12T19:43:29.197Z
goal: "The vehicle overlay: a vehicle vendors the engine, overlays its own guidance and method through one resolution chain, and never writes under the engine."
vision: |-
  WAITS ON i10. req-overlay-resolution demands that the engine and the overlay resolve method artifacts through ONE SHARED IDENTITY SCHEME where a card's identity alone decides which engine card it replaces. Module-qualified ids ARE that scheme. After the sweep this is build-to-spec rather than design.

  WHY IT MATTERS COMMERCIALLY. vp-vendoring is a MUST, and its recorded reason is that quackitect goes open source while company-specific guidance must stay inside the company. Without vendoring those two facts cannot both hold.

  IT IS FULLY SPECIFIED AND ENTIRELY UNBUILT. uc-vendor-and-overlay, req-overlay-resolution with eight clauses, req-engine-folder-is-sealed, req-overlay-survives-update, req-overlay-drift-reported, req-second-product-reuses-install. The engine contains 16 occurrences of the word overlay and 11 of them are SVG layering in the trace drawing.

  IT IS SMALLER THAN IT LOOKS. v1's product/engine-go/resolver.go at ref main is the whole chain in about thirty lines: a layer list, most-specific first — the workspace overlay, then the engine's COMMITTED overlay named by a key in its project config, then engine defaults. The most-specific layer wins, an un-overridden resource is INHERITED, and THE ENGINE LAYER IS READ-ONLY: a vehicle overrides by PLACING A FILE in its overlay, never by editing the engine. The size is in making resources resolvable, not in the resolver.

  Note one detail from that file: a vehicle's method extensions travel in ITS repository and merge over the vendored layer FOR ITSELF AND FOR EVERY STUB IT DRIVES. And the engine directory is found by probing, so nothing carries a hardcoded path to the dogfood repo.

  V1'S VEHICLE IN ONE LINE: a vehicle is built EMPTY, imports quackitect as `se`, and owns local doc modules. That keeps a vehicle shareable without giving colleagues access to the quackitect checkout. It is also why our module is called se.

  THE MODULE LAYOUT, from product/engine-go/module.go at ref main: modules/<dotted.id>/import is a MIRROR of upstream and is never hand-edited; modules/<dotted.id>/overlay is yours and import NEVER touches it; module.toml records provenance. Import plans deterministic file operations, reports deletes for files no longer upstream, and DRY RUN IS THE DEFAULT review surface.

  DO NOT SUBSTITUTE BRAND NAMES AT RENDER TIME. v1 rejected that because rewriting text the ledger hashes would hide content from the trust chain. Instead the renderer takes the identity surfaces — title, wordmark, colophon — from the BRAND LAYER, and method prose is written BRAND-NEUTRAL where it speaks about itself. We already have a brand layer and loadBrand.

  FULL CONTEXT: project/spec/version-planning.md, section i16.

  FROM THE POOL, 2026-08-13. One more, and it is a drawing that could stand on its own.

  PARALLEL COORDINATES IS WORTH BUILDING PROPERLY (owner, note-c22a0195d1df). The owner has looked for good parallel-coordinates tooling, tried building their own, and found none they like - so if ours gets good it is useful far beyond the one state it serves. SETTLED, so it is not relitigated: parallel coordinates is the DEFAULT view for the front, because it carries any number of axes where a scatter cannot, and slicing to two axes gives the classic picture as a view of the same data rather than a second drawing. NOT YET SEEN - no candidate has been scored, so everything so far is measured on markup rather than looked at. Judge it when there is something to draw. FIVE IMPROVEMENTS, none built: slice to two axes and back; reorder axes, since adjacency is what makes a crossing visible; brush a range on one axis and dim the rest; invert an axis where lower is better; handle more lines than colours. THE BOUNDARY IS ALREADY DRAWN, since the drawing code takes axes, candidates and a result and knows nothing about this repository. WEIGH IT AGAINST THE OWNER'S OTHER RULING, that the front card has not yet earned its keep and wants a redesign.
inputs:
  - project/spec/version-planning.md
  - i10-the-big-sweep-one-pass-over-one-key-a-mo
  - product/engine-go/resolver.go at ref main
  - product/engine-go/module.go at ref main
  - spec/trace/value-prop/vp-vendoring.md
---

# i16-the-vehicle-overlay-a-vehicle-vendors-th

## Goal

The vehicle overlay: a vehicle vendors the engine, overlays its own guidance and method through one resolution chain, and never writes under the engine.

## Rough vision

WAITS ON i10. req-overlay-resolution demands that the engine and the overlay resolve method artifacts through ONE SHARED IDENTITY SCHEME where a card's identity alone decides which engine card it replaces. Module-qualified ids ARE that scheme. After the sweep this is build-to-spec rather than design.

WHY IT MATTERS COMMERCIALLY. vp-vendoring is a MUST, and its recorded reason is that quackitect goes open source while company-specific guidance must stay inside the company. Without vendoring those two facts cannot both hold.

IT IS FULLY SPECIFIED AND ENTIRELY UNBUILT. uc-vendor-and-overlay, req-overlay-resolution with eight clauses, req-engine-folder-is-sealed, req-overlay-survives-update, req-overlay-drift-reported, req-second-product-reuses-install. The engine contains 16 occurrences of the word overlay and 11 of them are SVG layering in the trace drawing.

IT IS SMALLER THAN IT LOOKS. v1's product/engine-go/resolver.go at ref main is the whole chain in about thirty lines: a layer list, most-specific first — the workspace overlay, then the engine's COMMITTED overlay named by a key in its project config, then engine defaults. The most-specific layer wins, an un-overridden resource is INHERITED, and THE ENGINE LAYER IS READ-ONLY: a vehicle overrides by PLACING A FILE in its overlay, never by editing the engine. The size is in making resources resolvable, not in the resolver.

Note one detail from that file: a vehicle's method extensions travel in ITS repository and merge over the vendored layer FOR ITSELF AND FOR EVERY STUB IT DRIVES. And the engine directory is found by probing, so nothing carries a hardcoded path to the dogfood repo.

V1'S VEHICLE IN ONE LINE: a vehicle is built EMPTY, imports quackitect as `se`, and owns local doc modules. That keeps a vehicle shareable without giving colleagues access to the quackitect checkout. It is also why our module is called se.

THE MODULE LAYOUT, from product/engine-go/module.go at ref main: modules/<dotted.id>/import is a MIRROR of upstream and is never hand-edited; modules/<dotted.id>/overlay is yours and import NEVER touches it; module.toml records provenance. Import plans deterministic file operations, reports deletes for files no longer upstream, and DRY RUN IS THE DEFAULT review surface.

DO NOT SUBSTITUTE BRAND NAMES AT RENDER TIME. v1 rejected that because rewriting text the ledger hashes would hide content from the trust chain. Instead the renderer takes the identity surfaces — title, wordmark, colophon — from the BRAND LAYER, and method prose is written BRAND-NEUTRAL where it speaks about itself. We already have a brand layer and loadBrand.

FULL CONTEXT: project/spec/version-planning.md, section i16.

FROM THE POOL, 2026-08-13. One more, and it is a drawing that could stand on its own.

PARALLEL COORDINATES IS WORTH BUILDING PROPERLY (owner, note-c22a0195d1df). The owner has looked for good parallel-coordinates tooling, tried building their own, and found none they like - so if ours gets good it is useful far beyond the one state it serves. SETTLED, so it is not relitigated: parallel coordinates is the DEFAULT view for the front, because it carries any number of axes where a scatter cannot, and slicing to two axes gives the classic picture as a view of the same data rather than a second drawing. NOT YET SEEN - no candidate has been scored, so everything so far is measured on markup rather than looked at. Judge it when there is something to draw. FIVE IMPROVEMENTS, none built: slice to two axes and back; reorder axes, since adjacency is what makes a crossing visible; brush a range on one axis and dim the rest; invert an axis where lower is better; handle more lines than colours. THE BOUNDARY IS ALREADY DRAWN, since the drawing code takes axes, candidates and a result and knows nothing about this repository. WEIGH IT AGAINST THE OWNER'S OTHER RULING, that the front card has not yet earned its keep and wants a redesign.

## Inputs

- project/spec/version-planning.md
- i10-the-big-sweep-one-pass-over-one-key-a-mo
- product/engine-go/resolver.go at ref main
- product/engine-go/module.go at ref main
- spec/trace/value-prop/vp-vendoring.md

## Owner rulings, 2026-08-18

RUN IT NOW, ahead of the recorded order. The owner needs to build software
with this system, and nothing else in the queue delivers that.

THE i10 EDGE IS CUT. This iteration no longer waits on the big sweep, and the
`depends_on` entry is removed. The owner's words: "If it's blocked by ten,
yeah, I don't care. We need to do this now. If this means you need to rework
the dependencies, do it."

MODULE-QUALIFIED IDS COME LATER, and the owner accepts more total work for it.

WHAT WAS CHECKED BEFORE THE CUT, because the recorded reason was that
req-overlay-resolution demands one shared identity scheme and module-qualified
ids ARE that scheme:

- Method artifacts resolve by hardcoded PATH today, never by identity.
  `PROMPT_SOURCES` at engine/promptlayer.ts lines 22-34 is a literal path list,
  and `METHOD_PREFIXES` at engine/paths.ts lines 172-177 is another.
- The cards already carry an identity. `id: front-desk`, `id: voice` and
  `id: boot-method` sit in their own frontmatter.
- The big sweep renames the SPEC corpus — `source_refs` on 315 nodes and
  `minted_in` on about 498. The overlay chain resolves none of those.

So the identity scheme the overlay needs already exists for the artifacts the
overlay serves. That is the argument the cut rests on, and this iteration's
design must confirm or overturn it.

THE FOLDER REWORK IS THE AGENT'S TO DECIDE, BY SPIKE. The owner's preference:
the wrapper repository root goes away. They accept keeping it if the spike
says it cannot go. Their words: "I don't like how it is now. I'd like it more
if the root folder goes away. But if it's not possible, then I guess we can't
have it."

AND IT MUST NOT BLOCK THE OVERLAY. The rework may land later, in its own
iteration. Their words: "We can do the folder rework later. That's also...
that's fine."

## Carried work tokens

These stood in the options pool referenced by no iteration at all. Assigned
here in a pass over the pool.

- wt-a-standing-constraint-says-the-system-takes-its-own-name-fro
- wt-no-standing-demand-says-that-a-lookup-with-several-layers-mu

## Carried notes

- note-061b447b2257 — RUNME must run once and never again. The extension copy
  under the editor's own folder is what breaks that. Half-paid 2026-08-20: the
  build renders a tree and RUNME links it, so a rebuild is now enough. The
  owner's view is that the copy should go entirely.
