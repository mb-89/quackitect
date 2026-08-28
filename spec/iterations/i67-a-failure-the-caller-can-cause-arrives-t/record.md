---
id: i67-a-failure-the-caller-can-cause-arrives-t
status: seeded
opened: 2026-08-25T14:18:43.940Z
goal: A failure the caller can cause arrives typed, and a fact the engine owns has one address. Seeded by the 2026-08-25 overhaul, from its pattern checklist run over all 176 engine files by six independent hands.
vision: |-
  FIVE FINDINGS. Each was evidenced against quoted code, and each closes a defect class rather than saving lines.

  THE MATRIX REACHES THE CALLER UNTYPED, and it is the one hole left in the typed-refusal law. deliverable/engine/rigor-matrix.ts throws a bare Error at 28 sites, every one of them a statement about a file an agent authored through the lane. The write guard checks YAML and vocabularies and stops short of these rules, so a row naming a nonexistent depends_on writes cleanly and breaks on the next read. It escapes through session.ts:4624, where seedSubs obtains a generated declaration OUTSIDE the try that wraps the canvas path five lines below. The caller gets isError with a bare string, on the most travelled compile path in the product, because generateIterationWalk reads the matrix live on every pull that descends into an iteration. Three more call sites are unwrapped the same way. Mint a clause, add a matrixRefusal helper, and bring the generated path inside the try.

  THE CALL LOG HAS A VALIDATING DOOR AND ONE WRITER GOES AROUND IT. calllog.ts asserts that every record carries answered_by, state and part, with its own reason stated: a record missing one reads as complete and answers nothing. bin/se-hook-websearch.ts opens the file itself and hand-builds a line carrying none of the three. This is not a hypothetical drift. The log already holds records the door would refuse, one per native search, and that is the normal path. render.ts then falls past both stamped branches into the legacy guess its own comment reserves for history that cannot be restamped. Three more sites read the file by their own literal, so none of them sees a rotated archive. The hook cannot simply call append, because it does not know the state — so this needs a declared coordinate policy for an out-of-process writer, and an exported path for the readers.

  A DEFERRED ITEM NEVER CLOSES ON THE PROGRESS ACCOUNT. Four sites treat done, obsolete, revert and defer alike, and the engine's own refusal text names all four as resolving. run.ts:1043 lists only the first three, so a defer leaves steps_done where it was. That counter is the only thing a person reads to tell a working hand from a stuck one: it drives the panel's progress cell and the projected time remaining. A hand that plans five items and defers one reports four of five until it exits, and its estimate never reaches zero. One shared predicate, applied at all five.

  THE WRITE FUNNEL IS BUILT, DOCUMENTED AND BYPASSED. writeNode forgets the path and bumps the epoch that keys six derived caches. Twenty-seven raw write sites stand in five files that also READ through that cached door, and records.ts does it correctly fifty lines below where it does it wrong. markStarted reads a record through the cache and then writes the same file raw, so any later read in that pass answers with the old status. Substitute the funnel at each site; the line count barely moves and the class of stale-read defect goes.

  THE VOCABULARY CACHE STAMPS THE FOLDER. A directory's size and modification time do not move when a file inside it is edited, only when one is added or removed, so an edited item template stays out of reach for the life of the process. Its own comment claims the opposite, and two sibling stamps in the same tree already stat the files. This was fixed in the overhaul run; what remains here is the poisoning test that could not have caught it, because every case opens a fresh root and a fresh root is always a cache miss.

  THREE MORE WERE FOUND, EXECUTED IN THE OVERHAUL RUN, AND ARE RECORDED HERE ONLY SO THE NEXT SWEEP DOES NOT RE-LITIGATE THEM. The visit-id parse had three identical copies and now has one home. The host opener was written twice, once with the error listener that stops a missing binary killing the engine and once without, and the guarded one is now shared. A comment claiming a field was unenforced sat 115 lines above the code enforcing it.

  WHAT DONE LOOKS LIKE. No failure an agent can cause reaches it without a clause and a remedy. Every record in the call log satisfies the log's own stated invariant. The panel's progress figure agrees with the decision graph. And a cache in this engine is stamped on what it actually reads.
inputs:
  - deliverable/engine/rigor-matrix.ts
  - deliverable/engine/session.ts
  - deliverable/engine/calllog.ts
  - deliverable/engine/bin/se-hook-websearch.ts
  - deliverable/engine/run.ts
  - deliverable/engine/decisions.ts
  - deliverable/engine/notes.ts
  - deliverable/engine/vocabulary.ts
  - guidance/refusals.md
  - guidance/method/overhaul.md
