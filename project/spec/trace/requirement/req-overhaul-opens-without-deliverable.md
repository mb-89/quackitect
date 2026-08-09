---
id: req-overhaul-opens-without-deliverable
type: "[[requirement]]"
statement: When the person asks for an overhaul, the engine shall open one that owes no deliverable and creates no project record.
kind: functional
verify_method: demonstration
breaks_if_removed: Method upkeep needs a fake feature to hang on, or opens project records nobody asked for.
breaks_how_badly: abrasive
refines:
  - uc-let-the-system-catch-up
source_refs:
  - uc-let-the-system-catch-up step 1
priority: should
---
