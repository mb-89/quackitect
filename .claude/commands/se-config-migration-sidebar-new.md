---
description: "config / migration / sidebar: sets migration.sidebar to new. The sidebar: old draws its own groups alone, shadow weighs the views section against them and logs each pair apart, new draws the views section."
allowed-tools: Bash(./RUNME.sh config:*)
disable-model-invocation: true
generated: "GENERATED. Edit the source named below, not this file. It is written again every time the tree is projected, so an edit here is lost. Source: spec/config/level0.json"
---

!`./RUNME.sh config migration.sidebar new`

The line above runs before this turn opens, so `migration.sidebar` reads `new` from
here on. Run `./RUNME.sh config` to read which layer answers a key:
`.se/.runtime/config.json` beats the environment, and the environment beats
`spec/config/level0.json`.
