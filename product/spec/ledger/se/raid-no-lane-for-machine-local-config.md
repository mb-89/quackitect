---
id: se.raid-no-lane-for-machine-local-config
kind: raid
statement: "THERE IS NO TOOL FOR THE MACHINE-LOCAL SE CONFIG. ~/.se/<project>/ holds phone.json (the pairing) and now brief.json (the store credentials), and nothing on the se surface reads, writes, validates or reports them - se_file_* is product-scoped and refuses paths outside it. So enabling the brief store during i8d could only be done by a hand-rolled script, and an OWNER enabling it has no lane either: they hand-write JSON and find out whether it worked by watching a card fail to carry a link. Owner 2026-07-25: 'for the local SE config, why didn't you use the tools that we have?' - because they do not exist. Note that this gap also hides se.raid-brief-store-unconfigured-is-silent: with no tool to report config state, a typo and a deliberate opt-out look identical from every surface."
provenance:
  iteration: i8d-phone-brief
  ai_involvement: agent-drafted
  adjudicated_by: owner
  channel: chat
raid_kind: issue
raid_owner: agent
trigger: "Open now; routed to i9. Fix: an se_config tool over the machine-local dir - show (with secrets masked, never printed), set, and VALIDATE against each consumer's whitelist so a rejected field says which one and why. It closes three things at once: the agent stops scripting, the owner gets a real enablement surface, and the silent-typo risk gets its voice. The QR pairing (engine/connect.ts) already writes phone.json, so the write half exists as a special case and wants generalizing rather than inventing."
---


