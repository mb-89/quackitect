---
id: i17-the-options-pool-triage-a-raw-note-into-
status: seeded
opened: 2026-08-12T19:44:00.806Z
goal: "The options pool: triage a raw note into a committed, rewritten item that travels — so the pool survives a discarded experiment and every machine can see what it may pull from."
vision: |-
  DONE LOOKS LIKE: draining a note to backlog MINTS a new item in the repository, rewritten, stating the option and its ready-when, carrying no private data. The raw note stays local, stays private, and is marked drained. Another machine clones the repo and sees the pool.

  RAW NOTES NEVER ENTER VERSION CONTROL. They are dumps and can carry private data. That is a hard line and it does not bend.

  THE REWRITE IS THE PRIVACY BOUNDARY. It is also the value boundary: an option nobody can state cleanly for another machine was never an option, it was a stray. One act does both jobs. v1 did exactly this at its own crossing — its comment read-back printed note candidates WITH AUTHOR NAMES ALREADY REPLACED BY THE READER ROLE, and it refused a bulk importer outright because NOTHING ENTERS THE LEDGER WITHOUT JUDGMENT.

  THE CONCEPT HAS A NAME and it is better than "backlog". David Anderson's Kanban Method: a mature system has no backlog, it has a POOL OF OPTIONS. A backlog implies big-batch transfer; a pool of options implies individual commitment and single-piece flow. The COMMITMENT POINT is where you decide to deliver, and UPSTREAM KANBAN is the filtering before it, whose discipline he calls TRIAGE. The vendor tools do not help — Jira and Azure DevOps offer a Backlog list and a New state, with triage as a convention rather than a named stage.

  OUR THREE STAGES ALREADY MAP: raw capture is upstream of everything, the retro's drain IS the triage, what survives is the options pool, and seeding an option into an iteration is the commitment point.

  WE ALREADY HAVE THE TRIAGE. se_note_drain carries four dispositions, and draining to backlog already REQUIRES a where field naming the re-entry condition.

  THE TWO GAPS. A drained note is still the SAME LINE in .se/notes.jsonl with a disposition stamped on it, never rewritten into a separate item. And .se is gitignored, so all 205 current options are machine-local and no other machine can see the pool.

  A SECOND REASON, from v1 as a killer requirement: the backlog lives ABOVE iterations, on trunk, SO NOTES SURVIVE A DISCARDED EXPERIMENT. Travel is not the only argument; survival is the other.

  MIGRATE THE 205. They are drained notes today, carrying their original capture text. Each one that survives becomes an item, rewritten. Ones that cannot be stated cleanly go back to the owner as a list rather than being guessed at.

  THIS ITERATION RETIRES project/spec/version-planning.md. That file exists only because there is no options pool; when the pool lands, the plan dissolves into it and the file goes.

  FULL CONTEXT: project/spec/version-planning.md, section on notes and the options pool, and i17.

  FROM THE POOL, 2026-08-13. The criteria machinery, which is the other half of this iteration's subject.

  NINE ENGINE CAPABILITIES ARE OWED BEFORE ANY OF IT RUNS (note-6dbf5861616a). The method card and three rigor rows are written and NONE OF IT RUNS. The observed proof sits at the top: the axes table renders the criterion-pool source as literal text in a cell, so the row never expands, which alone proves the other eight are untested. TWO OF THE NINE REACH OUTSIDE THIS ITERATION and are checked before the shape is fixed. A list-valued column is UNVERIFIED against the node-table editor and could force a different shape entirely. Pagination and read-only cells are the live table's business, so i15 and i23 own the surface half. The rest: an item source resolving to every requirement plus every register entry, three frontmatter keys for the pairwise judgments, a column constrained to the item source so the editor offers a list rather than free text, a kind list so one table mixes node types, the preference-matrix arithmetic with its three checks - a cycle, a zero weight, an unjudged pair - and the derived read-only criteria table.

  HOW THE PAIRWISE IS ASKED, RESEARCHED (note-a3b10e1d75dd). THE PROBLEM IS THE COUNT: full pairwise over 60 items is 1770 questions, and the incomplete-AHP literature names that as the central objection. Every serious tool solves it the same way - infer by transitivity, and never ask a pair already implied. The house corpus agrees from its own side, since its direct-comparison method is an insertion walk and it states plainly that must-requirements are fulfilled anyway. THE COST IS NAMED AND IT IS THE PART TO BUILD FOR: transitive closure imposes consistency rather than checking it, so a cycle becomes undetectable. The mitigation is a spot check re-asking a small sample of implied pairs.

  A CUTOFF RIDES A ROW, SO CORRECTING THE ORDER SILENTLY REDRAWS THE BOUNDARY (note-6e2574c6839c). When the damage sort reached the page the marked row moved into the middle of its band and roughly twenty axes fell below the line. NOBODY DECIDED THAT. It is the stored-versus-derived shape a third time in one day, alongside the chart's picks and the criteria order. The fix has a precedent already in the system - a claim whose ground moved is reopened and re-earned, so a boundary whose order moved behaves the same. Record what the order WAS when the line was drawn, drop the cutoff when the computed order no longer matches, and refuse the submit until somebody draws it again. DO NOT SOLVE IT BY STORING A POSITION; a position is what was wrong in the first place.

  A COMPOUNDED AXIS IS REPRESENTED BY ITS ALPHABETICALLY FIRST MEMBER (owner ruling, note-e3c420ac103f), so an annoyance can sink a critical. Confirmed at the source: the union-find makes the root the smallest id, and nothing about damage enters that choice. THE RULE: the survivor of a compounded group is the member with the WORST damage, ties falling to the id. WHY WORST AND NOT BEST - the group measures one underlying thing, and what it costs to lose it is what the worst member says. Watch the stability requirement; worst-damage-then-id is as stable as id alone. NOT YET EXERCISED: no group in the current pool mixes damage levels, so the defect is in the rule rather than the result.

  THE DECISION MATRIX NEVER WRITES ITS OWN RUNS (note-5b9947aa1c4d). The template promises the runs written by the arithmetic, and the arithmetic never writes them, so the signed comparison is stored nowhere and only the raw scores persist. Four parts: the submit writes the runs from the scores so the evidence holds what the render shows; every cell carries its rationale, derived by joining the rival's anchor line against the datum's, so nobody types them twice; the rationale surfaces as a HOVER, keeping the matrix compact; an optional typed per-cell note covers judgment beyond the two anchors.

  THE CHART IS STILL A FREE TABLE over data the option nodes already carry (note-2719f46ccce5) - the second copy the derive-criteria rule exists to stop. It should be a node table over the options source, the same shape the assumptions form uses, and the shortlist has the same smell since a shortlisted combination is one option per cluster.

  THE CANDIDATES GATE STILL NAMES A STRUCK FIELD (note-3e33716d409c). Tensions reads as a separate mechanism and is not one - a tension between two roles is a risk in the register, and the line should name the register. The gate also fails to check what the pairwise design makes checkable: every pair judged, no contradiction between a pair and its reciprocal, no cycle, and every cut carrying its by-construction reason.

  AND THE 20 BACKFILLED REQUIREMENTS HAVE NO PAIRWISE JUDGMENTS (note-e0dcdfe20aee). The next criteria pass owes their insertions into the standing order.
