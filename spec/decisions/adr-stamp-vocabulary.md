---
id: adr-stamp-vocabulary
decided_in: i0010_engine_workshop
type: adr
adjudicated_by: human
statement: Prose, prompts, and CLI display strings say user (or the role). The recorded actor stamps (actor=human, --by human) are a FROZEN metric vocabulary: records are historical facts and the self-cert metric needs one vocabulary across all history. The allowlist is exactly these recorded tokens.
class: review
killer: false
---
## Rationale (not load-bearing)
The freeze is a BRIDGE, not an end state (owner-directed 2026-07-04): the frozen vocabulary
is on the geronticide kill-list — a dedicated future iteration renames the recorded stamps to
`user` with a proper ledger migration. Churn-aversion did not decide this; the rename simply
deserves its own migration walk instead of riding a workshop iteration. Until then the
allowlist for the user-wording sweep is exactly the recorded tokens.
