---
id: wt-a-row-says-the-engine-fills-it-then-asks-a-hand-for-judgemen
type: "[[work-token]]"
statement: |-
  A row says the engine fills it, then asks a hand for judgement

  `M7_50_verification` declares `filled_by: engine`. Its statement says the
  battery runs mechanically, and its evidence description says the battery is the
  engine's and needs no field.

  BUT THE ROW CARRIES A `claims` CHECKLIST the agent must check per non-test
  spec, and its guidance demands a spawned tester subagent with fresh context
  that reads the card and the specs and then verifies, held as a gatekeeper
  across the fix-findings rounds.

  THAT IS A SUBSTANTIAL AGENT-ANSWERED JUDGEMENT on a row whose `filled_by` says
  no agent fills it. Anything reading `filled_by` to decide whether a hand is
  needed here concludes none is.

  HOW THIS WAS FOUND. Four hands read every rigor-matrix row in full on
  2026-08-28 to rate its complexity. Reading a row properly turns up things that
  reading it casually does not, and this is one of them.

  IT IS A DEFECT IN THE ROW, NOT A RATING. A rating says how hard a step is.
  This says the row contradicts itself: a demand with nowhere to record its
  answer, a headline the row's own guidance denies, a promise nothing keeps.

  IT NAMES ITS FILE AND LINE, so a reader checks rather than trusts.

  ONE THING WAS CHECKED AND IS NOT A DEFECT. M7_50_verification's legal_tools is
  a bare comma-separated scalar where every other row uses a YAML block list.
  asList in deliverable/engine/machines/compile.ts line 454 documents and handles
  exactly that form, so it parses correctly. Recorded because it looks wrong and
  is not, so the next reader does not spend the same time.
place: backlog
ready_when: ready when a building milestone pulls hygiene work
---

## Why it stands

A row says the engine fills it, then asks a hand for judgement

`M7_50_verification` declares `filled_by: engine`. Its statement says the
battery runs mechanically, and its evidence description says the battery is the
engine's and needs no field.

BUT THE ROW CARRIES A `claims` CHECKLIST the agent must check per non-test
spec, and its guidance demands a spawned tester subagent with fresh context
that reads the card and the specs and then verifies, held as a gatekeeper
across the fix-findings rounds.

THAT IS A SUBSTANTIAL AGENT-ANSWERED JUDGEMENT on a row whose `filled_by` says
no agent fills it. Anything reading `filled_by` to decide whether a hand is
needed here concludes none is.

HOW THIS WAS FOUND. Four hands read every rigor-matrix row in full on
2026-08-28 to rate its complexity. Reading a row properly turns up things that
reading it casually does not, and this is one of them.

IT IS A DEFECT IN THE ROW, NOT A RATING. A rating says how hard a step is.
This says the row contradicts itself: a demand with nowhere to record its
answer, a headline the row's own guidance denies, a promise nothing keeps.

IT NAMES ITS FILE AND LINE, so a reader checks rather than trusts.

ONE THING WAS CHECKED AND IS NOT A DEFECT. M7_50_verification's legal_tools is
a bare comma-separated scalar where every other row uses a YAML block list.
asList in deliverable/engine/machines/compile.ts line 454 documents and handles
exactly that form, so it parses correctly. Recorded because it looks wrong and
is not, so the next reader does not spend the same time.

## When it comes back

ready when a building milestone pulls hygiene work
