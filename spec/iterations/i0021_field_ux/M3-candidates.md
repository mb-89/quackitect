# M3 — Candidate architectures (i0021_field_ux)

## Alternatives elaborated → i21-m3-alternatives

Four concerns, each with viable rivals. Feasibility anchors name EXISTING machinery, probed at
M2, not hoped-for parts.

### A. Register placement

- **A1 - report-embedded.** The register is a section of the live report (a tab beside the
  trace/board views). Anchors: the report recomputes live per render, already carries the
  check detail pane, filters, and the `iter` attribute; `--watch` gives auto-reload.
- **A2 - standalone page.** `quack register [--watch]` renders its own HTML. Anchors: the
  render-once machinery (i17) makes a second page cheap; but it grows a second shell (title
  card, theme, filters) the report already owns - the scope-creep risk made concrete.
- **A3 - book view.** A register chapter in the book. Rejected-shaped: the book is the
  DOCUMENT lane (static, shippable); a work-session surface with taps does not belong in it
  (adr-book-two-stage separation). Kept as a rival for the Pugh run, expected to lose.

### B. Answer transport (how a tap records)

- **B1 - the watch server lane.** In `--watch` mode the local server accepts the
  questionnaire answer and dispatches the SAME recorded operation the console would run
  (actor=user, channel=register). Anchors: `--watch` serves today; the ask/answer apply path
  (i15) already validates and stamps answers; req-await-console-exit hardened the seam.
- **B2 - static-file fallback: command emission.** The static register renders each red row
  with the exact one-line command (`quack ask <id>` / the answer call) to copy-paste. No
  server, no state - degraded but honest. Anchors: grant-command copy-paste convention.
- **B3 - phone-only.** Every red row rides ntfy only. Rejected-shaped: owner law says never
  phone-only while the desk is live; kept as rival.
- B1+B2 COMPOSE (server when watching, commands when static); the Pugh run scores the pair
  against B3.

### C. Seeding lane

- **C1 - engine-emitted skeleton.** `quack start` parses the rigor checklist SOURCE
  (method/rigor/*/checklist.md) at seed time and emits gates/subtasks with namespaced ids and
  milestone-monotonic wiring. Anchors: gather already parses these files; compose-reference
  fixes the wiring rules; raid-seeding-drift demands the no-baked-copy property this gives.
- **C2 - template-copy.** Checklist task files ship as literal templates; start copies and
  renames. Simpler, but bakes a SECOND copy of the milestones (the drift risk realized by
  construction) and cannot honor per-rigor structure without near-parsing anyway.

### D. Provenance home (the probe's gap 3)

- **D1 - in-node provenance block.** A frontmatter block per node (`provenance: {field:
  source-one-liner}`) written at mint. One file, one truth, hashes with the node - a veto
  edit and its provenance move together.
- **D2 - data-home sidecar.** Provenance records live outside the repo keyed by node+field.
  Keeps spec files lean, but the repo stops being self-sufficient for the register's colors -
  a fresh clone renders colorless. Conflicts with the repo-self-sufficiency law; kept as
  rival, expected to lose.

### E. Apply-lane scope

Deliberately NOT a candidate set here: [q-io-lane-scope](q-io-lane-scope.md) is the owner's
ruling at M4. The three options stand in the question node; req-apply-general makes the lane
CAPABLE under any of them.

Killer review: at least two rivals per concern, each anchored. Blessed by the driving agent
under the owner's standing overnight grant (2026-07-13); collected for the morning review.

## Criteria weighted → i21-m3-criteria

Derived from the requirement set and the recorded risks, weighted /10:

1. **One-system unification** (w3) - no parallel renderer/answer path (raid-register-scope-creep; the register seed's law).
2. **Provenance integrity** (w3) - colors derivable from recorded data on a fresh clone; veto and provenance move together (req-register-colors, repo law).
3. **Drift immunity** (w2) - one source of truth for milestones and schemas (raid-seeding-drift, template render law).
4. **Overlay/vehicle fit** (w1) - a vehicle's schemas and rigor win through the overlay (M2 stakeholder sweep, integrator).
5. **Build cost inside the iteration** (w1) - lands within i21 without starving the ride-alongs.

Non-killer review; blessed by the driving agent.

## Feasibility rough-checked → i21-m3-feasibility

- A1: the report shell already tabs (trace/board); adding a register tab is render code plus
  the existing checks map - no new process. ✅
- B1: `--watch` runs a local HTTP server today (report auto-reload); the answer apply path
  validates answers and stamps actor+channel since i15. The new part is one endpoint routing
  to it. ✅ B2 is trivially feasible (string emission). ✅
- C1: gather() parses the rigor sources already; the emitter writes files the strict parser
  itself validates - test-seed-skeleton lints the emitted set. ✅
- D1: frontmatter blocks are the parser's native shape; the strict referee already refuses
  malformed graphs, so a provenance block is a schema addition, not a parser rewrite. ✅
- A2/A3, B3, C2, D2 are all buildable too (none is a strawman); they lose on criteria, not on
  feasibility.

Non-killer review; blessed by the driving agent.

## Milestone review → i21-m3-gate

1. **Verify.** Four concerns each carry 2-3 elaborated rivals with feasibility anchors in
   probed machinery; the criteria derive traceably from requirements and RAID items; no
   candidate is a strawman (each has a real anchor and a real loss mode).
2. **Validate.** The concern set covers the iteration's architecture surface: placement,
   transport, seeding, provenance. The apply-lane scope is deliberately excluded and parked
   in q-io-lane-scope for the owner - the one decision the standing grant does not cover.
3. **Red-team.** Hardest push: "B1 makes the register depend on --watch" - answered by the
   B1+B2 composition (static mode stays honest with emitted commands). "D1 bloats node
   files" - bounded: provenance is one line per schema field, and only fields the schema
   names. Kill criterion for M4: a candidate set that cannot pass the reversed sensitivity
   check unflipped loses the slot.

**Verdict: PASS.** Killer milestone gate. Blessed by the driving agent under the owner's
standing overnight grant (2026-07-13); collected for the morning review.
