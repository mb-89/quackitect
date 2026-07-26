# v3 plan — owner-corrected, 2026-07-26

Supersedes the first draft where they differ. Owner rulings incorporated:

1. **Not a linear-only machine.** Sub-machine seeding is in scope early.
   Worktree machinery can wait; the machine kernel keeps its full v2
   semantics (token sets, joins, seeded sub-machines, reopen cones) —
   `engine/machine.ts` is harvested verbatim and already carries them.
2. **The Mirror comes immediately after the machine.** Any machine
   visibility gap is a defect. One renderer, two projections: the packet the
   agent gets and the HTML the owner reads are the same bytes rendered twice.
3. **The canvas compiler is required, not optional** — Obsidian canvas is
   the owner's authoring surface for machines. Harvest v2's
   `machines/compile.ts` (geometric group membership, edge roles on style
   attributes, review-round injection) once the JSON machine round-trips.
4. **The cage is an explicit blacklist** (owner ruling): today's native
   tools are denied by name in `workspace/.claude/settings.json`. A future
   tool is NOT auto-blocked; blocking it is a deliberate edit. Subagents
   stay available and inherit the denies.
5. **Guidance over ledger** (owner ruling): output quality beats
   traceability. The audit ledger stays minimal until the output is good;
   every addition must name the failure it is load-bearing for. v2's
   diagnosis stands: enforcement landed B0–B6, guidance was scheduled i13
   and never shipped — v3 does not repeat that order.

## Order of work

- **M1a — cage + lane + log.** DONE with this scaffold. Explicit-deny cage;
  11-tool drop-in lane at the i12 standard (offset/limit reads, atomic batch
  patch, CAS everywhere, unknown-arg refusal, honest truncation); raw call
  log; selftests; RUNME.
- **M1b — machine wired to dispatch.** `se_next` / `se_submit` /
  `se_abandon`; machine declarations as JSON against the harvested kernel;
  ONE generic dispatch guard: the active state's legal list decides, the
  rejection names the state, the legal moves, and the exact next call.
  Sub-machine seeding included. Exit: a scripted walk end-to-end green; an
  off-script call in every state refused; a weak model recovers in one turn
  from any rejection.
- **M2 — the Mirror.** HTML projection of: current machine (drawn), active
  state(s), the packet as served (byte-equal, same renderer), guidance as
  inlined, last N log lines. Regenerated on every state change; no server
  needed to read it. Exit: the owner confirms what he reads IS what the
  agent got.
- **M2b — canvas compiler.** Obsidian canvas → machine JSON. Exit: a drawn
  machine executes; the Mirror renders it.
- **M3 — guidance library.** Markdown files bound to states; served in the
  packet; owner edits land on the next `se_next`. This is v2's missing
  pillar, now ahead of everything ledger-shaped.
- **M4 — gates, evidence, minimal ledger.** Human blessing, offers with
  absence-as-dismissal (harvest v2 `gate.ts` minus worktrees), evidence
  pinning, grants with channel. No hash chain, no suspect ripple until a
  named failure demands them.
- **Later, on demand:** worktrees, board/phone, retro tooling, v2 mint
  import, toll (the update-toll harvests cleanly when wanted).

## Standing laws

- Typed rejections everywhere; the weak-model one-turn-recovery test is the
  bar for every refusal.
- Honest truncation — nothing is ever silently cut.
- Every dispatch is logged raw; se_run output in full.
- Prose rules do not change agent behavior; refusals do (P5, proven twice).
- Each mechanism must name the failure it is load-bearing for; anything that
  cannot is deferred.

## Forward: asynchronous lane tasks (owner question 2026-07-26)

MCP's CALL is synchronous; the SERVER is not. Nothing stops the lane from
growing a background arm: `se_run {background: true}` spawns and returns a
ref immediately; a status tool (or the tick packet) reports progress; the
full output lands in the call log under the ref, as ever. The elegant part
is the wake path that now exists: task completion is a CHANGE — it fires
notifyChange, which wakes a held `wait` and unparks a parked agent through
the Stop hook. So an agent could start a long build, park, cost nothing
while it runs, and be woken by its completion exactly like by the human's
slider. What stays impossible: the server initiating a message mid-turn —
the wake always lands at a turn boundary. Build when a real long-running
task demands it, not before.
