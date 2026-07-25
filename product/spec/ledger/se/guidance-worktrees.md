---
id: se.guidance-worktrees
kind: guidance
statement: "Working rules for the worktree lane: one stream per iteration, milestone commits on the branch, a close that merges only live claims and names the record with a mandatory tag, suspects over silent wins, abandon flags never deletes."
provenance:
  iteration: i5-worktrees
  ai_involvement: agent-drafted
applies_to:
  - engine-ts
  - process
---

## Rules

- Every iteration opens in its own .worktrees/<id> on iter/<id> by default (a non-repo root starts plain, a worktree-resident loop never nests); the trunk stays untouched until the close.
- An iteration may carry a LOCAL machine (a drawing in its machines/ dir, seeded from the named template and trimmed); it overrides the shared machine for that iteration only.
- MILESTONE COMMITS: every blessed gate commits the iteration's state to ITS OWN branch. Work is durable from the first milestone, and losing a working directory costs nothing. Nothing to commit is legal.
- THE CLOSE IS A SPLIT (se.adr-close-merge-filter): the final bless merges the iteration's LIVE CLAIMS to trunk - the ledger, the product, the plan - while its EVENTS stay on the branch: evidence, machines, state. The merge commit keeps both parents, so the record stays reachable forever and never appears in a checkout of trunk.
- THE TAG IS MANDATORY AND COMES FIRST (se.adr-tag-before-merge): iter/<id> is created BEFORE the merge, because the record must be named before any of it leaves the tree. A close that cannot tag refuses before merging anything.
- PUSH WITH TAGS. Git does not push tags by default, and the tag is now the ONLY handle on an iteration's record - a plain push ships the claims with nothing behind them. Use --follow-tags. Never clone this repository shallow (--depth); --filter=blob:none is safe.
- A CLOSE REFUSES RATHER THAN HALF-APPLIES: an empty branch, an untaggable close and a textual conflict all leave trunk's HEAD unchanged with no merge pending. A ship that reports success has actually shipped.
- Every ledger node changed on both lines wears the suspect frontmatter field after merge - a human re-adjudicates and clears it; over-marking beats a missed suspect.
- A textual conflict STOPS the close and asks a human; the engine never auto-resolves source truth.
- Abandon FLAGS the tree (.abandoned), never deletes - nothing destructive runs unattended.
- A worktree INSTALLS its own toolchain; it is never linked to a shared one, because a link is a path a removal follows (se.law-imports-are-read-only). Retiring a tree unlinks any legacy link first.
- Append-only ledger events (grants.jsonl) union-merge via .gitattributes, and the grant index stays on trunk as a thin index (se.adr-grant-index-stays-on-trunk) - it is what keeps a closed iteration listable once its files leave.
- depends_on is satisfied by a gate_release grant, nothing weaker.
- The owner pushes.