inputs:
  - project/spec/version-planning.md
  - guidance/method/retro.md step 3
  - spec/decisions/notes-pipeline.md at ref main
  - note-622f174c9bed
  - note-fad135af8190
---

# i17-the-options-pool-triage-a-raw-note-into-

## Goal

The options pool: triage a raw note into a committed, rewritten item that travels — so the pool survives a discarded experiment and every machine can see what it may pull from.

## Rough vision

DONE LOOKS LIKE: draining a note to backlog MINTS a new item in the repository, rewritten, stating the option and its ready-when, carrying no private data. The raw note stays local, stays private, and is marked drained. Another machine clones the repo and sees the pool.

RAW NOTES NEVER ENTER VERSION CONTROL. They are dumps and can carry private data. That is a hard line and it does not bend.

THE REWRITE IS THE PRIVACY BOUNDARY. It is also the value boundary: an option nobody can state cleanly for another machine was never an option, it was a stray. One act does both jobs. v1 did exactly this at its own crossing — its comment read-back printed note candidates WITH AUTHOR NAMES ALREADY REPLACED BY THE READER ROLE, and it refused a bulk importer outright because NOTHING ENTERS THE LEDGER WITHOUT JUDGMENT.

THE CONCEPT HAS A NAME and it is better than "backlog". David Anderson's Kanban Method: a mature system has no backlog, it has a POOL OF OPTIONS. A backlog implies big-batch transfer; a pool of options implies individual commitment and single-piece flow. The COMMITMENT POINT is where you decide to deliver, and UPSTREAM KANBAN is the filtering before it, whose discipline he calls TRIAGE. The vendor tools do not help — Jira and Azure DevOps offer a Backlog list and a New state, with triage as a convention rather than a named stage.

