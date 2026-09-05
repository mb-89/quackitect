---
kind: [[work-token]]
process: [[trivial]]
guidance: [[work-token]]
title: a reference machine
status: closed
disposition: done
---

## detail

Nothing in the tree says what machine the work assumes. The owner's answer: a 2025 corporate laptop with many cores that overheats, so the cores throttle. Many cores, and not strong ones. So the design spreads work across them and never rests on one call being fast, because a fast core throttles under load. The battery learned this once already, going from 100 seconds serial to 37 parallel, and nothing wrote the lesson down.

## done when

- A rule in shape-of-a-program.md says work spreads across many weak cores, never resting on one fast call. A reader finds it.

