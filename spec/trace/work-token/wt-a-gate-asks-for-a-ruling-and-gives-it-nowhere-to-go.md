---
id: wt-a-gate-asks-for-a-ruling-and-gives-it-nowhere-to-go
type: "[[work-token]]"
statement: |-
  A gate asks for a ruling and gives it nowhere to go

  `M3_90_gate-requirements` carries `evidence: []` at line 21. Its guidance at
  lines 69 to 71 asks for a real judgement: read `quality_groups_swept` from
  write-requirements, and rule on every gap it names. Each gap stays open with a
  stated reason, or a row is owed before the gate blesses.

  EVERY OTHER GATE THAT ASKS A JUDGEMENT GIVES IT A FIELD. `gate-candidates` has
  `reasons_hold`. This one has none, so the adjudication its guidance demands is
  written nowhere and nothing can refuse its absence.

  THE ROW DEFENDS THE ASK AT LINE 73, calling it a real judgement that can say
  no. So the empty evidence list is the mismatch, not the guidance.

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

A gate asks for a ruling and gives it nowhere to go

`M3_90_gate-requirements` carries `evidence: []` at line 21. Its guidance at
lines 69 to 71 asks for a real judgement: read `quality_groups_swept` from
write-requirements, and rule on every gap it names. Each gap stays open with a
stated reason, or a row is owed before the gate blesses.

EVERY OTHER GATE THAT ASKS A JUDGEMENT GIVES IT A FIELD. `gate-candidates` has
`reasons_hold`. This one has none, so the adjudication its guidance demands is
written nowhere and nothing can refuse its absence.

THE ROW DEFENDS THE ASK AT LINE 73, calling it a real judgement that can say
no. So the empty evidence list is the mismatch, not the guidance.

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
