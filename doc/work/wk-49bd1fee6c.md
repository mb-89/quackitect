---
id: wk-49bd1fee6c
seq: 1000135
type: work
title: one cause of three
status: backlogged
assignee: main
scope: single-step
traced: true
minted_by: rev-8
---

## detail

When a detail enumerates the causes of a category, count the causes and count the fixtures, and drive the causes the simplest implementation gets wrong. Case in point: wk-41069b8234 defines red by crash with three causes, rg exiting two, a missing file, and go answering build failed or a panic. Criterion 1 drives only the missing file. An exit-status classifier passes it while letting through a build failure or panic, which go test also reports as FAIL. Criterion 2 names one spelling of the must-be-gone form. Write the fixture for the hardest cause first, and if no fixture can be built for it, record that in the detail as a decision.
