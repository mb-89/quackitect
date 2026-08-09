---
id: cand-thin-worktree
type: "[[candidate]]"
name: "Thin worktree"
statement: "the isolated tree holds only its own record"
picks:
  - "[[opt-two-layer-authorization]]"
  - "[[opt-stable-ids-not-copies]]"
  - "[[opt-worktree-holds-only-the-record]]"
  - "[[opt-idempotent-scaffold-with-drift-detection]]"
  - "[[opt-the-stray-is-a-log-entry]]"
---

## Why this one

This is the isolation candidate. It attacks one failure directly: a record's
worktree holding a copy of shared method that then fans out over trunk.

The isolated tree gets the record's own folder and nothing else. Guidance,
machines and the engine are read from trunk at the moment they are needed.
Ids point at authoritative text instead of duplicating it. Authorisation
splits into which tools a step exposes and whether this call is allowed here.

What it trades away is speed and stability under a moving trunk. Every shared
read becomes a trunk read. A trunk that changes mid-walk can change the method
under a walk already in flight, which the current copy-once shape cannot do.

It is drawn because the refusal that guards this today is a rule rather than a
fact. That rule was broken twice on 2026-08-07, and the first breach deleted
two lane verbs. A shape where the mistake is unavailable beats a shape where
it is forbidden.

## How it works

The baseline stays. Records still get worktrees and branches; the walk, the
forms and the corpus are untouched. What changes is what the worktree
CONTAINS.

THE FIRST SEAM IS THE TREE ITSELF. It holds the record's own folder and
nothing more. Guidance, machines, matrix rows, templates, the engine and the
tests are read from trunk at the moment they are wanted. So SE-C-134 stops
being a rule the agent must remember and becomes a fact about the filesystem:
there is no method file in the tree to overwrite.

THE SECOND SEAM IS BETWEEN THAT TREE AND THE CORPUS. With shared method out
of the tree, references have to carry across the boundary. Stable ids pointing
at authoritative text do that; copies do not. So the two picks are one
decision seen twice, and the orphan check is what keeps it honest.

THE THIRD SEAM IS AUTHORISATION, AND IT IS WHERE THE SHAPE PAYS OFF. Splitting
"which tools does this step expose" from "is this call, with these argument
values, allowed here" is what lets a write be judged by its PATH rather than
by its verb. The thin tree makes that judgment trivial: inside the record is
writable, outside is not.

WHAT THE COMBINATION MAKES POSSIBLE. The whole reconciliation problem goes
away. There is no second copy of method to diverge, so no merge, no
--ours-versus--theirs decision, and no superset to discover after the fact.

## What it costs

RESOURCE, ROUGH. Every shared read becomes a trunk read. The lane already
reads at a committed ref, so the mechanism exists and the cost is a file read
per access rather than a network call.

THE WORST CASE THAT DECIDES VIABILITY is a trunk that moves mid-walk. Today
the record's copy is frozen when the worktree is made, so the method a walk
started under is the method it finishes under. Reading live removes that
guarantee, and a reload landing between two pulls could change guidance under
a walk in flight. HOW OFTEN THAT WOULD BITE IS NOT KNOWN.

MAKE, REUSE OR BUY. Mostly reuse. Git worktrees supply the isolation, the
lane's ref reader supplies the trunk access, and the id-and-orphan check is a
small build.

THE FAILURE MODE THAT DECIDES. A stale read. If the trunk access caches, the
tree gets a copy again by another name and every argument here collapses.

## What it leans on

- THE METHOD-VERSUS-RECORD BOUNDARY IS DRAWABLE BY PATH. SE-C-134 already
  enumerates the shared set, so the boundary exists on paper today.
- READING FROM TRUNK IS FAST ENOUGH TO DO PER ACCESS. Unmeasured. It is the
  probe this candidate most needs.
- A WALK CAN SURVIVE THE METHOD MOVING UNDER IT. This is the real bet, and
  the current design deliberately bets the other way.
- FREEZING WAS NEVER THE POINT. If some walks genuinely need a frozen method,
  the candidate needs a pinned ref per record, which is a copy with extra
  steps.
