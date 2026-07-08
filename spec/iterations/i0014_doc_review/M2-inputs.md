# M2 - Design input (i0014_doc_review, lean)

TL;DR: 23 requirements, distilled from the 19 field notes of the first returned book copy plus three owner rulings. Every requirement is EARS-shaped, faceted, and carries its source comment ids in the rationale. Both derived coverage rules compute green.

## Requirements stated, each checkable  -> i14-m2-reqs-stated

The set, grouped by use-case:

- [uc-book-navigate](uc-book-navigate.md) - 4:
  - [req-shell-title-card](req-shell-title-card.md) (c1)
  - [req-sidebar-order](req-sidebar-order.md) (c3)
  - [req-section-paging](req-section-paging.md) (c7)
  - [req-search-hitlist](req-search-hitlist.md) (c19)
- [uc-book-tables](uc-book-tables.md) - 8:
  - [req-reader-columns](req-reader-columns.md) (c11, c12, c17, c18, c22, c29, c31)
  - [req-table-render](req-table-render.md) (c10, c37, c40)
  - [req-table-noise](req-table-noise.md) (c27, c30)
  - [req-table-interact](req-table-interact.md) (c21)
  - [req-glossary-table](req-glossary-table.md) (c43)
  - [req-ref-tooltips](req-ref-tooltips.md) (c39)
  - [req-ch6-no-graph](req-ch6-no-graph.md) (c41)
  - [req-icon-density](req-icon-density.md) (c14)
- [uc-book-content](uc-book-content.md) - 9:
  - [req-agent-guide-ch8](req-agent-guide-ch8.md) (c4, c5, c6)
  - [req-ch8-audience-subchapters](req-ch8-audience-subchapters.md) (c42)
  - [req-ch3-ucfn-merge](req-ch3-ucfn-merge.md) (c25)
  - [req-need-expand](req-need-expand.md) (c24, defect)
  - [req-system-overview](req-system-overview.md) (c35, ruled in scope)
  - [req-seed-examples](req-seed-examples.md) (c20, c23, c26, c32)
  - [req-prose-rework](req-prose-rework.md) (c8, c15)
  - [req-derived-prose](req-derived-prose.md) (owner ruling: derived over authored)
  - [req-compact-renders](req-compact-renders.md) (c33, c34, c36; ruled: discuss late)
- uc-comment-annotate (existing, i0013) - 1:
  - [req-comment-persist](req-comment-persist.md) (c5)
- uc-book-present (existing, i0012) - 1:
  - [req-deck-views-section](req-deck-views-section.md) (c44)

**Checkable.** Every statement is EARS-shaped with shall. `quack lint` on 2026-07-07 reports zero EARS violations, zero duplicate ids, zero wiring faults. The 23 "no design" holes are the expected pre-build state; the book-drift line resolves at ship.

**Not requirements, on record:**

- c46 (comment sidebar order) is a defect under the existing req-comment-sidebar - a build step.
- c16, c28, c45 rejected: text-less artifacts.
- c2 (agent-guide wording) rides req-agent-guide-ch8 + req-prose-rework via the bs20 dogfood note.

## Requirements traced / verifiable  -> derived checks

23 of 23 refine a use-case chaining to need-docu (via the connections lanes); 23 of 23 carry a test: 19 executed selftests, 4 review residues (doc-tests rule: mechanize what is mechanizable, the rest stays review). Both rules compute live.

## Milestone review  -> i14-m2-gate

**Verify.** Each requirement's rationale names its field comment(s); the statements match the triaged notes; the derived checks compute green.
**Validate.** The set covers all eight M1 themes; nothing in it exceeds the book-and-substrate scope; the parked items (oversized renders) are IN the set but ordered last per the owner ruling.
**Red-team.** Opposing case: "23 requirements is scope creep for lean." Held against the checklist: each maps to concrete field pain, none is speculative; the four review residues carry the judgment honestly instead of faking executed checks. Kill-criterion: a requirement whose fix breaks the single-file book steps back to design discussion.
**Verdict: PASS** - proceed to the gate bless.
