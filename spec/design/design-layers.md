# design-layers — the onion's layer map

<!-- tailor: the ONE judgment input of the onion figure (fig: onion, design chapter).
  Everything else derives: the blocks are the source files bearing design markers,
  the counts, the drill-down, and the leaf links all compute from the graph.
  RULES:
  - One line per layer, INNERMOST FIRST: `<layer-name>: <pattern>, <pattern>`.
  - A pattern matches the end of a marker-bearing file's path; `*` matches any run.
  - The onion models data flow: inputs enter at the rim, travel inward through the
    layers, outputs leave; a block sits on the ring it works in.
  - `exclude:` names patterns that stay OUT of the figure entirely (iteration
    files, generated code) - the book documents the current design, not history.
  - A marker-bearing file no line matches renders in an outermost `unmapped` ring
    and is a lint finding: the map cannot rot silently.
-->

kernel: trust.go, attest.go, truth.go, ratchet.go
core: engine.go, parse.go, coverage.go, conn.go, content.go, data.go, resolver.go, autolink.go, base.go, decisions.go
services: ops.go, cli.go, main.go, mint.go, lints.go, vale.go, selftest.go, selftest_spec.go, selftest_trust.go
surfaces: book.go, report.go, report_assets.go, report_watch.go, board.go, readout.go, des-*.md
method: method/*, brand/*, design/*
exclude: i*_build.go, i*_red.go, *_test.go

inputs: spec notes (nbr-obsidian), CLI commands (nbr-console), git (nbr-git), disk
outputs: status board (nbr-console), report (nbr-reader), the book (nbr-reader), ship zip, disk

infra: ratchet.go, resolver.go, data.go, attest.go, truth.go
