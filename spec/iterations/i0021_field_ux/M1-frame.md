# M1 — Frame the problem & vision (i0021_field_ux)

## Vision & scope stated → i21-m1-vision

Moore vision:

- **For** the spec owner driving work through a gate ledger
- **who** faces hundreds of empty template slots at every compose and mint,
- **the** field-ux release of quackitect
- **that** pre-fills every field with a justified proposal and renders judgment as a computed
  traffic-light register - work the reds, skim the yellows, trust the greens.
- **Unlike** schema form builders (render blank), whole-document LLM generation (no per-field
  provenance), and requirements dashboards (compute status but propose nothing),
- **our product** derives colors from recorded provenance on machine-proposed content, on the
  existing ask/bless adjudication path.

PR-FAQ pressure test (condensed):

- *Press line*: "Filling a spec is now vetoing: the engine proposes every value with its source;
  the register shows where judgment is owed; a session is taps, not typing."
- *Q: Why not just better templates?* A: Templates cut slot count; they cannot cut the
  authoring mode. The delta is hundreds of BLANK decisions, and blanks are the mode.
- *Q: What if the proposals are bad?* A: Bad-and-visible is the design: colors derive from
  provenance, an unadjudicated core field is red by rule, and the dangerous class
  (over-green) is named and guarded (M1 obligations below).
- *Q: Why now?* A: The schema layer shipped in i18 unconsumed; the seeding defer (i20-m4-seed)
  falls due here; the pieces exist separately in the wild and nobody has joined them.

Scope:

- schema consumption (mint prefill + tiers)
- the register (colors, render, ask, killer-guard)
- start-time seeding
- the approved ride-alongs (EARS sweep, rigor-fit, drivers table, lint scopes, battery tiers, deck-goto fix, apply-lane generalization with q-io-lane-scope open for the owner)

Non-killer review; blessed by the driving agent.

## The blank-template problem is agreed → i21-m1-problem

Goal / actual / delta:

- **Goal**: filling a quackitect spec is judging proposals - fast, differentiated, recorded.
- **Actual**: minting a node presents empty template slots. A requirement node carries ~15
  slots; a 30-node iteration composes to hundreds of flat, undifferentiated authoring
  decisions. The composer authors into blanks; nothing says which slot deserves judgment.
- **Delta**: the slot-count x node-count product is the cost wall. It was named by the owner in
  the 2026-07-10/11 cowork session (the onboarding-experience seed) and re-confirmed when this
  iteration was planned; i20-m4-seed was explicitly deferred INTO this theme.

External validation from the prior-art scan (above):

- Form-length costs are measured: 26% of shoppers have abandoned checkouts solely for
  too-long/too-complex forms (Baymard); the field-design canon says a field's default state is
  "does not exist" (Nielsen).
- The research community named the same wall for models: "low-modeling" - reduce hand-authoring
  by generation-first specification.
- The fix direction is market-converged: machine proposes, human curates (GitHub's 2026 veto
  dialog; tax prefill compliance gains).

The delta is real, owner-named and worth solving. This iteration exists for it.

Adjudication: killer review. Blessed by the driving agent under the owner's standing overnight
grant (2026-07-13: "assume for all killers that I approve/bless, collect them for the morning").
Collected for the morning review.

## Success is measurable → i21-m1-success

Ch1 success criteria for this iteration - each binary, each demonstrated at M7:

1. **Zero blanks.** A node minted on a schema reaches the user with 0 empty fields - every
   slot carries a value or an explicit counted TBD (test-mint-prefill).
2. **A veto session works end-to-end.** On a real node set: open the register. Resolve every
   red row through the questionnaire. Skim the yellows. Finish without typing a value into a
   blank (the M7 killer-uc demonstration of uc-work-register).
3. **Start seeds the skeleton.** `quack start` on a planned fixture version emits the full
   rigor gate/subtask set - lint-clean, ids namespaced (test-seed-skeleton). The hand-copying
   this compose itself did (~40 files) never happens again.
4. **Colors are computed.** Every register color is derivable from recorded provenance by rule;
   no color input is self-reported (test-register-colors).
5. **Lint exits 0 on the clean tree.** The EARS grandfather sweep lands; a new finding stands
   out (test-ears-baseline).

Non-killer review; blessed by the driving agent.

## Top risks logged → i21-m1-risks

Four RAID items minted. Each carries probability, impact and a concrete mitigation:

- [raid-register-scope-creep](../../raid/raid-register-scope-creep.md) - the register grows a parallel UI instead of unifying with the ask path.
- [raid-provenance-gamed](../../raid/raid-provenance-gamed.md) - proposals game the traffic lights; over-green is the dangerous class.
- [raid-seeding-drift](../../raid/raid-seeding-drift.md) - the seeder diverges from the rigor template.
- [raid-reviewer-habituation](../../raid/raid-reviewer-habituation.md) - the veto UX rubber-stamps itself; gate scarcity is the stated bet.

