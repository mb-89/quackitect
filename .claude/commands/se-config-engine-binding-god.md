---
description: "config / engine / binding: sets engine.binding to god. Where the session takes its work from. The chapter The engine controls, under spec/design_output/config.md, says what each value means."
allowed-tools: Bash(./RUNME.sh config:*)
disable-model-invocation: true
generated: "GENERATED. Edit the source named below, not this file. It is written again every time the tree is projected, so an edit here is lost. Source: spec/config/level0.json"
---

!`./RUNME.sh config engine.binding god`

The line above runs before this turn opens, so `engine.binding` reads `god` from
here on. Run `./RUNME.sh config` to read which layer answers a key:
`.se/.runtime/config.json` beats the environment, and the environment beats
`spec/config/level0.json`.
