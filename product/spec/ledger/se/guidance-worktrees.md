---
id: se.guidance-worktrees
kind: guidance
statement: "Working rules for the worktree lane: one stream per iteration, merge at ship only, suspects over silent wins, abandon flags never deletes."
provenance:
  iteration: i5-worktrees
  ai_involvement: agent-drafted
applies_to:
  - engine-ts
  - process
---

## Rules

- A worktree:true plan entry opens its iteration in .worktrees/<id> on iter/<id>; the trunk stays untouched until ship.
- Merge ONLY at ship (gate_release), never mid-iteration; the owner pushes the trunk.
- Every ledger node changed on both lines wears the suspect frontmatter field after merge - a human re-adjudicates and clears it; over-marking beats a missed suspect.
- A textual conflict STOPS the ship and asks a human; the engine never auto-resolves source truth.
- Abandon FLAGS the tree (.abandoned), never deletes - nothing destructive runs unattended.
- Append-only ledger events (grants.jsonl) union-merge via .gitattributes - two iterations closing must not conflict there.
- depends_on is satisfied by a gate_release grant, nothing weaker.
