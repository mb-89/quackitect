---
kind: method
statement: Internal quality is the quality of the engineering artifacts. Neglect shows up later as technical debt, so it is judged at every delivery.
catalog: iq_checklist
catalog_sections: Checklist
---

## Situation

Guidance for M7 gate-implementation's quality_ok. Internal quality is
"developing the system RIGHT" — the quality of the artifacts, distinct
from external quality (does it do the right thing).

Neglect does not show up today. It shows up as TECHNICAL DEBT: rising
cost of change, unplanned interruptions, expensive stabilization.

## Checklist #work

The gate's quality_ok field serves these as checkboxes. Checking one is
a claim; leave it unchecked and the form says what is still owed.

- Dependencies stay layered — no new cycle, no skipped layer
- Every new element carries one stated responsibility
- The linter and the complexity ceiling are clean, with no new suppression
- Every new behavior carries its check, and the battery is green at rest
- Nothing speculative shipped — no option built for a future nobody named
- What changed is findable — cards, guidance and specs moved with the code
- Every quick-and-dirty taken stands as a visible raid debt entry

## Managing the debt #work

- DEBT IS VISIBLE OR IT IS LYING. Every conscious trade of quality for
  speed becomes a raid entry of kind `debt`, graded like every other
  entry. The gate lists what this iteration took.
- Going into debt deliberately is a legal choice — WITH a payback
  trigger. Debt without a trigger is filed and forgotten.
- The standing strategy is small, regular repayment folded into normal
  work — never a big-bang rewrite, never "ignorance is bliss".
- "Stop the line" when debt rises past what the owner accepted.

## Sources

- SyA Driving Internal Quality (Sauer and Hahn 2021) —
  @ai/sya_kb/digest/sya/22_Driving-Internal-Quality.md: the quality
  layers, the measurement aspects behind the checklist, debt
  monetization, the management strategies, stop-the-line.
- The register mechanics are [[meth-raid]]; the grades are
  [[meth-damage-scale]] and [[meth-likelihood-scale]].
