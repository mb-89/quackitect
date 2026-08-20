---
minted_in: i1
id: dsp-live-register
type: "[[design-spec]]"
statement: notes as one live table, carried by base view files evaluated over the vault on every look
realizes:
  - "el-mirror"
files:
  - "deliverable/engine/bases.ts"
  - "deliverable/engine/basesclient.ts"
  - "deliverable/engine/baseui.ts"
  - "deliverable/engine/tables.ts"
  - "deliverable/engine/vault.ts"
  - "deliverable/engine/expr.ts"
  - "deliverable/engine/expr-parse.ts"
  - "deliverable/engine/expr-value.ts"
  - "deliverable/engine/bin/format-vault.ts"
  - "deliverable/engine/signals.ts"
---

## Responsibility

The register as a table: rows derive from the vault's notes, the view
declaration is itself a file, grouping and sorting hold, expressions
evaluate per reference, a cell edit lands on the note it names, and
what cannot be drawn is refused by name. The pivot and dependency
matrices ride the same machinery.

## Rationale

This is the work-the-register function made concrete — the design the
iteration set out to prove: a bases-equivalent live table over plain
markdown.

## The index is warm and a render never builds it

THE WARM MODEL, not a fresh read. The index is built once, kept current
by the watcher and the lane's tells, and every view reads the same rows
the filters do.

AND A RENDER NEVER BUILDS IT (2026-08-10). The synchronous build on this
chain froze every surface at once; now the card reads the rows that are
ready, and where none are it KICKS the async build and says so. The
mirror re-renders on its next poll, and a late table is a repaint —
exactly the cost a render is allowed to pay.

## An absent field does not contain anything

AN ABSENT FIELD DOES NOT CONTAIN ANYTHING — it is not an error to ask.

WHY THIS EXISTS (owner report 2026-08-08). "Give me every note linked to X"
is the query the whole register is for, and it is one expression:
refines.contains("uc-take-a-step"). It THREW, on the first note that has no
refines — which over a vault of 480 notes holding method cards, states and
templates is immediately. So the one query that matters could not be run at
all, and nothing said why.

FALSE IS THE RIGHT ANSWER, not a refusal. A note with no links is not linked
to X, and a filter that cannot survive a heterogeneous vault is not a filter.

## Commit on enter, discard on escape

WRITING BACK — one cell, one key, one note.

COMMIT ON ENTER, DISCARD ON ESCAPE (owner ruling 2026-08-01). Nothing is
written while somebody is typing, which is the Qt delegate contract and the
reason this needs no debouncing, no dirty tracking and no conflict window.

## One entry, so a large vault never blocks the draw

THE ONE ENTRY, so a large vault never blocks the process that draws. The
 synchronous twin (vaultFor) retired 2026-08-10: its one render caller
 moved to warmRows, and a builder nothing calls is the zero-caller disease
 this file was caught by twice already.

 AND THE VAULT IS KEPT CURRENT FROM HERE ON. live() existed with zero
 callers until 2026-08-09: the vault was built on the first render and
 never touched again, and an edited note showed its old row until restart.

 A WATCHER IS SOUND HERE AND IS NOT SOUND FOR THE DOOR. The vault feeds a
 RENDER, and a repaint arriving a few milliseconds late costs nobody
 anything. A claim's green cannot tolerate the same gap, which is why
 engine/notes.ts stats instead. Different guarantee, different mechanism.

## The expression language is three things

A QUERY IS TEXT AND THE ANSWER IS A VALUE, and between them sit three jobs
that share nothing but the tree they hand along:

- LEXING AND PARSING turns source into a syntax tree. It knows the operators
  and the precedence and nothing at all about what a value means.
- THE VALUES are what the language can hold: a duration, a link, a date, a
  number, text. What a thing IS, when two are equal, how they order, how each
  reads back. The evaluator leans on all of it and none of it leans back.
- EVALUATION walks the tree against a context and calls the registered
  globals and methods.

WHY THE SPLIT IS SAFE. The dependency runs one way at every step — parse
knows nothing of values, values know nothing of evaluation — so nothing here
needs a cycle to work, and a file that imports the wrong half will not
compile.
