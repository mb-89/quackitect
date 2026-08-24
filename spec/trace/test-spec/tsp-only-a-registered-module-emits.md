---
minted_in: i4-the-panel-round-the-archived-iteration-b
id: tsp-only-a-registered-module-emits
type: "[[test-spec]]"
statement: A module that emits widget markup is one the editor registry names, and a stray emitter is refused rather than discovered later.
method: test
verifies:
  - req-a-wrong-act-never-passes-silently
files:
  - deliverable/tests/widget-emitters.test.ts
---

## Scope

The guard [[el-widget-guard]] declares, checked statically over the engine
tree. One requirement, graded fatal.

WHAT IS DELIBERATELY OUT. A derivation INSIDE a registered module. The
predicate finds emitters, not derivers, so a registered editor that begins to
compute its own answers is invisible to it. That gap is named on the element
and it needs a different check.

## Approach

DESIGN METHOD: the predicate is a decision over one partition — a module
either emits or it does not — and the interesting boundary is the registry.
Two cases: every emitter is registered, and the registry is not empty.

THE SECOND CASE EXISTS BECAUSE THE FIRST CAN PASS FOR THE WRONG REASON. A rule
that compares against an empty list passes trivially, and that silent pass is
what this whole check is against.

LEVEL: component. It reads the source tree and needs nothing running.

## Steps

1. EVERY EMITTER IS REGISTERED. Walk the engine's TypeScript sources, flag
   each that holds a template literal carrying an opening block tag or a tag
   with a class attribute, and assert every flagged file is one the editor
   index names.
2. THE REGISTRY NAMES AT LEAST ONE MODULE. Assert the parsed registry is not
   empty, so step 1 cannot pass by comparing against nothing.

## Expected result today

RED, and deliberately. The built check reported 21 unregistered emitters on
2026-08-23: basesclient, baseui, bin/mermaid-check, brand, card-parts, mirror,
params, render, six renderclient files, session, stateform-sheet, tables,
tools, trace-layout, trace and traceui.

EACH OF THE 21 IS EITHER PART OF THE ONE SURFACE OR A SECOND ONE, and deciding
which is the build's work. The check goes green when that decision is made and
the registry says so.

A SPIKE SAID EIGHTEEN BEFOREHAND. Its registry reader was rougher and it did
not walk `bin/`. The built check is the one to believe.

A FIRST GREEN NEEDS A RED, and this one starts with the red already measured.
