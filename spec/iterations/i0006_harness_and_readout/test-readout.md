---
id: test-readout
type: test
verifies: [req-progress-bar, req-handover-pager, req-readout-width]
statement: Selftest asserts the progress bar and handover one-pager render deterministically (identical bytes for identical inputs), contain the required sections (START/milestones/END; decisions/risks/readiness/bless line), and every line is <=72 columns inside a code fence.
class: review
verify: selftest:readout
killer: false
---
## Rationale (not load-bearing)
i0006 test. Selftest built in M4; RED until then.
