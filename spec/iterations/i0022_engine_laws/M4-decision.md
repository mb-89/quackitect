# M4 — Decide the architecture (evidence)

## chosen architecture stated  → i22-m4-chosen-architecture-stated

Four moves, one sentence each:

- Command guards run as ONE pass in dispatch, before any handler (adr-guard-dispatch-layer).
- Battery trust guards wrap the single verdict-write function (adr-verdict-write-guard).
- A standing grant is a ledger event pair; in-scope blesses stamp the grant id (adr-grant-ledger-events).
- The CLI block activates on an owner-declared lane in project.toml (adr-mcp-lane-declared); the battery gains progress, batch, and cores inside the guarded write (adr-battery-run-shape).

The lints extend the existing lint and selftest frameworks; no new subsystem.

## choice traced to the weighted criteria  → i22-m4-choice-traced-to

Pugh run 1. Datum: candidate B (per-command guards, today's de-facto pattern).

| criterion (weight) | A dispatch layer | C config policy |
|---|---|---|
| trust (0.30) | + one predicate set, no drift | − agent-editable policy file |
| over-blocking safety (0.25) | + uniform refusal wording | + rules visible |
| coverage uniformity (0.20) | ++ guarded by default | + declarative |
| walk speed (0.15) | 0 one lookup per dispatch | 0 |
| build cost (0.10) | + one home | −− interpreter subsystem |
| weighted sum | +0.85 | −0.30 |

Pugh run 2 (controlled convergence). Datum: A, the run-1 winner. B scores −0.50
(uniformity and trust drift negative, all else level). C scores −1.15. A holds.

Sensitivity, REVERSED as demanded: A loses to B only when uniformity weighs near
zero AND dispatch coupling counts as dominant cost. That world says "new commands
never forget their guards and dispatch must stay pristine" - the i21 record
contradicts the first half outright. Not credible; no tripwire from weights.
One real tripwire recorded instead (in the ADR): a per-command rule table past
ten entries re-opens candidate B.

## views chosen  → i22-m4-views-chosen-model

- element-tree (model-guard-tree): where does each new part sit? Eleven leaves, every future design marker allocated.
- state (model-grant-lifecycle): what modes does a grant have? The conformance contract for go-grant-store.
- context: chosen as DERIVED (the free nbr- star); no authored context diagram.
- sequence: REJECTED for this iteration - no new cross-party flow; the register-ask-flow precedent already draws the answer path, and the guards are single-party refusals.

Two authored models - the default budget, held.

## structuring method considered  → i22-m4-structuring-method-considered

Skipped, recorded: eleven leaves fall into four self-evident groups (command /
grant / battery / lint). A DSM over eleven elements with obvious clustering buys
nothing. The register (spec/methods) stays available for a bigger cut.

## model authored  → i22-m4-model-authored-the

Both models exist as nodes with elements allocated ahead of code, each leaf
carrying its placement line and its in/out contract
([model-guard-tree](model-guard-tree.md), [model-grant-lifecycle](model-grant-lifecycle.md)).
All five ADRs are `kind: architecture` and linked `chosen` to the model they shape.
The M6 build fills exactly these leaves; a new element goes back through review
(sky-fall).

## ADR recorded and traced  → i22-m4-adr-recorded-and

Five ADRs minted in [spec/decisions/](../../decisions/), each addressing its
requirements over the connections lane (10 addresses edges and 5 chosen edges).
The derived check computes it.

## Review rounds and verdict  → i22-m4-gate

Round 1, verify: the Pugh table's datum is the strongest rival rather than a straw man.
Run 2 re-converged on the winner. The sensitivity check was reversed and judged
out loud. Both models render valid mermaid and carry per-element rationale.

Round 2, validate: every M1 criterion maps to an allocated element. The two owner
rulings shaped exactly the two ADRs that needed them (adr-mcp-lane-declared
realizes q-cli-steering A with an activation boundary instead of a walk-stranding
unconditional block; adr-grant-ledger-events realizes q-grant-honesty A).

Round 3, red-team: the sharpest attack - the lane declaration reintroduces config
the agent could edit and so softens ruling A. Held: the declaration is git-tracked
owner intent with the same visibility as the contract itself, and the M7 demo
tripwire forces the block to be shown live. Second attack: eleven design markers
for five requirements' worth of code smells like ceremony. Held: the markers ARE
the model conformance surface; fewer markers means blinder sky-fall checks.

Verdict: PASS. The DIAGRAM review is the owner's by hard rule - taken under the
standing grant, flagged first in the morning-review collection: the owner should
open model-guard-tree and model-grant-lifecycle at confirmation.
