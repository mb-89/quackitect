---
id: ref-agentic-refactoring
title: What coding agents actually refactor, and what they miss in documentation
url: https://arxiv.org/abs/2511.04824
kind: paper
version: two preprints, arXiv 2511.04824 and arXiv 2506.16440
accessed: 2026-08-25
tags:
  - overhaul
  - agent-behaviour
  - prior-art
---

Two measurements that bound what an agent-run sweep may claim.

## What agents refactor

arXiv 2511.04824, over 15,451 refactoring instances in real Java projects.

- Agents explicitly targeted refactoring in 26.1% of commits.
- The work was dominated by low-level consistency edits: change variable
  type 11.8%, rename parameter 10.4%, rename variable 8.5%.

THE PAPER'S OWN FRAMING: agents prefer localised improvements over the
high-level design changes common in human refactoring.

THAT IS EXACTLY THE PART AN OVERHAUL EXISTS FOR. So the structural findings
need the most deliberate attention, not the least, and an agent left to its
own preference will do the renames and leave the design alone.

## What agents miss in documentation

arXiv 2506.16440, on tracing documentation to the code it describes.

- Best F1 around 79% to 80%.
- Precision consistently above 87%.
- Recall between 47% and 75%.

HIGH PRECISION, UNRELIABLE RECALL. What such a sweep flags is usually real.
What it misses is invisible, and between a quarter and a half of what is
wrong goes unflagged.

SO AN AGENT-RUN PROSE SWEEP REPORTS FINDINGS AND NEVER COVERAGE. "Nothing
found" and "nothing looked at" read identically otherwise.

BOTH ARE PREPRINTS AND NEITHER PDF WAS FETCHED. Read on 2026-08-25 through a
search engine's extraction of the arXiv landing pages. Treat the figures as
reported rather than verified.
