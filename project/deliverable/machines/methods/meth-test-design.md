---
kind: method
statement: "Pick the test design method from what the thing under test looks like. The method decides the cases, not taste."
---

## Situation

Guidance for M7 author-tests.

The evidence is Bartlett 2006, counting defects found per test case:

- formal test design, about 0.71
- expert and exploratory, about 0.35
- checklist, about 0.10

Systematic reduction also tames combinatorics. A 22-parameter installation
space of trillions of combinations came down to 62 high-quality cases.

Automating bad test cases is waste.

## Procedure

- Anatomy first. Every case carries:
  - an id
  - a goal, linked to its requirement or risk
  - the test object
  - preconditions
  - test data
  - expected results, with their oracle
  - postconditions
  - priority
  - level
  - automated, yes or no
- Pick the method from the SHAPE of the test basis:
  - Ranges and enumerations: equivalence class partitioning, then boundary value analysis on the partition edges - errors cluster at boundaries.
  - Rules and conditions: decision tables, decision trees.
  - Parameter interactions: all-pairs. Most errors come from one parameter or a pair; a credit-card example needs 27 pairs from 1200 combinations.
  - Stateful behavior: state graph plus state table; coverage by all-states, all-links, or risk - events WITHOUT a state change probe error handling.
  - Processes and journeys: scenario and use-case-based flows; a soap-opera test tells one extreme story end to end.
  - What might break: fault-based methods - FMEA, fault injection, mutation.
- Sweep every case set with Right-BICEP: results Right, Boundaries (CORRECT: conformance, ordering, range, reference, existence, cardinality, time), Inverse relations, Cross-checks, Error conditions forced (network loss, overheating, broken cabling), Performance.
- Depth follows exposure ([[meth-risk-based-testing]]): advanced methods and higher coverage where the risk is; light checks where it is not, with the why recorded.
- Group by test level, along the V.
  - component
  - integration
  - system
  - acceptance
  - A case belongs to the LOWEST level that can catch its defect.

## Sources

- SyA Testing Tactics (Sauer and Hahn 2021), from the owner-mapped digest at
  @ai/sya_kb.
- Beizer, Software Testing Techniques (1983).
- The Bartlett and SQS study (2006).