OUR THREE STAGES ALREADY MAP: raw capture is upstream of everything, the retro's drain IS the triage, what survives is the options pool, and seeding an option into an iteration is the commitment point.

WE ALREADY HAVE THE TRIAGE. se_note_drain carries four dispositions, and draining to backlog already REQUIRES a where field naming the re-entry condition.

THE TWO GAPS. A drained note is still the SAME LINE in .se/notes.jsonl with a disposition stamped on it, never rewritten into a separate item. And .se is gitignored, so all 205 current options are machine-local and no other machine can see the pool.

A SECOND REASON, from v1 as a killer requirement: the backlog lives ABOVE iterations, on trunk, SO NOTES SURVIVE A DISCARDED EXPERIMENT. Travel is not the only argument; survival is the other.

MIGRATE THE 205. They are drained notes today, carrying their original capture text. Each one that survives becomes an item, rewritten. Ones that cannot be stated cleanly go back to the owner as a list rather than being guessed at.

THIS ITERATION RETIRES project/spec/version-planning.md. That file exists only because there is no options pool; when the pool lands, the plan dissolves into it and the file goes.

FULL CONTEXT: project/spec/version-planning.md, section on notes and the options pool, and i17.

FROM THE POOL, 2026-08-13. The criteria machinery, which is the other half of this iteration's subject.

NINE ENGINE CAPABILITIES ARE OWED BEFORE ANY OF IT RUNS (note-6dbf5861616a). The method card and three rigor rows are written and NONE OF IT RUNS. The observed proof sits at the top: the axes table renders the criterion-pool source as literal text in a cell, so the row never expands, which alone proves the other eight are untested. TWO OF THE NINE REACH OUTSIDE THIS ITERATION and are checked before the shape is fixed. A list-valued column is UNVERIFIED against the node-table editor and could force a different shape entirely. Pagination and read-only cells are the live table's business, so i15 and i23 own the surface half. The rest: an item source resolving to every requirement plus every register entry, three frontmatter keys for the pairwise judgments, a column constrained to the item source so the editor offers a list rather than free text, a kind list so one table mixes node types, the preference-matrix arithmetic with its three checks - a cycle, a zero weight, an unjudged pair - and the derived read-only criteria table.

HOW THE PAIRWISE IS ASKED, RESEARCHED (note-a3b10e1d75dd). THE PROBLEM IS THE COUNT: full pairwise over 60 items is 1770 questions, and the incomplete-AHP literature names that as the central objection. Every serious tool solves it the same way - infer by transitivity, and never ask a pair already implied. The house corpus agrees from its own side, since its direct-comparison method is an insertion walk and it states plainly that must-requirements are fulfilled anyway. THE COST IS NAMED AND IT IS THE PART TO BUILD FOR: transitive closure imposes consistency rather than checking it, so a cycle becomes undetectable. The mitigation is a spot check re-asking a small sample of implied pairs.

A CUTOFF RIDES A ROW, SO CORRECTING THE ORDER SILENTLY REDRAWS THE BOUNDARY (note-6e2574c6839c). When the damage sort reached the page the marked row moved into the middle of its band and roughly twenty axes fell below the line. NOBODY DECIDED THAT. It is the stored-versus-derived shape a third time in one day, alongside the chart's picks and the criteria order. The fix has a precedent already in the system - a claim whose ground moved is reopened and re-earned, so a boundary whose order moved behaves the same. Record what the order WAS when the line was drawn, drop the cutoff when the computed order no longer matches, and refuse the submit until somebody draws it again. DO NOT SOLVE IT BY STORING A POSITION; a position is what was wrong in the first place.

