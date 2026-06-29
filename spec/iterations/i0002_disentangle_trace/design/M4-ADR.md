# M4 — ADR: fixed V-model trace; tasks separate; gates are derived coverage

**Decision.** The trace is a FIXED 5-layer V-model of typed nodes:

    need  ->  use-case / user-story  ->  requirement (functional | non-functional)  ->  design  ->  test

- **Semantic edges** (cross-type only — no same-type refinement): a use-case **`refines`** a need, a
  requirement **`refines`** a use-case, a **design `implements`** a requirement, a **test `verifies`**
  a requirement — the V hinges at the requirement. A node names its parent's id in the matching field
  (`refines:` / `implements:` / `verifies:`), so the requirement id appears in each design and test
  node. Display orders the types need < use-case < requirement < design < **test** (test last). Fixed
  depth — more or fewer layers signals a MODELLING ERROR.
- **`requirement` is one type, tagged `functional` or `non-functional`** (qualities are NFRs; ISO/IEC
  25010 for the taxonomy). **Architecture is NOT a trace node** — it lives in design prose.
- **Tasks are separate, prefixed instance data** (`TASK-`/`MARK-`), excluded from the trace; their
  append-only marks ARE the attest event-log already built. No task<->trace per-node link.
- **Milestones are DERIVED reachability-coverage gates** (pass computed from the trace, never stored):
  every need reaches a use-case, every use-case a requirement, every requirement a design and a test,
  no orphans. A **lint** surfaces holes. Coverage advances by phase: early = need/uc/requirement;
  post-arch = requirement has a test-definition; post-impl = requirement has a design; post-verify =
  requirement has a passing test.

**Why (grounded).** Matches sebot (typed atoms + `refines`; prefixed instance data excluded from the
trace; "trace coverage = needs with a path to a test") and the RTM / V-model standard (every
requirement traces to a test, bidirectional). Requirements in **EARS** ("THE SYSTEM SHALL…") make each
testable, so the coverage gate is natural.

**Supersedes** the earlier B1 `task -> design implements` link — wrong: it tied execution to the
trace. The trace is spec+design only; tasks are separate.

**Dogfood (required).** quackitect's own spec is retyped into this V-model — it is the proof the model
holds, not optional.

**Reuse.** `type` + `refines` extend the check format; `full_hash`/suspect carry over (a requirement
reopens its design + test on change). Coverage + orphan lint are pure derivations over the typed trace.
