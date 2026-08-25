---
id: ref-refactoring-at-microsoft
title: Kim, Zimmermann and Nagappan — a dedicated refactoring campaign, measured
url: https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/kim-tse-2014.pdf
kind: paper
version: IEEE Transactions on Software Engineering, 2014
accessed: 2026-08-25
tags:
  - overhaul
  - refactoring
  - prior-art
---

The strongest published evidence FOR a dedicated cleanup campaign, and it
carries its own warning.

## What was measured

THE SUBJECT. A refactoring team's work on Windows 7, checked against
the version history rather than against opinion.

THE RESULT IN OUR FAVOUR. The refactored binary modules showed a significant
fall in inter-module dependencies and in post-release defects. A campaign can
work.

THE RESULT AGAINST US, and it is the one that binds this method's new
refactor-versus-new-function split: refactoring revisions frequently ALSO
carried bug fixes, and API-level refactorings were followed by an INCREASE in
bug fixes.

BEHAVIOUR-PRESERVING IN THEORY, NOT IN THE DATA. Engineers who were trying to
keep the line did not keep it.

## What follows for us

THE SPLIT IS NOT SELF-ENFORCING. The split is not self-enforcing, and calling something a
refactor at authoring time proves nothing. What would prove it is a check
that observable behaviour did not move. We do not have one.

PRIMARY READ from the publisher's own hosted PDF on 2026-08-25.
