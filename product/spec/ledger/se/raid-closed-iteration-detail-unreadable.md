---
id: se.raid-closed-iteration-detail-unreadable
kind: raid
statement: After a filtered close, an iteration's evidence, machines and state are no longer on disk, and NO reader resolves them from git yet - that is i5e's job. R12 guarantees only that the grant index survives on trunk, and the check proves the FILE survives; it does NOT prove that projectState or the board actually lists a closed iteration from that index. So a closed iteration may be listable in principle and still absent from the board in practice, until i5e teaches the readers to resolve archived iterations from tags.
provenance:
  iteration: i5d-close-merge-split
  ai_involvement: agent-drafted
raid_kind: issue
raid_owner: agent
trigger: The first close performed by this engine. Close in i5e, which rewires projectState and the board to resolve archived iterations from git with an immutable cache; until then, verify by eye that a freshly closed iteration still appears in the board's list.
---


