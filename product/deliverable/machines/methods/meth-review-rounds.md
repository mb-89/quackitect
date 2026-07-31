---
kind: method
statement: "The increasing-scrutiny review a gate gets before it is blessed: verify, validate, red-team - over the gate's items AND its whole input cone."
---

## Situation
Every gate, via [[meth-gate-review]]. Ported from v1's milestone-review guide, which v2 cited as "rubric-cited" without ever carrying the rubric. In v2 this content sat crammed into a frontmatter field; the body is its home.

A gate is NEVER blessed on procedure alone. Each review covers TWO SETS: the gate's own acceptance items, AND every input state feeding it - the dependency cone since the last gate. Reviewing only the gate's own fields is the common failure and it is not a review.

## The rounds

1. VERIFY - built it right. Did each input state deliver? Read the evidence or the referent; confirm the work EXISTS and MATCHES ITS CLAIM. A bless is not proof. Concretely: open what the evidence points at rather than trusting its description of itself.

2. VALIDATE - built the right thing. Does this meet the original intent - the frame, the vision, the REQUIREMENT REGISTER - and not merely its own plan? List what is missing, wrong, or out of scope. WATCH FOR ASKS THAT NO CHECK COVERED: a requirement no acceptance item happens to test is exactly where a design drifts from its register.

3. RED-TEAM - argue the opposing case BEFORE you endorse. Cite a rubric, not vibes: the criteria, the register, the goal system. A significant decision carries a KILL-CRITERION - name what would have to be true for this to be the wrong call, then look for it. Frame open questions so they can be FALSIFIED rather than agreed with. An OVERRIDE blesses past an unmet criterion: it is legal, and it is logged WITH ITS DISSENT, never as a clean pass.

## Rules

- RISK-WEIGHTED: deepest scrutiny first on the riskiest, most central items - risk rises with graph centrality, reversal history, and human-judgement verifiers. Trust computed marks; they are deterministic. SCALE TO SIZE: do not red-team a trivial gate.
- THE AGENT NEVER SELF-CERTIFIES A KILLER. v1's answer was a human adjudicator. For unattended runs the substitute must be mechanical or adversarial rather than absent - and until one exists, a self-blessed killer is an OVERRIDE, logged as one with its dissent.
- VERDICT: PASS, PASS WITH NOTED OVERRIDES, or REOPEN with named states and reasons. No silent pass.
- NOT PORTED FROM v1, deliberately: the M4 diagram hard-rule and its boilerplate-stamp question. THE ARCHITECTURE MATRICES are reviewed instead - the structure and mapping matrices ([[meth-dsm]], [[meth-dmm]], [[meth-mdm]]) - because the owner ruled that v1's diagrams never really worked and that reviewing those matrices replaces both the diagram and the view selection.

## Why this exists
v2's i12 found that its gate template had required verify/validate/redteam/verdict since it was written, that no evidence form ever collected them, and that consequently NOT ONE had been filled in any gate of any iteration. The verify round alone would have caught a rule being violated by the very design claiming to satisfy it; the red-team round would have surfaced the owner's counter-argument before the decision rather than after.
