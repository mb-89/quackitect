---
id: vehicles-and-overlays
scope: always
statement: What a vehicle is, what a stub is, and how the overlay overrides the engine - the one-page map of the engine/vehicle/workspace model.
---
## Guide (load on demand)

Three shapes, one engine:

- **Engine** - quackitect itself: the Go binary plus its method resources. One global binary
  (`%LOCALAPPDATA%\quackitect\bin`), ratcheting forward from vendored source.
- **Vehicle** - a project that uses quackitect as its engine to build ITS OWN tool, under its
  own brand. `quack start init <folder>` scaffolds it: the engine is vendored under
  `tools/vendor/`, the launcher is white-labeled (`<proj>.cmd` -> `<proj>.exe`), and
  `product/` + `spec/` belong to the vehicle's tool. Nestable: a vehicle can be the engine
  for another project.
- **Stub workspace** - a bare project (spec + product, no engine copied in) driven from
  inside via a launcher that resolves the engine at runtime. `quack start stubs <folder>`
  emits it. This is the normal home for a PROJECT a vehicle or the engine drives.

**The one rule people trip over:** a vehicle's `spec/` describes the VEHICLE's tool - a
project the vehicle drives gets its own stub workspace. `quack lint` warns when a vehicle's
spec grows iterations while its `product/` stays empty (that is the misuse signature).

**Override, don't fork (the overlay).** Engine resources resolve most-specific-first:
workspace data-home `overlay/` -> the vehicle's committed overlay (the `overlay` key in
`spec/project.toml`, e.g. `product/<proj>/method/...`) -> the vendored/dogfood engine.
Drop a file at the same relative path to override it; everything else is inherited.
`quack resolve <path>` names the winning layer. Brand (logos, voice, palette, name.txt)
lives at `product/brand/` and white-labels the book and report; the engine appears only
as the colophon credit.
