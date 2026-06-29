# M3 — candidate architectures (trace / task-list split)

Two viable candidates inside the "separate store" space (A rejected — re-conflates the axes;
external ALM out — quackitect is self-contained). Both keep the **design trace untouched** (design
nodes stay in `spec/**`, hashed + attested as today) and put task-lists in a **separate per-iteration
store**, milestone-grouped, with completion derived from the **append-only marks** built in
`req-metrics`. They differ on one axis: **authored vs derived.**

## B1 — authored + linked
- A per-iteration task store (e.g. `spec/iterations/<iter>/tasks/`), milestone-grouped (M1..Mn);
  each step holds its checks.
- Each task/step carries a trace-link `implements: <design-node-id>` → bidirectional traceability
  (requirement→task and back).
- Authored by the agent/human during engage (like composing the checklist now, but into the task
  store, not the trace).
- The trace graph reads design nodes only; the iterations panel reads the task store.

## B2 — derived + linked
- The task-list is **generated** from the design DAG: per design node × milestone, a policy emits
  the steps to build it. Single-sourced (design is the source; tasks are a projection) → no drift.
- Links are inherent (a task derives from its design node).
- Needs an **escape hatch** for tasks no design node implies (e.g. "migrate attest", "fix ship
  label") — and a generator/policy engine.

## Criteria (weighted, from the requirements)

| Criterion (source) | Weight | B1 | B2 |
|---|---|---|---|
| No-regression to suspect/bless (`req-split`, killer) | 5 | ok | ok |
| Reuse append-only marks (`req-metrics`) | 4 | ok | ok |
| Traceability guaranteed (field RTM) | 3 | good (authored link) | best (inherent) |
| Flexibility — tasks the design doesn't imply (i0002 has them: migration, ship-fix) | 5 | **best** | weak (needs escape hatch) |
| Drift-resistance / single-source (sebot 0020) | 3 | weaker | **best** |
| Implementation cost / simplicity | 4 | **low** | high (generator engine) |
| Authoring freedom | 2 | high | constrained |

## Rough feasibility
- **B1** — feasible now: a task+check store with `implements:` links, marks from the append-only
  attest, engine reads design-only for the trace and tasks for the panel. No blocker. Riskiest piece
  is the append-only attest migration (the M5 spike), shared by both.
- **B2** — feasible but needs a generator/policy engine + an escape hatch; higher cost, and the
  generator is a second riskiest unknown on top of the attest migration.

## Lean (decided at M4, not here)
**B1.** For a small, evolving, dogfooded system whose very next iteration has tasks no design node
implies (attest migration, ship-label, verify-tool), flexibility + low cost beat B2's drift-resistance.
B2-style derivation can be added later as a policy that *seeds* a B1 store, then hand-edited — best of
both, but out of scope now.
