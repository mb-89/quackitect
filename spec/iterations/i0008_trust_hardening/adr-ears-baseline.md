---
id: adr-ears-baseline
type: adr
addresses: [req-ears-lint]
adjudicated_by: human
statement: Forward-only EARS discrimination uses a committed baseline corpus — the stmtHash of every requirement existing at feature-land; lint checks only requirements whose current stmtHash is absent from the baseline (new or genuinely re-stated), so blessed history is structurally unflaggable — chosen over attest-lineage reconstruction (complex, indirect) and iteration-order scoping (misses edited old statements).
depends_on: []
class: review
killer: true
---
## Rationale (not load-bearing)
One diffable file, one deterministic set-membership test. Tamper-hardening the baseline itself belongs to the deferred evidence-into-merkle work.
