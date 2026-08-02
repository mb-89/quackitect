---
kind: method
statement: "Systematic test design: pick the design method from the test basis - formal design finds roughly twice the defects per test case of expert intuition, at a fraction of the case count."
---

## Situation
Guidance for M7 author-tests. The evidence (Bartlett 2006): formal test design ~0.71 defects per test case, expert/exploratory ~0.35, checklist ~0.10. And systematic reduction tames combinatorics: a 22-parameter installation space of trillions of combinations reduced to 62 high-quality cases - automation of bad test cases is waste.

## Procedure
- Anatomy first: every case carries id, goal (linked to its requirement or risk), test object, preconditions, test data, expected results with their oracle, postconditions - plus priority, level, and automated y/n.
- Pick the method from the SHAPE of the test basis:
  - Ranges and enumerations: equivalence class partitioning, then boundary value analysis on the partition edges - errors cluster at boundaries.
  - Rules and conditions: decision tables, decision trees.
  - Parameter interactions: all-pairs. Most errors come from one parameter or a pair; a credit-card example needs 27 pairs from 1200 combinations.
  - Stateful behavior: state graph plus state table; coverage by all-states, all-links, or risk - events WITHOUT a state change probe error handling.
  - Processes and journeys: scenario and use-case-based flows; a soap-opera test tells one extreme story end to end.
  - What might break: fault-based methods - FMEA, fault injection, mutation.
- Sweep every case set with Right-BICEP: results Right, Boundaries (CORRECT: conformance, ordering, range, reference, existence, cardinality, time), Inverse relations, Cross-checks, Error conditions forced (network loss, overheating, broken cabling), Performance.
- Depth follows exposure ([[meth-risk-based-testing]]): advanced methods and higher coverage where the risk is; light checks where it is not, with the why recorded.
- Group by test level (the V): component, integration, system, acceptance - a case belongs to the LOWEST level that can catch its defect.

## Sources
SyA Testing Tactics (Sauer/Hahn 2021, owner-mapped digest @ai/sya_kb); Beizer, Software Testing Techniques (1983); Bartlett/SQS study (2006).
