---
id: i3-m7-meets-need
statement: Meets the need. Validated against ALL needs across every iteration (regression), demonstrated by the success criteria.
milestone: M7
validates: needs
class: review
killer: true
depends_on: [i3-m6-gate]
---

## Rationale (not load-bearing)
Subtask of milestone M7. Human judgment. Gated behind i3-m6-gate (milestone-monotonic). Validation
checks every need across all iterations — not just this iteration's — so shipping new work cannot
silently break an old need. (Verification's counterpart is tests-pass, which runs every test globally.)
