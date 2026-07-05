---
template: M4-decision
artifact: evidence-doc
applies_rigor: [systematic, lean]
applies_type: [default]
---
# M4 - Architecture decision (<iteration>, <rigor>)

TL;DR: <the chosen composite in one sentence; what it beat; whether the reverse run flipped anything.>

## Chosen architecture stated  -> <itag>-m4-architecture-stated
One decision card per axis:
- **<Axis>** - Decision: <what, with its ADR link>. Because: <the criterion>. Rejected: <loser with its killing reason>.

**Pugh run.** Datum = the STRONGEST viable rival: <name it honestly.>
| Criterion (weight) | Rival (datum) | Chosen |
|---|---|---|

**Sensitivity check:** <flip the weights; does the winner hold?>
**Reverse argumentation:** the first plausible combination of weight changes and rival variants where the winner LOSES: <name it>. Credible? <judge out loud.> A credible flip -> recorded tripwire with its fallback.

## Choice traced  -> <itag>-m4-choice-traced
<every card's Because names its criterion; losers carry reasons.>

## ADRs recorded and traced  -> derived check
<the minted ADRs, each addressing its requirement.>

## Milestone review  -> <itag>-m<n>-gate

**Verify:** did each input check deliver against its referent? **Validate:** does the milestone meet the frame and vision? **Red-team:** argue the opposing case; a significant decision carries a kill-criterion. **Verdict: PASS or the reopen list with reasons.**
