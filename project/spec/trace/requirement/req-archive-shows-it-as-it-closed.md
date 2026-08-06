---
id: req-archive-shows-it-as-it-closed
type: "[[requirement]]"
statement: "When an archived record is opened, the engine shall show it exactly as it stood at close, with zero states omitted and zero bytes differing."
kind: functional
verify_method: test
breaks_if_removed: "The archive becomes a retelling instead of a record, and answering for old work stops being possible."
refines:
  - uc-browse-the-archive
source_refs:
  - uc-browse-the-archive step 3
  - uc-browse-the-archive ext 3a
  - uc-browse-the-archive step 4
  - ".se/req-mine-v1.md: the ledger and truth"
  - uc-browse-the-archive step 5
  - ".se/req-mine-v2.md: gates, offers and grants"
  - uc-browse-the-archive ext 5a
priority: must
---

## Detail

Everything the archived view owes:

- When an archived record is opened, the engine shall draw every state as it finished, with the walked route visible and zero states omitted.
- When an archived state is opened, the engine shall show its evidence form exactly as it was filled at close, with zero bytes differing from the closed version.
- When an archived gate is opened, the engine shall show its rounds, its verdict, and the blessing hand with the day.
- Where a gate's input moved after its bless, the archive shall show the suspect mark and its reason beside the bless, never in place of it.
