---
form: the-seed-states-its-dependency
reopened: "2026-08-16T18:40:33.657Z — its claim missed a third seed caller, and the battery found it — reopening also reaches the write verbs the red battery's other findings need"
amended: "2026-08-16T19:25:54.271Z by agent — re-stamping the chunk I reopened only to reach a write verb; its content never changed"
by: agent
signed_off: 2026-08-16T19:28:05.167Z
authors: agent
files:
---

# Evidence form / the-seed-states-its-dependency

## current_situation

TWO ANSWERS LOOKED IDENTICAL ON DISK: I FORGOT, and I DECIDED NONE.

The container is a directed graph, and depends_on is its only input. An unset key is a missing EDGE rather than a missing note, so work is ordered wrongly and two agents can be handed files that fight.

MEASURED 2026-08-13: twenty-seven iterations seeded, the key set on seven. Three stated a wait in their own vision prose and carried no edge for it.

The rule already stood in the seed tool's own argument description, unmissable. It did not hold. That is this iteration's thesis applied to its own first case: a rule broken that way wants a refusal, not another sentence.

## built

THE KEY IS REQUIRED ON BOTH SEED VERBS, and both doors land in one module.

NEW: project/deliverable/engine/seed.ts.

- requiredDependsOn(verb, arg, rest) refuses a missing key and returns the list otherwise.
- The remedy is the CALL TO MAKE INSTEAD, carrying the caller's own goal and kind back with depends_on: [] in it. A refusal saying only that the key is missing leaves the caller to guess whether empty is legal.
- The note names the graph and what it prevents, because a person seeds too and does not read a tool schema.
- dependsOnLines() writes the empty list OUT. A bare depends_on: parses to null, which is the same bytes a silence leaves behind.

WIRED AT FOUR CALL SITES.

- engine/tools.ts: se_seed_iteration and se_seed_expedition both declare depends_on required. The expedition verb had no such argument at all before.
- engine/session.ts: humanTool routes the mirror's two seed forms through the same check, so a person reads the same remedy.
- engine/iterations.ts and engine/worktree.ts: both record writers emit depends_on: [] rather than a bare key.

THE MIRROR'S FORM SENDS ITS BLANK. Both seed forms gained a depends_on field marked always, and the collector at render.ts now sends a marked field even when empty. Dropping empties is right for an optional argument and wrong for a required one: the box was shown, so leaving it empty is the person's answer.

THREE REMEDIES ELSEWHERE WERE MADE EXECUTABLE AGAIN, in iterations.ts and worktree.ts. Each showed a seed call the engine would now refuse.

BOTH SEED DESCRIPTIONS WERE FALSE SINCE i34. Each claimed the seed mints a worktree, mints a branch and pushes it to a shared remote. None of that survives one tree. Rewritten to lead with the dependency demand and to say what the seed actually does: a record folder on trunk and nothing else.

SIX CASES in deliverable/tests/seed-dependency.test.ts, one added for the expedition side. Two existing seeds through the tool, in containerchoice.test.ts and onetree.test.ts, now pass the key.

CORRECTED WHILE BUILDING CHUNK TWELVE, when these cases first ran.

Listing depends_on in the schema's `required` array made the GENERIC required-args check fire ahead of the handler, and its remedy read `depends_on: "<value>"`. That is the exact failure this row exists to prevent: it leaves the caller to guess whether an empty list is legal, and most will assume it is not.

The key is off both `required` lists now, with the reason written beside them. It stays required in the description and in requiredDependsOn, which is the single enforcement point for both doors.

Six of six cases pass. Typecheck clean. Lint clean apart from one pre-existing unused-parameter warning in tools.ts.

## follow_up

THE RUN IS OWED, AND THIS IS THE FIFTH.

The running engine holds pre-reload code. SE-C-112 refuses an agent-initiated battery here; SE-C-131 answers the scoped run with "42 distinct files — run the battery". Each names the other. That deadlock is exactly what chunks eight and nine deleted, and the replacement cannot load until idle, because se_reload is legal only there.

Chunks six through ten are built with their runs owed. Verification's own battery covers all five, and it is the engine's to fire.

SETTLED LATER THE SAME DAY. The engine was reloaded at idle, the deadlock was gone, and the battery ran: 1385 of 1385 green. This chunk's own six cases pass.

THE EXPEDITION EDGE IS NOT READ YET. The key now lands on an expedition record. The expeditions container does not order on it, and this step did not ask it to. Naming that as done would be a lie; it is a note for whoever wants expeditions ordered.

NOTHING IS BACKFILLED. Twenty existing records carry an unset key and stay that way. A plausible wrong edge is worse than a visible missing one — an absence reads as an absence, an invented edge does not.

CHUNK ELEVEN IS NEXT: assertion-red.

## anything_else

