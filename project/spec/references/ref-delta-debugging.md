---
title: Zeller - delta debugging (ddmin, minimal reproduction)
url: https://www.debuggingbook.org/html/DeltaDebugger.html
kind: authoritative
version: "1999-2021"
accessed: 2026-08-11
tags:
  - evidence
  - debugging
---
Andreas Zeller's delta debugging: shrink the failure-inducing input by
systematic halving until 1-minimal — remove any one more piece and the
failure vanishes. The algorithmic ground under "simplify until only the
error remains". The Debugging Book chapter carries the runnable form;
the overview lives at https://en.wikipedia.org/wiki/Delta_debugging.
