---
kind: method
statement: Pick the test design method from what the thing under test looks like. The method decides the cases, not taste.
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

## THE THREE LAYERS

One card, three altitudes — each answers a different question:

- STRATEGY — what gets tested at all, and how much. Risk decides.
- TACTICS — how the campaign is organized: levels, integration order,
  the environment, testability designed in.
- DESIGN — how each case is derived. The method decides the cases.

## STRATEGY — what, and how much

The strategy answers five drivers, before any case exists:

- WHAT: the goals and the thing under test — scope drawn, never assumed.
- WHY: the product risks it manages. "No risk, no test."
- WHO AND WHEN: the levels and the roles — testing runs parallel to the
  whole lifecycle, never as a phase at the end.
- HOW: the approach and the methods — the design layer below.
- HOW MUCH: entry and exit criteria. Exhaustive testing is impossible,
  so adequacy is DEFINED, never felt.

RISK-BASED TESTING is the strategy's engine: exposure is probability
times consequence, graded off the register's own two scales, and depth
follows exposure ([[meth-risk-based-testing]]). Three sponsor questions
keep it honest: why bother, who cares, how much.

TESTING GIVES INFORMATION, NEVER QUALITY. The result is evidence for a
decision; the improvement is upstream. More and better testing buys more
and better information — that is all it buys, and it is enough.

## DESIGN — deriving the cases

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

## THE SET — what makes a suite good

A suite is designed, never accumulated. Five properties:

- THE SUITE IS THE REGISTER'S MIRROR, both directions. Every requirement
  is verified by at least one [[test-spec]] (`verifies` on the spec), and
  every test file maps back to a spec — an orphan on either side is a
  finding.
- RISK DRIVES DEPTH. "No risk, no test": exposure (probability times
  consequence) decides which rows get advanced methods and high coverage,
  and which get one honest check ([[meth-risk-based-testing]]).
- EVERY CASE SITS AT ITS LOWEST LEVEL. A defect catchable at component
  level is not hunted at system level — the cost of extracting a defect
  grows from 3–6 times early to 50–1000 times late, so the suite pushes
  detection down and early.
- A FIXED BUG LEAVES ITS REPRODUCTION. The regression set grows only
  from real failures, so every member earned its place.
- TESTING IS AN INDICATOR, NEVER THE IMPROVEMENT. Results inform;
  the fix is upstream. A green suite proves the claims it encodes,
  nothing more.

## THE SINGLE TEST — what makes one good

- ONE QUESTION, one reason to fail. A test asserting five things answers
  none when it goes red.
- THE NAME STATES THE CLAIM, arguable like a register title. The name is
  what a reader sees at failure, and it is the address `verified_by`
  links to.
- ARRANGE, ACT, ASSERT — in that order, visibly. The oracle (what
  decides pass) is explicit, never "it did not throw".
- FIRST: fast, isolated, repeatable, self-validating, timely. Isolated
  means a fresh fixture per case — shared state is how a rare failure is
  born.
- DETERMINISTIC. No clock, no randomness, no network — or the test seeds
  and stubs them, and NAMES what it stubbed.
- ASSERT THE WORK RAN. A guard that turns the tool into a no-op is
  invisible to a test that only reads output — the house lesson, in
  project/guidance/craft/software.md.

## TACTICS — how the campaign is organized, in and beyond software

The method generalizes past code, and the corpus carries it:

- VERIFICATION IS A FAMILY, not one act: test, analysis, inspection,
  demonstration — plus reviews, simulation, prototyping and virtual
  integration as evaluation methods. Every requirement gets the CHEAPEST
  method that would catch it failing.
- THE LEVELS RUN ALONG THE V: discipline, component, integration,
  system, acceptance — verification across, validation up.
- INTEGRATION IS THREE DIFFERENT ACTS: integration (constructive —
  merge, smoke, syntactic interoperability), integration TESTING
  (semantic — do the parts collaborate meaningfully, grey-box), system
  testing (black-box against requirements under real conditions). They
  are not retests of each other.
- DESIGN FOR TESTABILITY IS UPSTREAM WORK: observe and control points,
  built-in self-test, logging and tracing, a crash recorder — the
  architect designs them in ([[meth-design-for-testability]]).
- QUALITIES TEST ON SEVERAL LEVELS, from measurable scenarios — the
  six-part scenario is the test-design input, and its response measure
  is the pass line.
- THE PHYSICAL TAIL EXISTS: environmental (stress, EMI and EMC, aging),
  post-development (installation, assembly, conformance against a
  standard as the prerequisite for interoperability). Named here so a
  non-software product finds its family.

## Sources

- SyA Testing Tactics (Sauer and Hahn 2021) and Principles of Systems
  Testing (Sauer and Hahn 2022) — @ai/sya_kb/digest/sya/11_Testing-Tactics.md
  and 10_Testing.md: RBT, the cost curve, the level and integration
  splits, design for testability, Right-BICEP.
- Beizer, Software Testing Techniques (1983).
- The Bartlett and SQS study (2006).
- FIRST and one-assertion discipline — the unit-testing canon (Pragmatic
  Programmers; the 2026-08-10 search is on the record).
