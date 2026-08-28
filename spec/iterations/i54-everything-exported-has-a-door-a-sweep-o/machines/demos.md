---
steps:
  - id: no-surface-can-reach
    statement: demonstrate sty-find-working-code-that-no-surface-can-reach - run the sweep against the real tree and watch it name every entry point nothing invokes
    depends_on: []
    realization: document
  - id: an-exception-without-a-reason
    statement: demonstrate sty-an-exception-without-a-reason-is-refused - perform a write that adds a departure with no reason and watch the refusal name the file, the line and the repair
    depends_on: []
    realization: document
  - id: why-the-code-departs
    statement: demonstrate sty-read-why-the-code-departs-from-its-own-design - open the departure list as a person would and read why each module is allowed past
    depends_on: []
    realization: document
---

# The demo drawing

One state per must story. Three were minted by this record and all three are
demonstrable against the shipped system rather than against a fixture.

## Why these three and no others

The record minted three must stories. Nothing else it minted is a `must`, so
nothing else owes a demonstration here.

## What each one has to SHOW rather than assert

THE FIRST IS A SWEEP OVER THE REAL TREE. A fixture proves the predicate; only
the real tree proves the answer is worth reading. This one is watched because
its figure was wrong twice during the build, in both directions, and each wrong
version looked right.

THE SECOND IS A REFUSAL PERFORMED, not asserted. The story is about what a
person meets when they try to bypass a rule, so the demonstration is the
attempt and the answer that comes back — including whether the remedy it hands
over actually applies.

THE THIRD IS A READING, and it is the one no test can stand in for. The
question is whether a person who finds a module doing something the design
forbids can tell a decision from a mistake. That is answered by opening the
list and reading it, or it is not answered at all.

## The three run independently

None depends on another. They are drawn with no edges between them so the
machine may walk them in any order.