A COMPOUNDED AXIS IS REPRESENTED BY ITS ALPHABETICALLY FIRST MEMBER (owner ruling, note-e3c420ac103f), so an annoyance can sink a critical. Confirmed at the source: the union-find makes the root the smallest id, and nothing about damage enters that choice. THE RULE: the survivor of a compounded group is the member with the WORST damage, ties falling to the id. WHY WORST AND NOT BEST - the group measures one underlying thing, and what it costs to lose it is what the worst member says. Watch the stability requirement; worst-damage-then-id is as stable as id alone. NOT YET EXERCISED: no group in the current pool mixes damage levels, so the defect is in the rule rather than the result.

THE DECISION MATRIX NEVER WRITES ITS OWN RUNS (note-5b9947aa1c4d). The template promises the runs written by the arithmetic, and the arithmetic never writes them, so the signed comparison is stored nowhere and only the raw scores persist. Four parts: the submit writes the runs from the scores so the evidence holds what the render shows; every cell carries its rationale, derived by joining the rival's anchor line against the datum's, so nobody types them twice; the rationale surfaces as a HOVER, keeping the matrix compact; an optional typed per-cell note covers judgment beyond the two anchors.

THE CHART IS STILL A FREE TABLE over data the option nodes already carry (note-2719f46ccce5) - the second copy the derive-criteria rule exists to stop. It should be a node table over the options source, the same shape the assumptions form uses, and the shortlist has the same smell since a shortlisted combination is one option per cluster.

THE CANDIDATES GATE STILL NAMES A STRUCK FIELD (note-3e33716d409c). Tensions reads as a separate mechanism and is not one - a tension between two roles is a risk in the register, and the line should name the register. The gate also fails to check what the pairwise design makes checkable: every pair judged, no contradiction between a pair and its reciprocal, no cycle, and every cut carrying its by-construction reason.

AND THE 20 BACKFILLED REQUIREMENTS HAVE NO PAIRWISE JUDGMENTS (note-e0dcdfe20aee). The next criteria pass owes their insertions into the standing order.

## Inputs

- project/spec/version-planning.md
- guidance/method/retro.md step 3
- spec/decisions/notes-pipeline.md at ref main

## Owner ruling 2026-08-17 — this is what carries a cloud agent's notes

THE OWNER'S WORDS: "Notes never travel. But the idea is that the cloud agent
can put stuff in work tokens. We will have at some point the work token
system, and then the cloud agent can put stuff in work tokens."

WHAT PROMPTED IT. i15 ran unattended on a cloud box on 2026-08-16. The walk
filed a debt note for the blocker that stopped it. That note is gone —
searching the whole call log for its ref returns nothing, because
`.se/notes.jsonl` is machine-local and never committed. A hand-written field
report was the only thing that carried the findings back.

SO THE LIMIT IS ACCEPTED, NOT A DEFECT TO FIX SEPARATELY. The retro is not to
re-litigate it. This iteration is the answer.

SETTLED 2026-08-17, BY THE OWNER: "Yes, the work token is i17's options pool."

So the two names are one thing, and this record is its home. The question was
worth asking because nothing in the repository contained the phrase "work
token" — a search across the whole tree returned zero hits on 2026-08-17 — and
building a second mechanism beside this one would have been the expensive
mistake.

USE ONE NAME FROM HERE. This record's own vision already argues for it, citing
Anderson's Kanban Method: a mature system has no backlog, it has a POOL OF
OPTIONS. "Work token" is the owner's spoken shorthand for the same thing and
not a second concept.

WHAT THE CLOUD CASE ADDS TO THE SCOPE ALREADY SEEDED HERE: the pool is not
only for options a retro parks. An unattended walk needs to put a finding
somewhere that survives the box being released, and today the only surviving
channels are the record's own evidence forms and `decisions.jsonl`. Neither is
shaped for a stray.
