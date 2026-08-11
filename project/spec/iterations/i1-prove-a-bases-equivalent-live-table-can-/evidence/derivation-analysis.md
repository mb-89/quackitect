# Derivation analysis — the dated argument tsp-derivation-analysis demands

Recorded 2026-08-11 at the verification state, by the agent, re-judged
by the fresh-eyes gatekeeper. Inputs named per claim.

## Part 1 — every served view derives from files

The served views, each with its source files and derivation path:

- The machine drawing derives from the canvases and the rigor matrix
  (machines/*.canvas, rigor_matrix/rows/*), compiled per look in
  engine/rigor-matrix.ts and engine/machines/compile.ts, drawn by
  engine/render.ts. The machine is never stored (engine/iterations.ts,
  generateIterationWalk).
- The trace graph derives from the node files alone
  (project/spec/trace/**), loaded by engine/trace.ts with a stat-stamped
  cache, drawn by engine/traceui.ts.
- The registers and tables derive from the vault's notes and the .base
  view files, evaluated per look by engine/vault.ts, engine/bases.ts,
  engine/tables.ts and engine/expr.ts. A cell edit lands back on the
  note it names (tables.ts editCell; bases.ts write paths) — no
  view-side store.
- The evidence forms derive from the state declarations and the record's
  evidence files (engine/stateform.ts); bound fields rebuild from trace
  nodes on every look.
- The feed derives from .se/calls.jsonl (engine/calllog.ts); the
  decision graph from the record's decisions.jsonl
  (engine/decisions.ts).

Standing guards cited: the stored-copy law and the derive-on-every-look
rule (project/guidance/craft/software.md), the direct-read ratchet
(project/deliverable/tests/files.test.ts), and green calculated never
stored (engine/session.ts standingClaims).

Acceptance: MET. Zero views hold truth that is not in a file. The
gatekeeper's independent spot-check (2026-08-11) reached the same
verdict over tables.ts line 649 and bases.ts lines 84, 516 and 563.

## Part 2 — every reachable capability is traced

The live offer, door by door, each with a use case a requirement covers:

- overhaul — uc-let-the-system-catch-up
- retro — uc-drain-the-inbox
- front_desk — uc-get-work-routed
- ideation — uc-diverge-before-deciding
- expeditions — uc-answer-a-question-with-tests
- expedition_archive and iteration_archive — uc-browse-the-archive
- iterations — uc-open-an-iteration, uc-take-a-step
- end — the door is the machine's own terminal, not a user capability;
  what a person can DO with it — finish everything and let the system
  stop — is uc-set-the-autonomy's shutdown half
  (req-shutdown-fires-only-idle-or-end).

Holes named as findings, per the acceptance line:

- The VERB-GRAIN walk (every legal tool per state mapped to a use case)
  is not recorded in this round. It is exactly where the requirements
  gate found holes twice before, and it is the first input to the next
  refresh of this analysis.
- The PANEL-ACTION walk (every clickable control mapped) is likewise
  unrecorded this round.

Acceptance: MET AT DOOR GRAIN, with the two finer-grain walks named as
findings for the next refresh. Refresh trigger, per the spec's scope:
whenever the surfaces or the offer change.