depends_on: []
---

# i67-a-failure-the-caller-can-cause-arrives-t

## Goal

A failure the caller can cause arrives typed, and a fact the engine owns has one address. Seeded by the 2026-08-25 overhaul, from its pattern checklist run over all 176 engine files by six independent hands.

## Rough vision

FIVE FINDINGS. Each was evidenced against quoted code, and each closes a defect class rather than saving lines.

THE MATRIX REACHES THE CALLER UNTYPED, and it is the one hole left in the typed-refusal law. deliverable/engine/rigor-matrix.ts throws a bare Error at 28 sites, every one of them a statement about a file an agent authored through the lane. The write guard checks YAML and vocabularies and stops short of these rules, so a row naming a nonexistent depends_on writes cleanly and breaks on the next read. It escapes through session.ts:4624, where seedSubs obtains a generated declaration OUTSIDE the try that wraps the canvas path five lines below. The caller gets isError with a bare string, on the most travelled compile path in the product, because generateIterationWalk reads the matrix live on every pull that descends into an iteration. Three more call sites are unwrapped the same way. Mint a clause, add a matrixRefusal helper, and bring the generated path inside the try.

THE CALL LOG HAS A VALIDATING DOOR AND ONE WRITER GOES AROUND IT. calllog.ts asserts that every record carries answered_by, state and part, with its own reason stated: a record missing one reads as complete and answers nothing. bin/se-hook-websearch.ts opens the file itself and hand-builds a line carrying none of the three. This is not a hypothetical drift. The log already holds records the door would refuse, one per native search, and that is the normal path. render.ts then falls past both stamped branches into the legacy guess its own comment reserves for history that cannot be restamped. Three more sites read the file by their own literal, so none of them sees a rotated archive. The hook cannot simply call append, because it does not know the state — so this needs a declared coordinate policy for an out-of-process writer, and an exported path for the readers.

A DEFERRED ITEM NEVER CLOSES ON THE PROGRESS ACCOUNT. Four sites treat done, obsolete, revert and defer alike, and the engine's own refusal text names all four as resolving. run.ts:1043 lists only the first three, so a defer leaves steps_done where it was. That counter is the only thing a person reads to tell a working hand from a stuck one: it drives the panel's progress cell and the projected time remaining. A hand that plans five items and defers one reports four of five until it exits, and its estimate never reaches zero. One shared predicate, applied at all five.

THE WRITE FUNNEL IS BUILT, DOCUMENTED AND BYPASSED. writeNode forgets the path and bumps the epoch that keys six derived caches. Twenty-seven raw write sites stand in five files that also READ through that cached door, and records.ts does it correctly fifty lines below where it does it wrong. markStarted reads a record through the cache and then writes the same file raw, so any later read in that pass answers with the old status. Substitute the funnel at each site; the line count barely moves and the class of stale-read defect goes.

THE VOCABULARY CACHE STAMPS THE FOLDER. A directory's size and modification time do not move when a file inside it is edited, only when one is added or removed, so an edited item template stays out of reach for the life of the process. Its own comment claims the opposite, and two sibling stamps in the same tree already stat the files. This was fixed in the overhaul run; what remains here is the poisoning test that could not have caught it, because every case opens a fresh root and a fresh root is always a cache miss.

THREE MORE WERE FOUND, EXECUTED IN THE OVERHAUL RUN, AND ARE RECORDED HERE ONLY SO THE NEXT SWEEP DOES NOT RE-LITIGATE THEM. The visit-id parse had three identical copies and now has one home. The host opener was written twice, once with the error listener that stops a missing binary killing the engine and once without, and the guarded one is now shared. A comment claiming a field was unenforced sat 115 lines above the code enforcing it.

WHAT DONE LOOKS LIKE. No failure an agent can cause reaches it without a clause and a remedy. Every record in the call log satisfies the log's own stated invariant. The panel's progress figure agrees with the decision graph. And a cache in this engine is stamped on what it actually reads.

## Inputs

- deliverable/engine/rigor-matrix.ts
- deliverable/engine/session.ts
- deliverable/engine/calllog.ts
- deliverable/engine/bin/se-hook-websearch.ts
- deliverable/engine/run.ts
- deliverable/engine/decisions.ts
- deliverable/engine/notes.ts
- deliverable/engine/vocabulary.ts
- guidance/refusals.md
- guidance/method/overhaul.md
