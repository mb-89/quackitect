---
id: req-overlay-identity-shared
type: "[[requirement]]"
statement: "The engine and the builder overlay shall resolve method artifacts through one shared identity scheme, where a card's identity alone decides which engine card it replaces."
kind: interface
verify_method: test
breaks_if_removed: "Replacement keys on file paths, so an engine reshuffle breaks every overlay without a single rename."
refines:
  - uc-vendor-and-overlay
source_refs:
  - uc-vendor-and-overlay step 4
  - uc-vendor-and-overlay ext 4a
  - uc-vendor-and-overlay ext 6a
priority: could
---

## Detail

## Detail

The two sides and their owners:

- the builder owns the overlay folder's content and the identities it names.
- the engine owns the resolution chain and the identity match.
- the identity alone decides replacement; the file path never does.
