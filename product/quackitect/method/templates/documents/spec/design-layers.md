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

exclude: i*_build.go, i*_red.go, *_test.go

<!-- Optional flow endpoints for the onion's layer views (owner c34): what enters the outer
  rim and what leaves it. One comma-separated line each. Omit if the system has none yet.
  inputs: <thing>, <thing>
  outputs: <thing>, <thing>
-->
  infra: <plumbing files not on the request flow -> rendered as pills below the onion>
