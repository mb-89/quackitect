# Proposal — the kickoff seeds the iteration machine

Status: PROPOSAL for the owner. Nothing here is built except where marked
BUILT. The compiler core and the monotonicity law are in the suite already;
everything else waits for the owner's word.

## The flow, end to end

1. SEED (exists today). `se_seed_iteration` mints the record and worktree.
   The iteration stands in the container as its kickoff-only state.
2. KICKOFF (the change). The kickoff state's evidence form gains one field:
   `column` — patch, minor or major, with its reasoning. The agent PREFILLS
   it from the goal (prefill law: a suggestion, commented until confirmed).
   The kickoff carries what the matrix's gate-kickoff row already lists:
   retro drained, goal, pulled-in/left-out, column with strikes named.
3. BLESS. The kickoff is a gate at priority 0.6 — the autonomy slider
   already gates it correctly: below 0.6 the owner blesses by hand, at 0.6+
   an agent may pass it alone. No new mechanism.
4. COMPILE (BUILT: engine/matrix.ts). On kickoff exit the engine reads the
   matrix LIVE and runs `compileColumn` for the blessed column. The output
   is a kernel-valid machine: struck states gone, dependencies contracted,
   the verification loop as fallback+recovery, gates as approvals,
   priorities on the autonomy bands.
5. PIN. The compiled machine is written into the iteration record
   (`machines/seeded.json` plus a generated canvas for the mirror),
   stamped with the MATRIX CONTENT HASH and the column. Past the kickoff
   the iteration is SET — matrix edits reach the NEXT kickoff, never a
   running walk. The stamp makes drift visible: a mismatch between the pin
   and the live matrix renders as an advisory, never a silent re-seed.
6. WALK. The container expands the iteration to its pinned machine; the
   walk proceeds state by state exactly like any other machine — packet,
   conditions, evidence forms, the decision graph.

## Why pin instead of recompiling live

The truth-is-read-live law is satisfied AT the kickoff: the compile reads
the files as they stand that moment. After the bless, the machine is a
RECORD of what was blessed — v2's own words: "past it the iteration is
set." A walk whose states mutate under the walker is the alternative, and
it is worse than drift. The content-hash stamp keeps the drift honest.

## Escalation — the column is a prediction, never a one-way door

The monotonicity law (BUILT, a standing test): everything a smaller column
walks, every larger column also walks. That makes escalation mechanical:

- Escalating = RE-OPENING the kickoff with the larger column. The owner
  blesses the escalation exactly like the original column choice.
- The engine recompiles and re-pins. Because columns are monotone, every
  FILLED state exists in the new machine and keeps its history; the new
  machine only ADDS states and re-draws contracted edges.
- The walk resumes where it stood; the added states are simply open.
- De-escalating mid-walk is refused. A prediction that proved too big is
  finished at its size; the record notes the misjudgment for the retro.

The tripwire cells (gate-architecture at patch, partition-functions at
minor) stay the walk's prose guards; the mechanical artifact-level check
(the fit-band successor) is future work and stays out of this proposal.

## What is mechanical and what is judgment

Mechanical (engine): the compile, the pin, the container expansion, the
monotonicity law, the completeness refusals, the drift advisory.
Judgment (person): the column choice, its bless, every escalation.
That split is exactly the thin-floor shape the evidence rewards -
mechanical checks everywhere, human judgment only at the gate.

## Build steps, sized by content

1. Kickoff form gains the column field; the seeder call on kickoff exit;
   the pin write. One engine seam (iterations.ts), one test.
2. Container expansion: the pinned machine serves as the iteration's
   submachine. This is the existing generated-machine pattern
   (expmachine.ts) fed from the pin instead of a template.
3. Escalation: reopen-kickoff verb + recompile + re-pin. One test proving
   fills survive an escalation.
4. LATER, own design: the three sub-machine seed points (candidates,
   spikes, build chunks) — the matrix rows carry `seeds:` already; the
   kernel's submachine field is waiting.

## Open questions for the owner

1. The pin's drift advisory: silent until asked, or a visible mirror
   badge on the running iteration?
2. May an agent propose an ESCALATION on its own (the bless still
   human below 0.6), or is noticing the tripwire also the owner's?
3. The kickoff column field's name: `column` (the matrix word) or
   `change_size` (the plain phrase)?
