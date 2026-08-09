---
kind: method
statement: "The increasing-scrutiny review a gate gets before it is blessed. Three rounds, over the gate's items and its whole input cone."
---

## Situation

Every gate, via [[meth-gate-review]]. Ported from v1's milestone-review guide.
v2 cited that guide as "rubric-cited" without ever carrying the rubric.

In v2 this content sat crammed into a frontmatter field. The body is its home.

A gate is NEVER blessed on procedure alone. Each review covers TWO SETS.

- The gate's own acceptance items.
- Every input state feeding it — the dependency cone since the last gate.

Reviewing only the gate's own fields is the common failure. It is not a
review.

## The rounds

### 1. VERIFY — built it right

Did each input state deliver? Read the evidence or the referent.

Confirm the work EXISTS and MATCHES ITS CLAIM. A bless is not proof.

Open what the evidence points at, rather than trusting its description of
itself.

### 2. VALIDATE — built the right thing

Does this meet the original intent, and not merely its own plan? The intent is
the frame, the vision and the REQUIREMENT REGISTER.

List what is missing, wrong or out of scope.

WATCH FOR ASKS THAT NO CHECK COVERED. A requirement no acceptance item happens
to test is exactly where a design drifts from its register.

### 3. RED-TEAM — argue the opposing case before you endorse

Cite a rubric, not vibes. The rubric is the criteria, the register or the goal
system.

A significant decision carries a KILL-CRITERION. Name what would have to be
true for this to be the wrong call, then look for it.

Frame open questions so they can be FALSIFIED rather than agreed with.

An OVERRIDE blesses past an unmet criterion. It is legal, and it is logged
WITH ITS DISSENT, never as a clean pass.

## Rules

- RISK-WEIGHTED. Deepest scrutiny goes first to the riskiest, most central
  items.
  - Risk rises with graph centrality.
  - Risk rises with reversal history.
  - Risk rises where a person has to judge.
- TRUST COMPUTED MARKS. They are deterministic.
- SCALE TO SIZE. Do not red-team a trivial gate.
- THE AGENT NEVER SELF-CERTIFIES A KILLER. v1's answer was a human
  adjudicator.
  - For unattended runs the substitute must be mechanical or adversarial,
    never absent.
  - Until one exists, a self-blessed killer is an OVERRIDE, logged with its
    dissent.
- VERDICT. One of three, and never a silent pass.
  - PASS.
  - PASS WITH NOTED OVERRIDES.
  - REOPEN, with named states and reasons.
- NOT PORTED FROM v1, deliberately: the M4 diagram hard-rule and its
  boilerplate-stamp question.
  - THE ARCHITECTURE MATRICES are reviewed instead — [[meth-dsm]],
    [[meth-dmm]] and [[meth-mdm]].
  - The owner ruled that v1's diagrams never really worked.
  - Those matrices replace both the diagram and the view selection.

## Why this exists

v2's i12 found three things about its own gate template.

- Verify, validate, red-team and verdict had been required since it was
  written.
- No evidence form ever collected them.
- Not one had been filled, in any gate of any iteration.

The verify round alone would have caught a rule being violated by the very
design claiming to satisfy it. The red-team round would have surfaced the
owner's counter-argument before the decision rather than after.
