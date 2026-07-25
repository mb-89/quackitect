---
id: se.raid-tags-not-pushed
kind: raid
statement: "Git does not push tags by default, and after the close-and-merge split the iteration tag is the ONLY handle on an iteration's record. A plain `git push` therefore sends the live claims and none of the record: the remote, and any fresh clone from it, would hold a ledger whose evidence pointers resolve to nothing. The owner performs every push by hand, so nothing mechanical catches this today."
provenance:
  iteration: i5d-close-merge-split
  ai_involvement: agent-drafted
raid_kind: risk
raid_owner: owner
trigger: "Any push of this repository. Mitigation: push with --follow-tags (or an explicit --tags). Close this entry when the push guidance the owner follows names the flag, and a clone of the remote can resolve an evidence pointer through its tag."
---


