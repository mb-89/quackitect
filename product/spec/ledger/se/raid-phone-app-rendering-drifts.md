---
id: se.raid-phone-app-rendering-drifts
kind: raid
statement: Every phone-side behaviour rests on how one third-party app renders and fires actions. An update that drops the view action, changes the tap semantics, or alters action limits would degrade the rung with no server-side symptom - the publish would still return 200.
provenance:
  iteration: i8d-phone-brief
  ai_involvement: agent-drafted
raid_kind: risk
raid_owner: agent
trigger: "A card arriving without its actions, or a tap that stops returning a grant. Fallback: the two direct actions are the floor, so a lost view action costs the brief and not the decision; because acceptance is a real tap, the failure surfaces the next time a human adjudicates rather than silently."
---


