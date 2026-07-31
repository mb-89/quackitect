---
kind: matrix-row
name: finalize-docs
statement: "Finalize the docs: the book emits as a projection; docs match the shipped surface."
state_kind: work
filled_by: agent
depends_on:
  - gate-validation
legal_tools:
  - se_file_read
  - se_file_write
  - se_file_patch
  - se_file_search
  - se_file_glob
  - se_file_list
  - se_log_query
  - se_answer
  - se_lint
evidence:
  - name: docs
    description: "the emitted set and the match against the surface"
major: full
minor: full
patch: none
product: full
specification: full
major_note: |
  Applies in full: the book emits and is read against the actual surface.
  A major is precisely when the documentation earns its keep.
minor_note: |
  Applies: the book re-emits at every minor - the accumulated patches
  ride along - and the emitted set is read against the actual surface.
patch_note: |
  Does not apply. The book does not re-emit per patch; the next minor or
  major emit carries the accumulated patches. The sweep already fixed the
  teaching surfaces. STRIKE PROPOSAL - owner adjudicates.
product_note: |
  STANDING ARTIFACT: THE BOOK - the full documentation, emitted
  deterministically from the spec sources, published copies byte-equal to
  a fresh render, nothing orphaned. The product column of this whole
  matrix is, in the end, what the book must contain.
specification_note: |
  DOCUMENT FORM: this row's output IS the document - the book, emitted
  deterministically: chapters from manifests, order from the toc, tables
  from queries, figures derived, glossary from used terms, provenance
  marks throughout, published copies byte-equal (drift law), nothing
  orphaned (orphan law). Harvest v1's book pipeline as the reference
  implementation.
---

## Guidance

The book is the ship-time report; the live board is the everyday one - there is no separate report artifact. Emit, then read what emitted against the actual surface. Then scrutinize the emitted set as a DOCUMENT: is prose missing or bad, does every stakeholder find what they need, do the Diátaxis modes stay apart ([[meth-doc-quality]]).
