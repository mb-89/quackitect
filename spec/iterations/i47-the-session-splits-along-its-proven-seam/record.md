---
id: i47-the-session-splits-along-its-proven-seam
status: seeded
opened: 2026-08-20T16:50:29.724Z
goal: "The session splits along its proven seams: route, pull-shaping and settings leave session.ts; green, diagnosis and CRUD separate in sessionclaims; the facade's forwarding delegates go."
vision: |-
  Owner go 2026-08-20, sequenced after the one-home dedup proves the seams. The seam map with line ranges is in spec/overhauls/2026-08-20/plan.md, seed 8b; the ClaimsHost pattern already carved out five sub-objects and is the shape to repeat.

  DONE LOOKS LIKE: session.ts near fifteen hundred lines of walk core; sessionroute, sessionpull and sessionsettings carry their seams; sessionclaims divides into green computation, grey diagnosis and state-form CRUD with the one-directional dependency kept; the thirty-two forwarding delegates are gone in favor of public readonly sub-objects; every module's refusal sources name it; the battery is green before and after each extraction, extraction by extraction.
inputs:
  - spec/overhauls/2026-08-20/plan.md
depends_on:
  - i46-one-home-per-idea-the-copies-that-could-
---

# i47-the-session-splits-along-its-proven-seam

## Goal

The session splits along its proven seams: route, pull-shaping and settings leave session.ts; green, diagnosis and CRUD separate in sessionclaims; the facade's forwarding delegates go.

## Rough vision

Owner go 2026-08-20, sequenced after the one-home dedup proves the seams. The seam map with line ranges is in spec/overhauls/2026-08-20/plan.md, seed 8b; the ClaimsHost pattern already carved out five sub-objects and is the shape to repeat.

DONE LOOKS LIKE: session.ts near fifteen hundred lines of walk core; sessionroute, sessionpull and sessionsettings carry their seams; sessionclaims divides into green computation, grey diagnosis and state-form CRUD with the one-directional dependency kept; the thirty-two forwarding delegates are gone in favor of public readonly sub-objects; every module's refusal sources name it; the battery is green before and after each extraction, extraction by extraction.

## Inputs

- spec/overhauls/2026-08-20/plan.md

## Carried work tokens

These stood in the options pool referenced by no iteration at all. Assigned
here in a pass over the pool.

- wt-permission-granted-by-the-person-is-lost-whenever-the-server
- wt-when-a-signature-is-turned-away-for-insufficient-authority-t

## Carried notes

- note-4476abf27591 — closing the editor window ends the session; a hot reload
  inside a session does not. Today the engine cannot tell them apart, so a
  close-and-reopen inherits the previous session whole, dials included. Pairs
  with the two tokens above about permission lost on restart.
