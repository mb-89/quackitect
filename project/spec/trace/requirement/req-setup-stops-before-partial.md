---
id: req-setup-stops-before-partial
type: "[[requirement]]"
statement: If a tool the setup needs is missing, then the script shall stop before changing anything and shall name each missing tool and where to get it.
kind: functional
verify_method: test
breaks_if_removed: Setup dies part-way and leaves a half-installed machine with no named fix.
refines:
  - uc-install-quackitect
source_refs:
  - uc-install-quackitect ext 2a
priority: should
---
