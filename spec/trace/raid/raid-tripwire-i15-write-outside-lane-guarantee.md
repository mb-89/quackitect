---
unreachable_refs:
  - cand-explicit-and-safe
  - cand-fast-path-plus-blocking
minted_in: i15-the-database-our-own-reader-over-obsidia
id: raid-tripwire-i15-write-outside-lane-guarantee
type: "[[raid]]"
kind: risk
statement: credible flip — cand-fast-path-plus-blocking over cand-explicit-and-safe on req-query-is-deterministic, if the write-outside-the-lane guarantee (every corpus-changing write goes through the lane, no exception) is hardened from observed to verified system-wide.
owner: the driving agent
trigger: if M6/M7 ever reopens candidate selection for cluster-the-query
status: open
breaks_how_badly: crippling
how_likely: plausible
impact: the winner's margin over its closest rival on this axis rests on a guarantee the rival's own record names as unverified; hardening it elsewhere in the system would flip this cell without anyone touching i15's own work.
source_refs:
  - spec/iterations/i15-the-database-our-own-reader-over-obsidia/evidence/reverse-sensitivity.md
  - cand-fast-path-plus-blocking
  - cand-explicit-and-safe
  - req-query-is-deterministic
---

## Fallback

If the "every write goes through the lane" guarantee is ever formally
verified (not just observed to hold this session), re-run converge-pugh
before assuming the winner's seat is still stable.
