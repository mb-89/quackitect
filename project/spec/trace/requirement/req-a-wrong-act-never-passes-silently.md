---
minted_in: i27
id: req-a-wrong-act-never-passes-silently
type: "[[requirement]]"
statement: When a call violates a rule the engine holds, the engine shall prevent it by construction, apply the correction and name it in the answer, or refuse with a remedy, and shall complete zero violating calls reporting success.
kind: quality
characteristic: reliability
verify_method: test
breaks_if_removed: A wrong act reports success, so every guarantee the lane makes becomes a claim nobody can check, and the failure is found at a merge or never.
breaks_how_badly: fatal
measure: 0 violating calls that complete reporting success, across the named classes, each class carrying its own test.
refines:
  - uc-take-a-step
  - uc-quality-reliability
source_refs:
  - "owner ruling 2026-08-14: a silent failure is not acceptable, and the failure modes have an order"
  - note-fd50bc919274
  - req-refusal-carries-remedy
  - raid-risk-a-write-lands-in-the-wrong-tree-silently
priority: should
weighs_against:
  - req-call-answers-in-one-second > — it heads the standing chain and is graded corrosive; this row is fatal and makes every other guarantee checkable, so it takes the head and transitivity settles the rest
---

## Scenario

- Source: any caller at the lane, agent or person.
- Stimulus: a call that violates a rule the engine holds — a write to the
  wrong tree, a read from the wrong tree, a state entered without its ground.
- Artifact: the serving engine.
- Environment: normal operation, any host, bound or unbound.
- Response: the act is prevented, corrected-and-named, or refused with a
  remedy.
- Response measure: zero violating calls complete reporting success.

## Detail

THE FOUR MODES ARE ORDERED, best first. A design is graded by how far up
this order it sits, and the fourth is a floor nobody may rest on.

| rank | mode | what it looks like |
| --- | --- | --- |
| 1 | prevented by construction | a schema, a type, an unrepresentable state — the wrong thing cannot be expressed |
| 2 | corrected and named | the engine fixes it safely AND says in the answer that it did |
| 3 | refused with a remedy | typed, naming the clause, carrying the exact call to make instead |
| 4 | silent | the act completes and reports success — FORBIDDEN |

RANK 2 IS NOT A LICENCE TO CORRECT QUIETLY. A correction the caller cannot
see is a rank 4 wearing rank 2's clothes. se_file_patch already does this
right: a CRLF difference is applied in the file's own endings and NAMED on
the result as `corrected`.

RANK 1 BEATS RANK 3 WHEN IT IS ENFORCED, and not otherwise. A construction
that any code path can bypass degrades to rank 4 the moment one does, which
is worse than the rank 3 it replaced. So a design claiming rank 1 owes an
argument that the construction cannot be bypassed.

## Why this is `should` and not `must`

A `must` is a demand and is never scored (meth-derive-criteria). This row
exists because the register was BLIND to failure mode: two candidate
architectures scored identically on twelve criteria while differing on
exactly this, and nothing could see it.

So it is written to be SCORED. The absolute part — rank 4 is forbidden — is
the measure's zero and the pass line, not a softening.

A SIBLING `must` MAY BE OWED, stating the floor alone so it also gates every
candidate pass or fail. Named here rather than minted, because one row that
verifies one way is the rule and a gating row verifies differently.

## Behaviour

No model wanted. One ordering, checked per class at one seam.
