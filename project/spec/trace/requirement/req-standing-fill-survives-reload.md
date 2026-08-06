---
id: req-standing-fill-survives-reload
type: "[[requirement]]"
statement: "When a state reopens after a reload, the engine shall keep every filled entry that still satisfies the corrected guidance standing unchanged."
kind: functional
verify_method: test
breaks_if_removed: "A reload wipes finished work, so correcting the method costs redoing everything already earned, and nobody corrects the method."
refines:
  - uc-change-the-method-mid-walk
source_refs:
  - uc-change-the-method-mid-walk step 5
priority: should
---
