---
id: se.raid-shallow-clone-loses-record
kind: raid
statement: A shallow clone (--depth) or a clone without tags cannot reach the withheld record, even though the working tree looks complete - the claims are all present, so nothing signals that the evidence behind them is unreachable. Partial clone (--filter=blob:none) is SAFE by contrast, because blobs fetch on demand, and it is already the design's stated preference for cloud sessions.
provenance:
  iteration: i5d-close-merge-split
  ai_involvement: agent-drafted
raid_kind: risk
raid_owner: agent
trigger: "The first cloud session or CI checkout that clones this repository. Fallback: use --filter=blob:none, never --depth, and always fetch tags. Close when the clone recipe is recorded where a fresh session will read it."
---


