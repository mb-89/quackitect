---
id: req-engine-runs-from-one-folder
type: "[[requirement]]"
statement: "Where the engine is vendored inside a host repository, the engine shall run with every resource it serves resolving from inside its one vendored folder."
kind: functional
verify_method: demonstration
breaks_if_removed: "Engine files scatter across the host repository, so replacing the engine as one whole folder stops being possible."
refines:
  - uc-vendor-and-overlay
source_refs:
  - uc-vendor-and-overlay step 1
  - ".se/req-mine-v1.md: lifecycle and distribution (the binary embeds no data; every resource resolves from the live layer beside it)"
priority: should
---
