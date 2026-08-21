---
steps:
  - id: shared-test-helpers
    statement: Consolidate repeated test helpers into the shared test helper module and migrate the named local copies.
    depends_on: []
    realization: code
  - id: share-refusal-boots
    statement: Share refusal-only server setup in the named test cases without changing their asserted behavior.
    depends_on:
      - shared-test-helpers
    realization: code
  - id: repair-fallback-outcome
    statement: Retarget fallback-outcome assertions to frontmatter YAML and remove the stale guard assumption.
    depends_on: []
    realization: code
  - id: guard-test-hygiene
    statement: Extend testlint for shared helper ownership and duplicate test names, then remove authorized obsolete test fixtures and helpers.
    depends_on:
      - shared-test-helpers
    realization: code
---
