---
id: ref-reflexion-models
title: Software Reflexion Models — checking intended structure against real structure
url: https://dl.acm.org/doi/10.1145/222132.222136
kind: paper
version: Murphy, Notkin and Sullivan, FSE 1995
accessed: 2026-08-25
tags:
  - overhaul
  - conformance
  - architecture
  - prior-art
---

The original conformance-checking technique, and the one this method has no
equivalent of.

HOW IT WORKS. An engineer writes down the structure the system is SUPPOSED
to have. A mapping says which source belongs to which part of that model. A
tool then computes three sets.

- CONVERGENCE — where the source and the model agree.
- DIVERGENCE — an edge the source has and the model does not.
- ABSENCE — an edge the model has and the source does not.

## Why it matters here

THE OPPOSITE CASE. Our sweep is scoped by rules that changed. A reflexion
model catches the opposite case: the rule stood still and the code moved out
from under it. No amount of rule-delta scoping sees that.

WHAT IT DOES BETTER THAN US, stated first. It is a standing artifact checked
on every build rather than a judgment made once per overhaul. That converts a
whole class of our findings into a permanent check.

WHAT IT COSTS. Somebody has to write the intended model down, and keep the
mapping true. That is real authoring work, and a wrong model reports
confident nonsense.

PRIMARY NOT FETCHED. The publisher's landing page was reached on 2026-08-25;
the paper itself sits behind the ACM paywall and was not read here. The
three-set vocabulary above is the paper's, as reported by the abstract and by
later work citing it.
