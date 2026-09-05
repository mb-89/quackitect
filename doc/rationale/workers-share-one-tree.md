---
kind: [[rationale]]
title: workers share one tree
explains:
  - src/engine/nored.go
---

## decided

Many workers work one tree on one box, and a worktree each is refused. The engine carries the cost of sharing instead. A package that will not compile answers as a build rather than a red. The answer names the hand whose file the build error names.

## why

The engine is built from the tree it runs over, so a worktree per worker put a stale engine over each one. Every worktree wanted a whole copy of the system and a merge back. Parallelism was measured to scale by boxes rather than by copies on one box.

One package one worker was ruled out by counting. Every file under src/engine declares the same package, so that rule meant one worker on the engine for ever.

What was left was the cost of sharing, and the wrong hand paid it. A change naming an identifier nothing defined yet took the package build down. Every other worker was handed that failure in place of its own answer. It happened three times inside twenty minutes, from three hands. Whoever wrote the breakage got what it asked for. The rest could not tell their change from a neighbour's, could not earn a red, and could not close.

The record already knew whose write was whose, because every apply journals the token and the files it touched. So the answer names the file, the token and the holder, and a reader stops paying for a change nobody told it about.

## costs

A worker still cannot run its tests while another hand's change does not compile. Saying whose it is does not get that hand finished. The attribution rests on the journal. A file written by a shell command belongs to nobody the record can name, and the answer says so rather than guessing. A build failure now reads as a build rather than a failing test, so a reader counting failures alone sees fewer of them.

## revisit when

- a box holds a worktree and an engine per worker, and the copies cost less than the collisions do
- the record stops naming the file a build error names, so the attribution answers nobody
- the toolchain builds a package per hand, so one half-finished change no longer reaches another hand's build
