---
id: ref-betterer
title: Betterer — a ratchet for any code metric
url: https://phenomnomnominal.github.io/betterer/docs/introduction/
kind: tool
version: not pinned — the docs carry no version on the introduction page
accessed: 2026-08-25
tags:
  - overhaul
  - ratchet
  - technical-debt
  - prior-art
---

The named answer to the moment a new check reports hundreds of violations
at once.

## What it does

FROM ITS OWN INTRODUCTION. It snapshots a METRIC rather than a
value, stores that snapshot, and then enforces that the metric moves in the
wanted direction over time. A run that makes things worse fails; a run that
makes things better lowers the stored figure.

THE FAILURE IT NAMES is the one this repository would hit. Its docs describe
two doomed alternatives: a long-lived cleanup branch nobody can merge, and a
team agreement to improve gradually that everybody forgets.

## Against ours

WHAT IT DOES BETTER, stated first. It has an answer for a check that
cannot be satisfied today. We have none: our lint reports every violation it
finds, so a rule minted over a grown corpus is either fixed in one sitting or
suppressed.

WHAT OURS WOULD SHED, if we built it. Nothing yet — there is nothing to
compare. Writing that comparison before the mechanism exists would be
fabrication.

THE SAME IDEA IN ARCHITECTURE is ArchUnit's freezing rule, in
[[ref-archunit]]. Betterer generalises it past architecture to any number.

NOBODY HERE HAS RUN IT. Read on 2026-08-25 through a search engine's
extraction of the publisher's page. It is evidence a feature is CLAIMED.
