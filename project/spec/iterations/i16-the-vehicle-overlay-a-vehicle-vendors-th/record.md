---
id: i16-the-vehicle-overlay-a-vehicle-vendors-th
status: seeded
opened: 2026-08-12T19:43:29.197Z
goal: "The vehicle overlay: a vehicle vendors the engine, overlays its own guidance and method through one resolution chain, and never writes under the engine."
vision: "WAITS ON i10. req-overlay-resolution demands that the engine and the overlay resolve method artifacts through ONE SHARED IDENTITY SCHEME where a card's identity alone decides which engine card it replaces. Module-qualified ids ARE that scheme. After the sweep this is build-to-spec rather than design.\n\nWHY IT MATTERS COMMERCIALLY. vp-vendoring is a MUST, and its recorded reason is that quackitect goes open source while company-specific guidance must stay inside the company. Without vendoring those two facts cannot both hold.\n\nIT IS FULLY SPECIFIED AND ENTIRELY UNBUILT. uc-vendor-and-overlay, req-overlay-resolution with eight clauses, req-engine-folder-is-sealed, req-overlay-survives-update, req-overlay-drift-reported, req-second-product-reuses-install. The engine contains 16 occurrences of the word overlay and 11 of them are SVG layering in the trace drawing.\n\nIT IS SMALLER THAN IT LOOKS. v1's product/engine-go/resolver.go at ref main is the whole chain in about thirty lines: a layer list, most-specific first — the workspace overlay, then the engine's COMMITTED overlay named by a key in its project config, then engine defaults. The most-specific layer wins, an un-overridden resource is INHERITED, and THE ENGINE LAYER IS READ-ONLY: a vehicle overrides by PLACING A FILE in its overlay, never by editing the engine. The size is in making resources resolvable, not in the resolver.\n\nNote one detail from that file: a vehicle's method extensions travel in ITS repository and merge over the vendored layer FOR ITSELF AND FOR EVERY STUB IT DRIVES. And the engine directory is found by probing, so nothing carries a hardcoded path to the dogfood repo.\n\nV1'S VEHICLE IN ONE LINE: a vehicle is built EMPTY, imports quackitect as `se`, and owns local doc modules. That keeps a vehicle shareable without giving colleagues access to the quackitect checkout. It is also why our module is called se.\n\nTHE MODULE LAYOUT, from product/engine-go/module.go at ref main: modules/<dotted.id>/import is a MIRROR of upstream and is never hand-edited; modules/<dotted.id>/overlay is yours and import NEVER touches it; module.toml records provenance. Import plans deterministic file operations, reports deletes for files no longer upstream, and DRY RUN IS THE DEFAULT review surface.\n\nDO NOT SUBSTITUTE BRAND NAMES AT RENDER TIME. v1 rejected that because rewriting text the ledger hashes would hide content from the trust chain. Instead the renderer takes the identity surfaces — title, wordmark, colophon — from the BRAND LAYER, and method prose is written BRAND-NEUTRAL where it speaks about itself. We already have a brand layer and loadBrand.\n\nFULL CONTEXT: project/spec/version-planning.md, section i16.\n\nFROM THE POOL, 2026-08-13. One more, and it is a drawing that could stand on its own.\n\nPARALLEL COORDINATES IS WORTH BUILDING PROPERLY (owner, note-c22a0195d1df). The owner has looked for good parallel-coordinates tooling, tried building their own, and found none they like - so if ours gets good it is useful far beyond the one state it serves. SETTLED, so it is not relitigated: parallel coordinates is the DEFAULT view for the front, because it carries any number of axes where a scatter cannot, and slicing to two axes gives the classic picture as a view of the same data rather than a second drawing. NOT YET SEEN - no candidate has been scored, so everything so far is measured on markup rather than looked at. Judge it when there is something to draw. FIVE IMPROVEMENTS, none built: slice to two axes and back; reorder axes, since adjacency is what makes a crossing visible; brush a range on one axis and dim the rest; invert an axis where lower is better; handle more lines than colours. THE BOUNDARY IS ALREADY DRAWN, since the drawing code takes axes, candidates and a result and knows nothing about this repository. WEIGH IT AGAINST THE OWNER'S OTHER RULING, that the front card has not yet earned its keep and wants a redesign."
inputs:
  - "project/spec/version-planning.md"
  - "i10-the-big-sweep-one-pass-over-one-key-a-mo"
  - "product/engine-go/resolver.go at ref main"
  - "product/engine-go/module.go at ref main"
  - "spec/trace/value-prop/vp-vendoring.md"
depends_on:
  - i10-the-big-sweep-one-pass-over-one-key-a-mo
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
