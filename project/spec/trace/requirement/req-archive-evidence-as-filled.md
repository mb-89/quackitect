---
id: req-archive-evidence-as-filled
type: "[[requirement]]"
statement: "When an archived state is opened, the engine shall show its evidence form exactly as it was filled at close, with zero bytes differing from the closed version."
kind: functional
verify_method: test
breaks_if_removed: "What the gate blessed and what the archive shows drift apart, and the audit trail lies."
refines:
  - uc-browse-the-archive
source_refs:
  - uc-browse-the-archive step 4
  - ".se/req-mine-v1.md: the ledger and truth"
priority: must
---
