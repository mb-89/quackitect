---
id: req-reload-restarts-on-disk-sources
type: "[[requirement]]"
statement: "When a reload is requested, the engine shall restart the machine from the sources as they stand on disk, serving zero content compiled before the reload."
kind: functional
verify_method: test
breaks_if_removed: "A stale compile keeps serving the guidance that was just judged wrong, and the correction never reaches the walk."
refines:
  - uc-change-the-method-mid-walk
source_refs:
  - uc-change-the-method-mid-walk step 3
  - ".se/req-mine-v2.md: v2-091 compile-at-load"
  - ".se/req-mine-v2.md: v2-004 hot reload"
priority: must
---
