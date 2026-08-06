---
id: req-tour-shows-live-instances
type: "[[requirement]]"
statement: While a tour stop runs, the tour shall show a live instance of the named kind rather than a general description.
kind: functional
verify_method: demonstration
breaks_if_removed: The tour becomes a lecture; the newcomer meets descriptions instead of the machinery.
refines:
  - uc-learn-the-machinery
source_refs:
  - uc-learn-the-machinery step 4
priority: should
---
