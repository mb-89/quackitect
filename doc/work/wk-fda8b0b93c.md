---
id: wk-fda8b0b93c
seq: "31"
type: work
title: sort and filter work
status: closed
assignee: main
scope: single-step
traced: true
disposition: became
parent: wk-66a28ca311
successors:
  - wk-5bec911840
minted_by: person
---

## detail

Sort and filter do nothing when a person uses them.

WHAT THE OWNER SEES: the popovers open and the controls inside them have no
effect. Properties is the one that works.

WHAT IS RULED OUT: the select is not empty. It renders 29 options, one per
property, measured on the rendered page.

SO THE DEFECT IS IN THE WIRING OR IN WHAT THE MESSAGE DOES WHEN IT ARRIVES.
Render the page, read what is drawn, and follow one control from the press to
the file it writes. Do not guess at it again.

V3'S WORKED. bases had one client and the controls were part of it, so start
there rather than from this one.

