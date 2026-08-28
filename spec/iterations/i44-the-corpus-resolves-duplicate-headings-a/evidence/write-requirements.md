---
form: write-requirements
by: agent
signed_off: 2026-08-28T10:45:05.222Z
authors: agent
files:
---

# Evidence form / write-requirements

## current_situation

No new story and no new use case were minted, so these rows derive from the steps of two standing use cases.

uc-keep-the-corpus-sound-at-the-write owns the reference check. uc-let-the-system-catch-up owns the three sweep extensions. uc-see-the-whole-pool-from-any-clone owns the token coverage report.

Five rows are minted, one per lint. The repairs themselves mint nothing: a one-off edit is work, not a standing demand.

## register

- req-a-reference-key-resolves-or-is-marked
- req-a-heading-appears-once-in-a-node
- req-a-code-citation-names-something-that-exists
- req-the-dead-vocabulary-sweep-reaches-the-trace
- req-a-work-token-nothing-references-is-reported

## set_criteria

- complete: Every lint in the scope has a covering row, and the repairs have none on purpose. A repair is an act, not a demand, and a row saying "the corpus shall have no duplicate headings today" would be unverifiable tomorrow. What has no row: nothing in scope.
- consistent: No two rows conflict. The four sweep rows share one shape, report and do not refuse, and the reference row is the only must. "Reference key" means the same thing in every row: a frontmatter key the corpus guard names.
- affordable: Five sweeps over about 2,549 nodes. The existing conformance sweep reads that corpus in under 1.2 seconds, measured in this session's boot, so the added passes stay inside boot's own budget.
- bounded: Every row answers to a use-case step and to an item in the overhaul plan's seed 6. Nothing here is wider than the seed. The prose-reference class is deliberately outside, and it stands as a register issue.
- comprehensible: Each row names what is checked and what counts as passing, in a table. A reader from outside the project can say what the system must do without opening the engine.
- no_tbd: Ran the sweep for TBD, TBC, TBR and three question marks over spec/trace/requirement. Zero matches, over the whole register rather than only the new rows.
- behaviour_modelled: None here wanted one. Each row is one condition and one response, which is exactly the shape the method says a model would only restate. No participant appears from nowhere and no ordering is at stake.
- quality_groups_swept: See the nine answers below, one line each.

## follow_up

Sweep the requirements for what they lean on, and record each assumption in the register.

The reference row is the only must, so it is the one that gates the candidates at M4.

## anything_else

THE NINE CHARACTERISTICS, one answer each, per the sweep this state owes.

- Functional suitability: touched. The five rows are functional, and the reference row is the must the others support.
- Performance efficiency: touched lightly. The sweeps run inside boot's exit check, so their cost is bounded by the existing 1.2-second corpus read.
- Compatibility: not touched. Nothing here changes an interface between this system and another.
- Interaction capability: not touched. No surface a person operates changes.
- Reliability: touched. A dangling reference already stops boot when it breaks parsing; these rows make the wider class visible before it reaches that point.
- Security: not touched.
- Maintainability: touched, and it is the point. Mechanical checks are what keep the corpus repaired without another overhaul.
- Flexibility: not touched. Nothing here changes what the system can be adapted to.
- Safety: not touched.

THE SWEEP IS NINE ANSWERS AND NOT NINE SCENARIOS, which is what the state asks for. Six of the nine are untouched, and that is a recorded answer rather than a gap.
