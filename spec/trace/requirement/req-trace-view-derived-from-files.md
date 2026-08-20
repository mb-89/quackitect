---
minted_in: i1
id: req-trace-view-derived-from-files
type: "[[requirement]]"
statement: The engine shall derive every trace view from the node files alone, with zero truth stored only in the view.
kind: functional
verify_method: analysis
breaks_if_removed: The screen shows a chain the files cannot back, and the view drifts from truth.
breaks_how_badly: crippling
refines:
  - uc-trace-a-decision-to-its-origin
source_refs:
  - uc-trace-a-decision-to-its-origin guarantee
  - ".se/req-mine-v1.md: the ledger and truth"
  - ".se/req-mine-sebots.md: state — derived, append-only, on disk"
priority: should
weighs_against:
  - req-upward-links-live-in-the-file >
---
