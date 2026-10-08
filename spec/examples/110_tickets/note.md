---
kind: [[example]]
title: A note parks a thought for the retro
keywords: ["ticket", "note", "retro", "park"]
interface: ["ticket note"]
---

A hand parks a thought as a private note, and the retro decides it later.

```sh
./RUNME.sh ticket note slow-lint "the lint runs slow on a cold box"
# expect: exit 0
# expect: says "waits for a retro to decide it"
# expect: stands .se/tickets/slow-lint.md
```
