---
id: wk-bcc17c6ba8
seq: 1000037
type: work
title: the light goes red
status: spec_open
assignee: human
scope: single-step
traced: true
minted_by: cowork
---

## detail

A manual test, since it needs the editor open and a person looking. Open the folder in the editor and let the engine start until the button goes green. Kill the engine from a terminal, leave the editor alone, and watch the button go red on its own within a few beats. Start the engine again from the terminal and watch the button go back to green with nothing pressed. src/extension/liveness.ts holds the decision and util/checks/liveness.mjs asserts it, but no check reaches whether the timer calls it and the button repaints. If it fails, say which half: the light never went red, or it went red and never came back. This was UC-6.
