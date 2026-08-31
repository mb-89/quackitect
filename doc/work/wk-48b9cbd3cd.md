---
id: wk-48b9cbd3cd
seq: "12"
type: work
title: reattach on reload
status: submitted
assignee: main
scope: single-step
traced: true
disposition: done
evidence:
  - measured
  - how
minted_by: main
---

## detail

Reloading the editor window leaves the start button grey even though an engine is running. Pressing start again should not be needed: the window should find the engine that is already there and show it green. Level 0 writes a heartbeat, so what is running is answerable from the record rather than from anything the window remembered.

## evidence: how

The panel says when it can listen, and sayEverything answers with what is true: the engine, read from the file that holds its pid, and the hold, read from its own file. Both outlive the window, so nothing depends on a message sent before anybody could hear it. The hold had the same fault and it is covered by the same call.

## evidence: measured

reattach() reads .se/engine.json, checks the pid is alive, and calls setState("good"). It runs during activation, before the panel exists. setState posts to view, and view is undefined until resolveWebviewView runs. The message went nowhere, so a reload left a running engine with a grey button and pressing start was the only way to agree.

