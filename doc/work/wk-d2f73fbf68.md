---
id: wk-d2f73fbf68
seq: 1000176
type: work
title: Skipped files stay silent
status: backlogged
assignee: main
scope: single-step
traced: true
minted_by: rev-18
---

## detail

util/checks/engine-spawns.mjs derives its set from one declaration shape and silently skips every file that uses another. boundToChildProcess only recognises a braced import of node:child_process, and a file that binds nothing is skipped whole, with no count, no failure and no output. On a copy of src/extension, a file with a namespace import calling cp.spawn with a literal flag list answered 9 spawn(s) read, 0 failed. Make engine-spawns.mjs name and fail on any .ts under src/extension that mentions child_process and yields no binding. Make engine-spawns-catches.mjs plant a namespace-import spawn in its copy and require the red. In general, a file a check cannot understand is reported, never skipped. Related: wk-02e17b9eb4.
