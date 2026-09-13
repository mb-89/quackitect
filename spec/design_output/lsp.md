---
kind: [[design_output]]
refines: ["[[spec/design_input/one-server-holds-the-shape]]"]
---

# Scope

`src/lsp` holds a language server of this tree's own. It stands beside
`vale-ls` and Biome, and holds the checks neither of those reaches. This note
covers the shape a finding takes, the checker under every front, the two
fronts, the port, and the build.

For the ask, see [[spec/design_input/one-server-holds-the-shape]].
