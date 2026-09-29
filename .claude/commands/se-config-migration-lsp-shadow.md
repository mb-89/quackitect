---
description: "config / migration / lsp: sets migration.lsp to shadow. The LSP's rules: old answers on the LSP's own sweep alone, shadow runs the check module's sweep beside it and logs each finding apart, new answers the module's."
allowed-tools: Bash(./RUNME.sh config:*)
disable-model-invocation: true
generated: "GENERATED. Edit the source named below, not this file. It is written again every time the tree is projected, so an edit here is lost. Source: spec/config/level0.json"
---

!`./RUNME.sh config migration.lsp shadow`

The line above runs before this turn opens, so `migration.lsp` reads `shadow` from
here on. Run `./RUNME.sh config` to read which layer answers a key:
`.se/.runtime/config.json` beats the environment, and the environment beats
`spec/config/level0.json`.
