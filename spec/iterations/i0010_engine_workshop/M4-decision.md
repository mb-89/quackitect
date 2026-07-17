# M4 — Decide the architecture (i0010_engine_workshop)

## Architecture stated  → i10-m4-architecture-stated

One card per axis. Candidates and pro/cons live in [M3-candidates.md](M3-candidates.md).

**A1 — cache shape**

- Decision: one JSON verdict map in the data home. Atomic rewrite per battery.
- Because: verdict sets are small. One read, no compaction logic.
- Rejected: append-only log (grows, needs compaction), spec residency (caches are never truth).

**A2 — build identity**
- Decision: sha256 self-hash of the running binary, once per process.
- Because: it cannot lie. A rebuild always invalidates.
- Rejected: version constant. A forgotten bump serves stale verdicts — the mtime failure class again.

**A3 — call log**

- Decision: `calls.jsonl` in the logs home. One redacted line per dispatch.
- Retention: retro-bound (owner ruling) — the retro aggregates, then deletes the log. No rotation machinery.
- Because: the log exists FOR the retro. The retro opens every engage start, so the growth window is one iteration.
- Rejected: per-day files (aggregation reads many), SQLite (zero-dep), size-cap rotation (a tuning knob replaced by a process fact).

**A4 — ratchet**
- Decision: `quack build` writes a version stamp into the vendored source. The launcher ratchets only FORWARD, by comparing stamps.
- Because: the rule is semantic ("newer engine"). The stamp records exactly that.
- Rejected: mtime (fresh clones rebuilt backward — the observed bug).
- Contingency: the M5 spike must prove fresh-clone correctness. Otherwise the hash guard folds in.

**A5 — stamp vocabulary**
- Decision: every surface a person reads says **user** (or the role). The recorded stamps (`actor=human`, `--by human`) stay frozen FOR NOW.
- Because: one metric vocabulary across history keeps the self-cert metric honest today.
- **Sunset (owner-directed 2026-07-04):** the freeze is a bridge, not an end state. The frozen vocabulary is on the geronticide kill-list — a future iteration renames the records to `user` with a proper ledger migration. Churn is acceptable; churn-aversion is not a deciding criterion.
- Rejected: doing the rename inside THIS iteration (it deserves its own migration walk), channel terms (overrides the ruling).

**A6 — notes surface**
- Decision: `quack notes [--all]`. Read-only.
- Because: discoverable noun. Room for later sub-ops.
- Rejected: `note --list` (a write verb growing read modes).

**A7 — why source**
- Decision: `why` computes the coverage delta live.
- Because: no second cache to keep honest.
- Rejected: recorded flip-reasons (new state, new staleness risk).

**Pager merge** (shape was fixed at M3, from the owner's note)

- Decision: merge the HAND-OFF, never the nodes. One combined pager when the last open killer subtask and its gate are ready together. Both blesses recorded individually. Split answers possible.

## Choice traced  → i10-m4-choice-traced

Only A5 was contested. Pugh run 1, datum = prose-only sweep (the strongest rival — voice.md already prescribes it).

| Criterion (weight) | rename now + migration | channel terms |
|---|---|---|
| C2 truth in spec (5) | − | − |
| C5 metric continuity (4) | −− | −− |
| C6 smallest honest diff (3) | − | − |
| one vocabulary everywhere | + | S |

Both challengers net negative → datum wins. Run 2 (worth doing at all): the sweep wins on the owner ruling at near-zero risk.
**Owner correction at the gate:** churn-aversion (C5/C6) is a human-team instinct and must not decide architecture. The verdict stands only because the rename gets its OWN iteration (geronticide), not because churn is expensive. Recorded here so the criteria weighting is corrected in future runs.

Other axes: winner beat the strongest rival on the named criterion (see the cards). Sensitivity: no plausible re-weighting flips A1–A4 or A6 or A7 — each rejection is a correctness or zero-dep argument, not a churn argument.

## ADR recorded  → i10-m4-adr-recorded

Six decisions minted in [spec/decisions/](../../decisions/):

- adr-verdict-cache
- adr-build-identity
- adr-call-log
- adr-ratchet-stamp
- adr-stamp-vocabulary
- adr-pager-handoff

`coverage:adr-traced` computes live.

## Milestone review  → i10-m4-gate

**Round 1 — verify.** Every M3 axis carries a decision card. The contested axis carries the Pugh run with the datum discipline. Six ADRs minted, each addressing a named requirement — `adr-traced` green.

**Round 2 — validate.** The owner rulings land intact:

- "user replaces human" on every read surface.
- The stamp freeze is explicitly a bridge with a recorded sunset.
- The pager decision preserves node separation.

No decision contradicts a shipped ADR.

**Round 3 — red-team.** Dissent argued and recorded: the ledger writes `actor=human` while the surface says "user" — a vocabulary split. Answer: records are historical facts and the split is time-boxed by the geronticide sunset. Kill-criterion on A4 stands (spike must prove fresh-clone correctness).

**Verdict: PASS** — proceed to bless. No reopened checks.
