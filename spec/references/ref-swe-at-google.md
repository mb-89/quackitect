---
id: ref-swe-at-google
title: Software Engineering at Google — static analysis, and large-scale change
url: https://abseil.io/resources/swe-book/html/toc.html
kind: book
version: first edition, chapters 20 and 22
accessed: 2026-08-25
tags:
  - overhaul
  - static-analysis
  - large-scale-change
  - prior-art
---

The prior art the overhaul method is measured against. Two chapters and one
paper, all from the same programme.

## Chapter 20 — static analysis

https://abseil.io/resources/swe-book/html/ch20.html

WHAT IT REPORTS. Their analysis platform runs at code review time rather
than as a separate pass. It holds an effective false-positive rate just
under 5%, watched continuously through a "not useful" button on every
finding. An analyser above that rate gets switched off.

WHAT IT DOES BETTER THAN US, stated first. It measures whether its own
checks are trusted, and it acts on the measurement. We mint checks and
measure nothing about them.

## Chapter 22 — large-scale changes

https://abseil.io/resources/swe-book/html/ch22.html

WHAT IT REPORTS. One large change is SHARDED by project boundary and
ownership. Each shard runs its own test, review and submit pipeline, and
each is independently revertible. The chapter claims thousands of such
changes a day across the codebase.

THE CONSEQUENCE IT NAMES is the interesting half. Once a codebase-wide
sweep is cheap, decisions that used to be final stop being final — a
symbol's name, a class's location.

WHAT OURS SHEDS. Nothing yet. We land a sweep as one change, which is the
shape the agentic-PR evidence says merges least often.

## The lessons paper

https://cacm.acm.org/research/lessons-from-building-static-analysis-tools-at-google/

Sadowski, Aftandilian, Eagle, Miller-Cushon and Jaspan, Communications of
the ACM, 2018.

THE MEASUREMENT THAT MATTERS TO US. Filing bugs from tool output failed:
84% of those bugs were never fixed. What worked was delivering the finding
in the workflow, carrying its fix.

THAT IS THE EVIDENCE for this method's rule that a finding seen twice
becomes a lint, and for the rule that a lint which only accuses is half
done.

NOBODY HERE HAS RUN ANY OF IT. Read through the publisher's own pages on
2026-08-25. The chapter text was reached through a search engine's
extraction rather than fetched directly, so treat wordings as paraphrase.
