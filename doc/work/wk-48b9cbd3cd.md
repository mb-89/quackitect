---
id: wk-48b9cbd3cd
seq: "12"
type: work
title: reattach on reload
status: closed
assignee: main
scope: single-step
traced: true
disposition: done
evidence:
  - outcome
minted_by: main
---

## detail

Reloading the editor window leaves the start button grey even though an engine is running. The window should find the engine that is already there and show it green without pressing start again. Level 0 writes a heartbeat, so what is running is answerable from the record.

## evidence: outcome

reattach() read .se/engine.json and called setState("good") before the panel existed, so the message went nowhere. Now the panel says when it can listen and sayEverything answers. It reads the engine from its pid file and the hold from its own file. The same call covers the hold, which had the same fault.
