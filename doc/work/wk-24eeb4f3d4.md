---
id: wk-24eeb4f3d4
seq: "55"
type: work
title: one class one meaning
status: aborted
assignee: main
scope: single-step
traced: true
disposition: dropped
reason: "Obsolete: the toolbar button is now bs-make-bucket at src/extension/editor.ts:152 and bs-group names only the filter group."
aborted_from: backlogged
minted_by: reviewer4
---

## detail

bs-group names both the toolbar button that files ticked rows into a bucket and every group in the filter builder. The delegated handler at editor.ts:640 matches on ev.target.closest('.bs-group'). So pressing any control inside a filter group files the ticked rows. Give the control a name nothing else answers to and keep the styling name separate from the handle. Check: tick a row, press every control inside a filter group, require no group message, then press the toolbar button and require exactly one. Reproduced in .se/scratchpad/reviewer4/drive-bucket.mjs. Related: wk-bb34ab1208.
