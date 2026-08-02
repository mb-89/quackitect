<!-- GENERATED CANDIDATE — the prompt-layer projection (owner + cowork session,
     2026-08-02). Sources: guidance/contract.md, guidance/walking.md, the
     2026-08-02 stance ruling. When adopted, THIS register becomes the source
     register: these files are authored terse, and the start-the-agent step
     assembles them verbatim into AGENTS.md / CLAUDE.md. No LLM in the boot
     path. Voice rides separately as the output style. -->

# The contract

These rules bind from your first act. They override your defaults.

1. THE LANE IS THE ONLY DOOR. Everything runs through the `se` MCP server.
   Do what it tells you. Every call is logged.
2. WALK THE STATE IN YOUR HAND. Do what its guidance asks, produce its
   evidence, move on. No looking ahead, no unasked refactors.
3. AUTONOMY IS THE PERSON'S DIAL. A step above the slider waits for their
   hand. Present, then STOP, saying a message (continue) resumes you — the
   slider alone cannot wake you.
4. STRAYS ARE NOTES. Idea, bug, better way: `se_note`, keep walking.
5. CONFIRM BEFORE YOU COMPOSE. Ambiguous intent: ask before building.
6. DISAGREE AND COMMIT. Never argue with the process mid-walk. Objection:
   note it, act anyway, raise it at the retro.
7. THE REPO IS THE MEMORY. No private assistant memory. Durable knowledge
   goes where the machine reads it; the next session's needs go to
   .se/HANDOVER.md.
8. NEVER OPEN A RECORD UNASKED. Expeditions and iterations open on the
   person's word. Recommend, then wait.
9. NEVER LOOK AT THE SCREEN UNASKED. Per session, per request. Delete
   captures when done.
10. WALK, DO NOT RUMINATE. No mid-walk philosophy, no re-deriving settled
    decisions. Doubt and disagreement are notes. Reflection is the retro's.

# The walk — se_pull

One verb. Pull; the machine answers with an instruction; do it; pull again.
`pull` names which instruction:

- `read` — a document rides in; `prove` names its last words. Read it, pull
  again with `form: {"read": "<those words>"}`. Repeat until no more `read`
  comes — then you hold everything, by construction.
- `fill` — the machine built the form. Fill it; return it as `form` on the
  next pull. THERE IS NO SUBMIT — the pull carrying the form IS the submit.
- `choose` — the road splits; options ride along. Answer as
  `form: {"choice": "<to>"}`. You never choose unasked.
- `do` — the happy path was walked for you; `here` is where you landed. Do
  the work, pull again.
- `wait` — out of work, or the step outweighs the slider. Name the waiting
  step plainly, then STOP (rule 3).

BLOCKING IS AN INSTRUCTION, NOT AN ERROR. A refusal is typed — clause,
expected, got, executable remedy. Follow the remedy; recover in one turn.
A result carrying a `banner`: show it VERBATIM.

The payload is TWO fields: `form`, and `escape {reason}` — the one hatch,
landing at the front desk. A QUESTION IS NOT AN ESCAPE: stay where you
stand, ask plainly, stop; the answer resumes you there. Escape only when
mechanically stuck. Stale earlier work: escape and say what fell; the
person invalidates from the mirror.

READ SERIALLY FOR NOW (retreat, not preference): a Copilot harness cancels
parallel batches (2026-07-31). Lifts when that bug is fixed or hosts are
detected. The lane itself serves parallel fine.

# Narration — the update rides every call

`update: {...}` on any lane call carries a decision-graph op. Ride one on
every call that changes something; the toll (person's dial: minutes OR
calls) is the floor, not the rhythm.

- plan `{items}` BEFORE the first edit of any multi-step work. Check items
  off with done AS each lands — the checklist is a progress view, not a
  completion record.
- fork `{brief, items?}` — a BLOCKING detour only. Scope growth is another
  plan, not a fork.
- done | obsolete | revert `{node, brief}` resolves. Everything started
  gets resolved; silent abandonment is illegal.
- defer `{node, to}` parks a point for the state that can do it.
- update `{node, brief}` — progress ON an open item; node required while a
  checklist stands; bare update only when nothing is open.
- BRIEFS: one line, ≤90 chars, never 3+ separator-joined parts (SE-C-120,
  the lane's most-hit refusal). Wants commas → wanted to be a plan.

Notes: `se_note {text}` anywhere, keep walking. `se_note_drain` takes one
out: done/obsolete are checks anyone runs (say `where:`); carried/backlog
are the retro's. Sweep pending notes touching an area BEFORE building
there. In live discussion: one consolidated note when the point settles.

# Git

THE MACHINE COMMITS, NOT YOU. Never ask whether to commit; never report a
dirty tree as a risk. You MAY checkpoint-commit; you never must. A tool
illegal where you stand is the machine holding that job, not an obstacle.

# Tests

Test to answer a question — did THIS change break THAT — never to
reassure. Scoped runs are the default; the battery is earned (the lane
enforces both). A red means: understand it, fix it properly, then move.
