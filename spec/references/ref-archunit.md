---
id: ref-archunit
title: ArchUnit — a Java architecture test library
url: https://www.archunit.org/
kind: tool
version: not pinned — the project page carries no version on its front matter
accessed: 2026-08-16
tags:
  - conformance
  - architecture
  - prior-art
---

The concrete form i6's design borrows. A free, extensible library for
checking the architecture of Java code from any plain Java unit test
framework, by TNG. Source at https://github.com/TNG/ArchUnit.

WHAT IT ACTUALLY DOES, from its own pages. It analyses compiled Java
BYTECODE, importing every class into a code structure it can then assert
over. It checks dependencies between packages and classes, layers and
slices, and cyclic dependencies, and it ships built-in checks for layered
and onion architectures. Rules are written through a fluent Lang API so
an IDE can suggest the next term.

WHERE IT RUNS IS THE WHOLE DIFFERENCE FOR US. It runs in a test suite,
over compiled output, and a failing rule fails the build. Our delta puts
the same idea at the WRITE, over the content being written, before
anything lands.

A TEST SUITE HAS A SECOND TO SPARE AND A WRITE DOES NOT. That is the
tradeoff we take on and it is not one ArchUnit had to make.

WHAT IT DOES BETTER, stated first. It needs no new runner, no new report
surface and no new place to look — it rides the test framework every Java
team already has. Its subject is compiled bytecode, which cannot lie
about what the code does; ours is text, which can.

WHAT OURS SHEDS. The compile step, and the wait for it. A rule broken at
10:00 is heard at 10:00 rather than at the next build.

## ITS FREEZING RULE IS THE RATCHET WE HAVE NO ANSWER FOR

Read 2026-08-25, on the same user guide. It states the problem in as many
words: introducing a rule into a grown project produces hundreds or thousands
of violations, too many to fix at once, so the only workable approach is
iterative.

WHAT IT DOES ABOUT IT. Existing violations are recorded to a store. Later
runs report only NEW ones. Fixing a violation lowers the stored baseline by
itself, so the count can fall and cannot rise.

[[ref-betterer]] generalises the same idea past architecture to any metric.

NOBODY HERE HAS RUN IT. Everything above is what its own documentation
claims, read on 2026-08-16 and 2026-08-25. It is evidence that a feature is
CLAIMED and nothing more.
