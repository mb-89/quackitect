---
id: i21-judgment-benjamin-as-the-kb-module-the-k
status: seeded
opened: 2026-08-12T19:46:10.572Z
goal: "JUDGMENT — Benjamin as the kb module: the knowledge base becomes its own module, and the first real test of module-qualified ids beyond se."
vision: |-
  NEEDS THE OWNER. Benjamin is his queued thread and an unsolved problem he has raised repeatedly. The design discussion is the front half of this iteration.

  WAITS ON i10, in practice. Modules are the handle the owner reached for, and until ids carry their qualifier there is no second module to be.

  WHAT IS SETTLED: Benjamin becomes its own thing, a module called kb, for knowledge base. It is the SECOND module, so it is also the first honest test of whether module-qualified ids and the import-and-overlay layout actually work for something that is not se.

  WHAT v2 DESIGNED, from project/V2-INVENTORY.md. A local-first knowledge base with a SOURCE AND DIGEST SPLIT. Three privacy tiers — no-remote, private, shareable — where THE INDEX INHERITS THE TIER. Provenance classes. A mandatory canonical source identity. Wings as a content-dependency kind with a fat manifest. Personal tasks as a directed graph. Recurrence as seeding with hash-idempotent instances.

  Its corpus facts, recorded: buecher at 6,337 PDFs, all no-remote, with 11 adoptable digests; sya_kb work-internal; a sebot corpus at 7.2 GB with full-text search.

  THE PRIVACY TIERS ARE THE PART THAT BINDS US. The owner has already ruled that raw notes never enter version control because they can carry private data, and that a hosted speech-to-text service would send his words off the machine. A knowledge base over 6,337 no-remote PDFs is the same question at scale, and the tier design exists precisely for it.

  THE MODULE LAYOUT IS ALREADY DECIDED, from v1: modules/kb/import is a mirror and never hand-edited, modules/kb/overlay is ours and import never touches it, and module.toml records provenance. Import plans deterministic file operations with dry run as the default review surface.

  ONE CONSTRAINT WORTH CARRYING: modules share one workspace iteration and one ledger. They scope ownership and views; they do NOT create independent timelines. So kb does not get its own gates or its own iteration state.

  FULL CONTEXT: project/spec/version-planning.md, section J3.
inputs:
  - project/spec/version-planning.md
  - i10-the-big-sweep-one-pass-over-one-key-a-mo
  - project/V2-INVENTORY.md
---

# i21-judgment-benjamin-as-the-kb-module-the-k

## Goal

JUDGMENT — Benjamin as the kb module: the knowledge base becomes its own module, and the first real test of module-qualified ids beyond se.

## Rough vision

NEEDS THE OWNER. Benjamin is his queued thread and an unsolved problem he has raised repeatedly. The design discussion is the front half of this iteration.

WAITS ON i10, in practice. Modules are the handle the owner reached for, and until ids carry their qualifier there is no second module to be.

WHAT IS SETTLED: Benjamin becomes its own thing, a module called kb, for knowledge base. It is the SECOND module, so it is also the first honest test of whether module-qualified ids and the import-and-overlay layout actually work for something that is not se.

WHAT v2 DESIGNED, from project/V2-INVENTORY.md. A local-first knowledge base with a SOURCE AND DIGEST SPLIT. Three privacy tiers — no-remote, private, shareable — where THE INDEX INHERITS THE TIER. Provenance classes. A mandatory canonical source identity. Wings as a content-dependency kind with a fat manifest. Personal tasks as a directed graph. Recurrence as seeding with hash-idempotent instances.

Its corpus facts, recorded: buecher at 6,337 PDFs, all no-remote, with 11 adoptable digests; sya_kb work-internal; a sebot corpus at 7.2 GB with full-text search.

THE PRIVACY TIERS ARE THE PART THAT BINDS US. The owner has already ruled that raw notes never enter version control because they can carry private data, and that a hosted speech-to-text service would send his words off the machine. A knowledge base over 6,337 no-remote PDFs is the same question at scale, and the tier design exists precisely for it.

THE MODULE LAYOUT IS ALREADY DECIDED, from v1: modules/kb/import is a mirror and never hand-edited, modules/kb/overlay is ours and import never touches it, and module.toml records provenance. Import plans deterministic file operations with dry run as the default review surface.

ONE CONSTRAINT WORTH CARRYING: modules share one workspace iteration and one ledger. They scope ownership and views; they do NOT create independent timelines. So kb does not get its own gates or its own iteration state.

FULL CONTEXT: project/spec/version-planning.md, section J3.

## Inputs

- project/spec/version-planning.md
- i10-the-big-sweep-one-pass-over-one-key-a-mo
- project/V2-INVENTORY.md

## Carried work tokens

These stood in the options pool referenced by no iteration at all. Assigned
here in a pass over the pool.

- wt-a-searcher-asks-one-question-and-comes-back-with-four-good-a
- wt-big-investigations-belong-in-the-knowledge-base-rather-than-
