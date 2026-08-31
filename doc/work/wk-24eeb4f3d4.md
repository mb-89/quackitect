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
reason: "The remedy landed on the editor port: the toolbar button that files ticked rows is bs-make-bucket at src/extension/editor.ts:152, and bs-group now names the filter group and nothing else, so the handler cannot reach a filter control. Obsolete."
aborted_from: backlogged
minted_by: reviewer4
---

## detail

A class name that is both a look and a handle for a delegated listener, used for two unrelated things. bs-group is the toolbar button that files ticked rows into a bucket (editor.ts:144) and it is also every group in the filter builder (editor.ts:186, :196). The handler that files rows matches by that name on the document, editor.ts:640, ev.target.closest('.bs-group'), and a filter group is an ancestor of everything inside it, so pressing + Add condition, a group's join word, or a condition's property box files the ticked rows into a bucket. A stylesheet is happy to share a name and closest() is not.

WHAT TO DO: give a control that a delegated listener matches on a name nothing else answers to, and keep the styling name separate from the handle if they must differ. Before delegating on a class, count how many hits that class has in the file and how many of them mean the thing you meant.

THE CHECK, RED TODAY: tick a row, open the Filter popover, press every control a person can reach inside a filter group, and require that no message of type group was sent; then press the toolbar button and require exactly one. Write it as no group message except from the button, so it still catches the class when a fourth control joins that popover. Reproduced in .se/scratchpad/reviewer4/drive-bucket.mjs. Found on wk-bb34ab1208.

