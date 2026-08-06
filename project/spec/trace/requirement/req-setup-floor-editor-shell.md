---
id: req-setup-floor-editor-shell
type: "[[requirement]]"
statement: The setup script shall complete on a computer holding only an editor and a shell, installing every further dependency itself.
kind: functional
verify_method: test
breaks_if_removed: Setup silently assumes tools a fresh machine lacks and the one-script promise fails off the dev box.
refines:
  - uc-install-quackitect
source_refs:
  - uc-install-quackitect precondition
  - uc-install-quackitect step 1
  - ".se/req-mine-v2.md: distribution (v2-098)"
priority: should
---
