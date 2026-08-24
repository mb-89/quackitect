---
minted_in: i4-the-panel-round-the-archived-iteration-b
id: raid-the-panel-can-carry-everything-the-mirror-renders
type: "[[raid]]"
kind: assumption
statement: The editor panel can render everything the HTML mirror renders today, so collapsing the two surfaces into the panel loses nothing a person currently reads.
owner: the owner
trigger: the first piece of the collapse that moves a mirror-only surface across, or any mirror feature found to have no panel path
status: open
probe: scheduled — the enumeration ran and found six mirror-only widgets with no panel path; deciding each is M7's work
probed: 2026-08-23 — ran, and the pass condition was not met. Six mirror widgets have no panel path and no decision.
impact: If a mirror surface has no panel equivalent, the collapse deletes something people use rather than merging it. The loss would surface after the deletion, when the surface is gone and the reader has nowhere to look.
breaks_how_badly: corrosive
how_likely: plausible
source_refs:
  - spec/iterations/i4-the-panel-round-the-archived-iteration-b/evidence/scope-non-goals.md, "render.ts and mirror.ts become one surface"
  - "owner ruling 2026-08-23: the editor panel survives, the HTML mirror goes"
---

WHY THIS IS AN ASSUMPTION AND NOT A DECISION. Which surface survives IS a
decision, and the owner has taken it: the panel stays because it is the one
people read. Whether the panel CAN carry the mirror's whole job is a separate
question, and nobody has checked it.

NOT ESTABLISHED: no inventory exists of what the mirror renders and what the
panel renders. The two grew side by side.

NOT CONTROLLED: the panel is a surface inside an editor host, and what it may
render is bounded by that host rather than by this project.

WHAT IT LEANS ON. The mirror renders at least the controls, the work table,
the unified feed and the state drawing. Each has to arrive in the panel or be
deliberately dropped with a reason.

WHY IT WAS NOT OBVIOUS. The two surfaces were assumed interchangeable because
both call the same renderer. They are not: a change landed in the mirror's
breadcrumb on 2026-08-23, compiled, passed the whole boot battery, and was
invisible, because the panel builds its header from different parts.

## Probe

ENUMERATE BOTH, THEN DIFF THEM.

- List every widget the mirror emits, from the renderer's own widget assembly.
- List every widget the panel emits, from the same file's panel path.
- For each mirror-only widget, name the panel path that will carry it, or the
  reason it is dropped.

THE PROBE PASSES when the mirror-only list is empty or every entry on it
carries a named decision. It fails the moment one entry has neither.

IT IS CHEAP. Both surfaces are assembled in one file, so this is a reading
exercise rather than an experiment.

## Probe result, 2026-08-23

IT RAN, AND IT DID NOT PASS. The mirror-only list is not empty, and no entry
on it carries a decision.

THE MIRROR EMITS SIX WIDGETS, named at `deliverable/engine/render.ts` line
1204: terminal, machine, log, details, table, trace.

NOTHING OUTSIDE THAT FILE CONSUMES ONE. A search for all five named widget
builders across `deliverable/engine` returns ten hits and every one of them is
inside `render.ts` itself.

SO THE TWO SURFACES SHARE NO WIDGET CODE. The panel builds its own content
from `deliverable/engine/params.ts`, and the earlier breadcrumb miss was not
an accident of one field. It is the shape of the whole seam.

WHAT THAT CHANGES. The collapse is not a move. Each of the six is a port or a
drop, and each drop needs a reason somebody signed.

WHY THE ASSUMPTION IS NOT THEREBY FALSE. The claim is that the panel CAN carry
them. The probe shows it currently does NOT, which is a different sentence. No
host limit was found, so capability stays unproven rather than disproven.

WHAT IS NOW OWED: six decisions, one per widget, before anything is deleted.
That is M7's work and it is named in this round's follow-up.
