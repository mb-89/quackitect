# refine — expeditions: explore wide, promote narrow

> Loaded by `/engage refine`. Once a build exists and you are not starting a new
> iteration, this is the DEFAULT working mode. It formalizes what the project does
> all the time anyway: exploration is cheap and unlimited,
> authority is expensive and gated.

<!-- design: expedition-method  implements: req-expedition :: An expedition has unlimited epistemic reach and zero authority. Its findings enter the ledger only through the promotion gate — an owner ruling. Interior churn (drafts, dead ends, reversals inside the spike) never touches the ledger or moves a hash. -->
## The expedition invariant

An expedition may read anything, draft anything, prototype anything, and be wrong
as often as it likes — **unlimited epistemic reach, zero authority**.

- **Zero authority.** Nothing an expedition produces binds the project. No finding
  fires a suspect, no draft counts as a design, no conclusion adjudicates a gate.
- **The promotion gate.** A finding becomes real ONLY when an owner ruling promotes
  it — captured backward into a design-input check, a question node decided, or a
  note triaged. The promotion is the FIRST moment the ledger learns anything happened.
- **Interior churn is free.** Everything inside the spike home — rewrites, reversals,
  abandoned branches — stays off the ledger and moves no hash. Churn-aversion must
  never throttle exploration; only promotion pays the ripple.
- **Burden of proof scales with blast radius.** Promoting a wording fix needs a
  sentence; promoting an architecture change needs the evidence an M3 decision would
  need. The gate's scrutiny grows with the cone the promotion will reopen.
<!-- enddesign -->

## The cycle

> **Opinionated visuals (owner law):** never blind-iterate a figure's look. Get the DATA
> derived and pinned first; render ONE first cut; the owner reviews and rules, round by round.
> When the figure is a dense GRAPH (tens of edges), reach for the inlined graph library over a
> hand-laid SVG - routing is its job, and print-friendliness is deliberately traded away.
> Capture every visual ruling backward into the requirement in the same round.

1. Take the user's **idea and their motivation**. Run a light coherence check. Does it fit the frame and vision? This is a quick judgment, not a gate. If it clearly does not fit, capture it as a note and stop.
2. **EXPEDITION**: spike it in the data home (`<data-home>/spikes/<id>/`). Throwaway scratch space, outside the repo entirely. Do NOT touch `product/` or any gated check yet. Iterate fast. Keep or discard. Name the expedition after its question.
3. On a **keeper**, **promote through the gate**: present the finding and its blast radius; the owner ruling captures it backward into the right design-input check (M1, M2, or M3 — the requirement or design it really was). That edit — and only that edit — reopens the affected checks SUSPECT.
4. `quack next` then walks exactly the reopened cone. A contained change reopens little. An architecture-break steps back to M3. Re-walk. Then keep refining, or `ship`.

Discard the spike when done. A rejected idea → archive a note WITH its reason. That makes the rejection durable.

## Open questions ride the trace

When an expedition surfaces a genuine unknown the owner must rule on, mint it as a
**question node** (`type: question`, `state: open`) instead of burying it in prose.
Questions are first-class trace content: they link to what they block, they show on
the board, and when decided they record their provenance (`state: decided`,
`decided_via: <how — owner ruling, expedition finding, measurement>`). Elicitation
itself runs as an expedition: gather the candidate answers wide, promote the ruling
narrow. Taste stays with the owner — the ledger records WHAT was decided and via
what; it never simulates the deciding.
