---
id: ref-clean-as-you-code
title: Clean as You Code — scoping a quality gate to the delta
url: https://docs.sonarsource.com/sonarqube-server/10.6/user-guide/clean-as-you-code
kind: tool
version: SonarQube Server 10.6 documentation
accessed: 2026-08-25
tags:
  - overhaul
  - delta-scoping
  - prior-art
---

The industry's standard answer to a corpus too large to hold to a new rule
all at once, and the same answer this method reached independently.

## What it does

The quality gate applies to NEW code only. Existing code is not
held to the new bar, so the bar can rise without producing a backlog nobody
can clear.

WHAT IT WARNS AGAINST, in its own documentation: adding more conditions to
the gate creates bottlenecks with minimal benefit.

## Against ours

WHAT IT DOES BETTER, stated first. It is always on, at the review,
rather than once per sweep. The gate is where the work already is.

WHAT OURS SHEDS. Nothing yet. Our delta scoping is a session's judgment
rather than a standing gate, so between overhauls nothing enforces it.

THE ONE PLACE WE DIFFER DELIBERATELY. Sonar scopes by CHANGED CODE. This
method scoped by CHANGED RULES. Both deltas are real and they catch different
drift, which is why the method now takes their union.

READ ON 2026-08-25 through a search engine's extraction of the publisher's
page. It is evidence a feature is CLAIMED.
