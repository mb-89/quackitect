---
id: req-overlay-lives-above-engine
type: "[[requirement]]"
statement: "Where a builder declares an overlay folder in the host repository, the engine shall load guidance, method cards and rigor rows from that folder with zero changes to files under the engine's folder."
kind: functional
verify_method: test
breaks_if_removed: "Builder method content has nowhere to live except under the engine's folder, which forks the engine."
refines:
  - uc-vendor-and-overlay
source_refs:
  - uc-vendor-and-overlay step 3
priority: should
---

## Detail

## Detail

| artifact class | overlay acts |
| --- | --- |
| guidance chapters | add a new one, replace an engine one |
| method cards | add a new one, replace an engine one |
| rigor rows | add a new one, replace an engine one outright (req-overlay-replaces-outright) |
