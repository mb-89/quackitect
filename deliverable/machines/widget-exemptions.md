---
id: widget-exemptions
statement: The engine files allowed to emit widget markup without being named by the editor registry, each with the reason.
---

# widget-exemptions — the declared hatch in the widget guard

## What this file is for

ONLY A MODULE THE EDITOR REGISTRY NAMES MAY EMIT WIDGET MARKUP. That is the
rule the widget guard enforces, and `spec/trace/element/el-widget-guard.md`
carries why.

SOME FILES EMIT MARKUP AND ARE NOT A SECOND SURFACE. A test fixture, a
diagnostic page and a vendored component are the three the design named. Each
is a real exception rather than a hole in the rule.

THIS FILE IS THE HATCH, AND IT IS DECLARED. A hatch nobody can find is the same
as no hatch, so the list lives here where a person can read it rather than
inside the engine as a constant.

## How to add one

ONE BULLET PER FILE, in the section below. The shape is the path, then an
em dash, then the reason.

    - deliverable/engine/<file>.ts — why this one is not a second surface

THE REASON IS NOT DECORATION. It is what a reviewer reads to decide whether the
exemption still holds. A bullet with no reason is ignored by the reader, on
purpose.

THE PATH IS ROOT-RELATIVE, and it starts `deliverable/engine/`.

## The list

ONE EXEMPTION STANDS, and it is the diagnostic page the design named. The other
two cases the design predicted — a test fixture and a vendored component — turn
out not to exist here.

TEST FILES ARE NOT SCANNED AT ALL. The predicate walks `deliverable/engine/`
only, so a fixture under `deliverable/tests/` never needed an entry.

THE RULE CHANGED ON 2026-08-23 and most of the list went away with it. It used
to ask whether the editor registry named a module, which flagged 21 files. It
now asks whether the VS Code panel REACHES the file, which is the owner's own
wording, and that left three. Two of the three were folded into the surface;
this one is the exception.

<!-- exemptions below this line -->
- deliverable/engine/bin/mermaid-check.ts — a diagnostic page a maintainer opens to see whether the diagrams in a document parse. It renders nothing about the walk and the panel never reaches it.
