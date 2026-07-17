# M4 — Decide the architecture (i0021_field_ux)

## Chosen architecture → i21-m4-chosen

One sentence: **the register is a live-report tab whose answers ride the watch server onto the
existing ask path; provenance lives in the node and start seeds the checklist by parsing the rigor
source.**

Pugh runs per concern, datum = the strongest viable rival (weights from M3 criteria):

| criterion (w) | A1 report-tab vs A2 standalone (datum) | B1+B2 watch/commands vs B3 phone-only (datum) | C1 parse-at-seed vs C2 copy (datum) | D1 in-node vs D2 sidecar (datum) |
|---|---|---|---|---|
| unification (3) | + | + | 0 | + |
| provenance integrity (3) | 0 | + | 0 | + |
| drift immunity (2) | + | 0 | + | 0 |
| overlay fit (1) | 0 | 0 | + | 0 |
| build cost (1) | + | - | - | 0 |
| **net** | **+6** | **+5** | **+2** | **+6** |

Controlled convergence: each winner re-ran as its own datum against the remaining rival (A3
book view / B2-alone / C2-with-drift-lint / D1-lean variant). No rival beat the winner on any
weighted criterion. The D1-lean variant (source tag only in frontmatter) is recorded as the
fallback inside [adr-provenance-in-node](../../decisions/adr-provenance-in-node.md). Decisions - all kind:architecture, each carrying its datum and tripwire in the statement:

- [adr-register-in-report](../../decisions/adr-register-in-report.md)
- [adr-register-watch-answers](../../decisions/adr-register-watch-answers.md)
- [adr-seed-from-rigor-source](../../decisions/adr-seed-from-rigor-source.md)
- [adr-provenance-in-node](../../decisions/adr-provenance-in-node.md)

The apply-lane SCOPE stays undecided by design: [q-io-lane-scope](q-io-lane-scope.md) is the
owner's ruling; req-apply-general keeps the lane capable under any outcome.

Non-killer review; blessed by the driving agent.

## Choice traced, sensitivity REVERSED → i21-m4-traced-choice

Each choice traces to the weighted criteria above. The reversed check - the first plausible
world where each winner LOSES, judged out loud:

- **A1 loses** if the register needs a layout the report shell cannot host (a full-page
  spreadsheet-like grid). Credibility: low - rows+expand match the report's existing detail
  idiom. Tripwire in the ADR: the M5 spike must show a row+questionnaire living in the report
  DOM.
- **B1 loses** if re-entering the engine from the watch server wedges against a binary swap
  (the staged-swap behavior seen 2026-07-13). Credibility: real enough to record - the ADR
  names the wedge as its tripwire and B2 (command emission) as the everywhere-fallback.
- **C1 loses** if checklist prose resists parsing without fragile heuristics. Credibility:
  low - gather already walks these files and their structure is a disciplined template; the
  ADR records C2+drift-lint as the return path.
- **D1 loses** if provenance bloats nodes beyond readability. Credibility: moderate for
  verbose sources; the recorded fallback is the lean variant (tag in frontmatter, prose in
  the rationale). Not a flip - a degradation path inside the same choice.

No credible full flip found. Two tripwires recorded (B1 wedge, D1 bloat). Non-killer review;
blessed by the driving agent.

## Views chosen → i21-m4-views

From the registry (two-model default budget):

- **model-engine-layers (onion, EXTENDED)** - question: where do the new blocks sit and what
  may they depend on? Eight new elements allocated (plus two late i20 allocations closing the
  sky-fall findings).
- **[model-register-ask-flow](model-register-ask-flow.md) (sequence, NEW)** - question: how
  does an answer travel from tap to recolor on both lanes? The killer-guard is the first
  branch; both lanes converge on one ask store.

Rejected kinds, recorded:

- element-tree (the onion already carries part-of placement for these elements; a second tree
  would duplicate it)
- state (the register row's states are two colors plus green-variants - too small for a state
  model)
- context (the M2 context figure already answers it at iteration scope)

Non-killer review; blessed by the driving agent.

## Structuring method considered → i21-m4-structuring

Considered and SKIPPED, with reason: the elements slot into an existing owner-approved onion
whose bands already encode the layering. A DSM run needs a coupling matrix over new elements
that do not exist yet. Post-build, the standing conformance lint plus a future `quack cluster`
run can challenge the cut. The cut was obvious enough to skip; recorded per the checklist.

Non-killer review; blessed by the driving agent.

## Model authored → i21-m4-model-authored

The HARD RULE held ahead of any code:

- Elements allocated: go-field-tier, go-register-colors (kernel); go-mint-prefill (services);
  go-provenance-block, go-register-render, go-seed-skeleton, go-apply-general (rim--graph);
  go-register-answer (rim); late allocations go-defer-retire (services) and
  go-vehicle-misuse-guard (rim--graph).
- Structure drawn: the onion bands place every element; the sequence model wires the
  interaction I/O (tap -> questionnaire -> answer -> record -> provenance -> recolor).
- Inputs/outputs wired: the M2 context figure carries the data flow (schema -> mint -> register
  -> browser/phone -> ask -> provenance); the sequence model carries the per-message contract
  the builder fills against.
- Placement rationale: one line per element in the model's allocation prose (by essence:
  rule/kernel, content-rule/services, file-or-render transform/rim--graph, transport/rim).
- Architecture ADRs marked kind:architecture and linked to their elements via addresses edges
  (the informed-by lane).

Killer review. Blessed by the driving agent under the owner's standing overnight grant
(2026-07-13); the DIAGRAM REVIEW seat is explicitly delegated to the morning - the extended
onion and the sequence model are first on the morning list.

## Milestone review → i21-m4-gate

1. **Verify.** Four concerns decided with recorded Pugh runs. Every ADR carries datum +
   weights + a tripwire in its statement. The model allocations exist in the ledger (the
   conformance lint now expects exactly these elements). adr-traced computes green (every ADR
   addresses a requirement).
2. **Validate.** The decisions realize the M1 vision (one system / computed colors / veto
   lane) and honor every M2 obligation: the single-schema watch-item shaped D1's fallback.
   The integrator criterion shaped the overlay weight. The two-greens and killer-guard
   survived into the sequence model's first branch.
3. **Red-team.** Strongest opposing case: "B1 adds a server dependency to a static-output
   philosophy." Answered structurally - the static lane stays first-class (B2 command
   emission), the server only exists where --watch already runs. OPEN QUESTION IN THE CONE,
   named per the law: q-io-lane-scope (apply-lane scope) - blessed past KNOWINGLY. It blocks
   no M5/M6 capability work and the owner rules it in the morning.

**Verdict: PASS.** Killer milestone gate. Blessed by the driving agent under the owner's
standing overnight grant (2026-07-13); collected for the morning review with the diagram
review flagged as its first item.
