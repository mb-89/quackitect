---
id: ref-triage-and-option-pools-2026
kind: reference
statement: How shipping products actually run a triage stage and an option pool - Linear Triage and GitHub Projects draft issues, scanned live because i17 fixes a shape against them.
scanned: 2026-08-18
scanned_at: i17/draft-vision
---

# Triage and option pools in products people use, 2026

WHY THIS WAS SCANNED. i17's seed argues its shape from David Anderson's Kanban
Method - a mature system has no backlog, it has a POOL OF OPTIONS, and the
filtering before the commitment point is TRIAGE. That is a book. The gate's own
method says to name systems people actually use, and the seed named none.

WHAT WAS SCANNED, AND HOW. `se_web_fetch` against product documentation.
`se_web_search` REFUSED - no search provider is configured on this box
(SE-C-106), so the scan is fetch-only and the pages were chosen by hand. That
is a narrower scan than the method wants and it is said here rather than
implied.

## Linear Triage

A TRIAGE QUEUE IS A SPECIAL INBOX FOR A TEAM. Issues created by an integration,
or by somebody outside the team, land there instead of in the workflow.

FOUR ACTIONS, and the shape is close enough to ours to be worth the comparison:

| Linear | ours |
| --- | --- |
| accept - moves the issue to the team's default status | carried |
| decline - cancels it, with a comment explaining | obsolete |
| mark as duplicate - MERGES into a canonical issue, moving attachments with it | nothing |
| snooze - hides it until a time, OR until there is new activity | backlog, with a `where` naming the condition |

THREE THINGS THEY HAVE THAT WE DO NOT.

- DUPLICATE MERGE. Two captures of one idea become one item, and the merge
  carries the attachments across. We have no way to say "this note is that
  note", so a second capture of the same thing is drained twice.
- SNOOZE WAKES BY ITSELF. It returns at a chosen time or on new activity. Our
  `where: ready when ...` is a sentence a human re-reads at a retro. Nothing
  wakes it, and the migration step exists because nothing does.
- TRIAGE RULES AND TRIAGE RESPONSIBILITY. Rules act on an item as it arrives -
  routing, labelling, assigning - so a person does not touch every one.
  Responsibility puts a rotating named owner on the queue. Both are answers to
  the same failure our inbox has: a queue nobody owns becomes history.

## GitHub Projects draft issues

A DRAFT ISSUE LIVES ONLY INSIDE THE PROJECT and is CONVERTED into a real issue
later. That is the closest structural analogue to what i17 builds: a cheap
capture that is not yet a first-class item, and a named act that promotes it.

WHAT IT TELLS US: the conversion is worth being an explicit act with its own
name, rather than a status flag on the same row. GitHub gives it its own
documentation page.

WHAT IT DOES NOT SOLVE: a draft issue is already in the project, which is
already shared. There is no privacy boundary to cross, so nothing is rewritten
and nothing can be withheld.

## What they do better, first

- BOTH KEEP ONE OBJECT END TO END. The item that arrives is the item that
  ships, so nothing can drift between a raw capture and a curated copy. Our
  rewrite introduces exactly that drift risk, and it is a real cost.
- BOTH AUTOMATE THE ARRIVAL. Rules, routing and conversion are one keystroke.
  Our drain is a call per note, judged by a person or an agent, at a retro.
- LINEAR WAKES ITS OWN PARKED ITEMS. Ours waits for somebody to re-read a
  sentence.
- BOTH DEDUPLICATE. We cannot.

## What ours sheds, and why the trade is right

THE REWRITE IS THE WHOLE POINT, and it is what neither product needs. Their
capture is already inside the shared system, so there is no boundary to cross.
Ours starts in `.se/notes.jsonl`, which is machine-local and may carry anything
an agent dumped into it, including private data. RAW NOTES NEVER ENTER VERSION
CONTROL is a hard line in the seed, and only a rewrite gets an option across it.

AND THE REWRITE IS ALSO THE VALUE FILTER. An option nobody can state cleanly
for another machine was never an option. Linear's accept is one keystroke
BECAUSE it does not ask that question - which is why a Linear backlog fills
with items nobody can read a year later, and why Anderson argues against having
one at all.

THE SECOND THING WE SHED IS THE HOSTED STORE. Ours is plain files on trunk, so
the pool survives a discarded experiment and a released cloud box. Linear's
pool lives in Linear.

## What to steal, named

- A DUPLICATE DISPOSITION that merges into an existing option rather than
  minting a second one. Ours has four dispositions and no fifth for this.
- A WAKE CONDITION THE MACHINE CAN EVALUATE, not only a sentence. Even a date
  would beat what `where` does today.
- THE QUEUE HAS AN OWNER. Linear rotates it deliberately, because an unowned
  triage queue is the failure mode. Our inbox is drained by whoever happens to
  run the retro.