Non-killer review; blessed by the driving agent.

## State of the art checked → i21-m1-prior-art

Method: the referenced research capability (deep-research). 5 angles. 22 sources fetched.
25 top claims adversarially verified 3-vote - 24 confirmed / 1 refuted. Full verified report
retained in the session record; the load-bearing findings:

- **Schema-driven forms are solved, but render BLANK.** react-jsonschema-form and JSON Forms
  drive widgets, validation, and defaults from one JSON Schema at runtime. Both needed a SECOND
  artifact (uiSchema) for presentation. Neither generates field content.
  - Position: our schema layer (i18 `req-field-schemas`) matches the state of the art; the
    content-generating consumer (this iteration) is where they stop.
  - Caution for the design: expect the same single-schema pressure - plan for presentation
    hints without a second drifting artifact.
- **Prefill beats blank forms - with an asymmetric failure.** Peer-reviewed tax experiment:
  correct prefill improves compliance; errors FAVORING the filer erase the whole benefit and
  pass silently. For us: an over-green agent proposal is the dangerous error class, never the
  conservative one.
- **Prefill accuracy falls with case complexity.** IRS study: only 42-48% of returns could be
  accurately pre-populated; 78-82% for simple cases vs 10-30% for the most complex. For us:
  per-field provenance and color, never uniform trust in the prefill - which is exactly
  req-register-colors.
- **The veto UX is where the market converged.** GitHub replaced its one-click AI-fix handoff
  with a select-which-apply dialog (2026-05). Machine authors, human curates - our
  filling-becomes-vetoing is the same shape, applied to specs.
- **Habituation is the central threat.** Longitudinal study (11k reviews): approval of AI
  proposals rose while inspection effort fell ~28% - reflexive rubber-stamping, not trust
  calibration. Thoughtworks Radar holds "complacency with AI-generated code". For us: killer
  checks stay OFF the row-tap path (req-register-killer-guard), and the two distinct greens
  keep agent-confidence from reading as adjudication.
- **Computed readiness is established practice.** Jama's Trace Score derives 0-100% from
  relationship rules; IBM DOORS marks suspect links mechanically from change events and only a
  HUMAN clears them - the machine-marks/human-clears asymmetry our suspect/bless already
  embodies. The register extends the same pattern to field provenance.
- **Field tiering is validated HCI guidance.** NN/g progressive disclosure: core options first,
  the rest on request; presence on the primary display signals importance. Design constraint
  from verification: keep disclosure to TWO levels (req-register-render's collapsed/first/second
  expand is the ceiling).
- **Nobody combines the pieces.** Whole-document LLM spec generation exists (and "often requires
  human revision"); schema forms render blank; readiness tools compute status but propose no
  content. No surveyed system does justified per-field prefill + provenance colors + tiering +
  anti-habituation gates. The positioning space is empty as of 2026-07-13.

Refuted in verification (do not lean on it): "a wrong core/deferrable split is progressive
disclosure's primary failure mode" (0-3).

Design obligations the evidence imposes on this iteration:

1. Expect prefill quality to fall with node complexity. The register must make that visible
   per row, not average it away.
2. Treat agent-favoring errors (over-green) as the dangerous class; colors derive from
   provenance only (req-register-colors.4).
3. Instrument against habituation: killers never row-tap-resolve; two greens stay visually
   distinct.

Open positioning risk: a requirements-management vendor shipping field-level AI prefill with
provenance status would close the gap; the M3 candidates step re-checks before the architecture
commits.

Verdict on the check: filled - the idea is positioned against confirmed prior art, misses became
design obligations. Non-killer review; blessed by the driving agent.

## Milestone review → i21-m1-gate

Increasing-scrutiny rounds:

1. **Verify (built it right).** Every subtask delivered a referent. The Moore vision + PR-FAQ
   (this doc). The owner-named delta with external validation. An adversarially verified
   prior-art scan (24/25 claims confirmed, 1 refuted and discarded). Five binary Ch1 criteria
   each mapped to a composed test. Four RAID items with concrete mitigations.
2. **Validate (built the right thing).** The frame matches the approved plan and the owner's
   seeds verbatim: filling becomes vetoing. Schema consumption + register + seeding as the
   core. Ride-alongs named. Nothing out of scope entered.
3. **Red-team.** Opposing case "this is UI polish, not method": rejected - the delta is the
   authoring MODE and the register surfaces the contract's own FILL/ADJUDICATE split.
   Opposing case "prefill invites slop": the residual risk is logged (raid-provenance-gamed,
   raid-reviewer-habituation) with named guards. Kill criterion recorded: if the M7 register
   session cannot beat blank-form filling on a real node set, the iteration fails validation.
   Open questions in this gate's cone: none (q-io-lane-scope blocks M3/M4 and is named there).

**Verdict: PASS.** Killer milestone gate. Blessed by the driving agent under the owner's
standing overnight grant (2026-07-13); collected for the morning review.
