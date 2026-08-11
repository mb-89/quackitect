---
title: git bisect - binary search over history
url: https://git-scm.com/docs/git-bisect
kind: authoritative
version: "current"
accessed: 2026-08-11
tags:
  - evidence
  - debugging
---
The stock tool for bisecting a fault over commit history: mark one good
and one bad commit, and git halves the range until the first bad commit
stands alone. The history face of "bisect the space that holds the
fault".
