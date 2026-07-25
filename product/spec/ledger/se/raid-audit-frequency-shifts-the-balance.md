---
id: se.raid-audit-frequency-shifts-the-balance
kind: raid
statement: "The split accepts one cost explicitly: a cross-iteration audit over gate CONTENTS means walking N tags instead of running one query. That is acceptable while audits are rare and the thin grant index on trunk answers the common questions (which channel, which iteration, which state). If content-level audits ever became routine - or a downstream regulated context adopted this - the balance would shift back towards keeping more on trunk."
provenance:
  iteration: i5d-close-merge-split
  ai_involvement: agent-drafted
raid_kind: assumption
raid_owner: owner
trigger: "Content-level audits becoming routine, or a downstream/regulated context adopting SE. Fallback: the grant index can carry more INDEX fields without carrying content, per se.adr-grant-index-stays-on-trunk."
---


