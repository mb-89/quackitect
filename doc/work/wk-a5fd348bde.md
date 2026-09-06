---
kind: [[work-token]]
process: [[trivial]]
guidance: [[work-token]]
title: grace is unlocked
status: closed
disposition: done
---

## detail

countGrace does a read, modify and write of grace.json from a fresh guard process on every tool call, with no lock. The obligations beside it in the same file go through changeOwed precisely because unsynchronised writes lost them. Two agents at once lose grace increments and get more grace than they were given.

## done when

- countGrace goes through the lock-and-change shape changeOwed provides.
- Two concurrent grace changes both survive in a test. Seen red first.

