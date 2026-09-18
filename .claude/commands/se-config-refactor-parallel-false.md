---
description: "config / refactor / parallel: sets refactor.parallel to false. true starts the hand beside the work. false leaves the list to the session itself."
allowed-tools: Bash(./RUNME.sh config:*)
generated: "GENERATED. Edit the source named below, not this file. It is written again every time the tree is projected, so an edit here is lost. Source: spec/config/level0.json"
---

!`./RUNME.sh config refactor.parallel false`

The line above runs before this turn opens, so `refactor.parallel` reads `false`
from here on. Run `./RUNME.sh config` to read which layer answers a key:
`.se/config.json` beats the environment, and the environment beats
`spec/config/level0.json`.
