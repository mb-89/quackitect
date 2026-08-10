---
kind: method
statement: "ATAM-lite: walk the quality scenarios against the structure - architecture is EVALUATED, never verified."
---

## Situation

M5's evaluate-architecture, on the decomposed winner. The decisions are
recorded, the structure stands, and the question is one sentence: does
this structure survive its quality demands?

## What ATAM is

The Architecture Tradeoff Analysis Method, from the Software Engineering
Institute at Carnegie Mellon. A workshop method: walk concrete quality
scenarios against the architecture and write down what holds and what
does not.

Its nine workshop steps, and what each becomes here:

| ATAM step | here |
| --- | --- |
| 1. Present the method | this card |
| 2. Present business drivers | the value props and stakeholder needs, from M1 and M2 |
| 3. Present the architecture | the element set and the element matrix, from decompose-structure |
| 4. Identify architectural approaches | the register's decisions, from record-adrs |
| 5. Build the utility tree | not built - see below |
| 6. Analyze the approaches | the scenario walk |
| 7. Brainstorm and prioritize scenarios | a new scenario becomes a quality requirement - see below |
| 8. Analyze again | the walk continues on the grown deck |
| 9. Present results | the evidence form; the gate reads it |

THE UTILITY TREE, for the reader who meets the term: ATAM ranks its
scenarios in a tree by business importance and architectural difficulty.
Here every quality requirement already carries `breaks_how_badly` - the
damage grade IS the ranking, so no separate tree is built. The deck deals
worst grade first.

Its four outputs, and where each lands:

- risk - an "at risk" verdict. Minted into the register as a risk naming
  the hinge.
- sensitivity point - the HINGE itself: the element or interface where
  one quality's response is decided. It rides the risk's body. No
  separate register kind (owner ruling 2026-08-10).
- tradeoff - the same entry, where the hinge serves two qualities in
  opposite directions. The verdict line carries the tradeoff in one line.
- non-risk - an "addressed" verdict. The path is the evidence; a
  decision is named only where a recorded choice is why it holds. Not
  every quality needs a decision.

## What ATAM lacks, and this state adds

The corpus splits design review into two halves: quantitative (computed,
automatable) and qualitative (scenario judgment). ATAM is the qualitative
half only. This state runs both:

- The METRICS: the structure numbers off the element matrix, rendered
  beneath the deck as INFORMATION ONLY. The target is zero everywhere; a
  nonzero number is worked in the deck, or back at decompose-structure.
- The FITNESS CANDIDATES: a quality scenario carries a response MEASURE.
  Where that measure could run as an automated check, mark it - it is a
  fitness function candidate for M7.

## Procedure

- Open the walk field. The deck deals the quality scenarios, worst grade
  first.
- Per card, read the scenario and check the computed path: which elements
  and interfaces carry the stimulus, where the response forms, what
  limits the measure.
- Rule the card:
  - addressed — the structure delivers it. Name the decision only where
    one is why.
  - at risk, naming the hinge and the tradeoff. The register risk mints
    on the click.
  - unaddressed. The register issue mints on the click - a standing
    finding for the gate.
- Flag measurable scenarios as fitness candidates — the flag lands on
  the requirement node.
- A scenario discovered DURING the walk is a new quality requirement.
  Write it in the trace - a ripple to M3. The deck grows on the next
  look. No scenario pool exists beside the spec.

## The levels, kept apart

- Qualities constrain the architecture.
- Decisions address them.
- The evaluation evaluates.
- The TEST, later, verifies the quality requirement.

Findings that shake the choice reopen converge-pugh. Findings that shake
requirements ripple to M3.

## Sources

- SEI ATAM (Carnegie Mellon): the nine-step workshop, lightened for one
  adjudicator and an agent.
- The corpus digest: the quantitative-vs-qualitative review split and the
  ATAM steps and outputs - @ai/sya_kb/digest/HARNESS-MAP.md, reviews.
- The six-part scenario shape - @ai/sya_kb/digest/_INDEX.md, quality
  attributes.
- v1's method sheet atam-lite.
