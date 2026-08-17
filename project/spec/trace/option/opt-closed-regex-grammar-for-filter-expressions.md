---
minted_in: i15-the-database-our-own-reader-over-obsidia
id: opt-closed-regex-grammar-for-filter-expressions
type: "[[option]]"
statement: match each filter expression against one closed regex (field == "value"), never a general boolean expression parser, and refuse whatever the regex does not match
cluster: cluster-the-query
question: how does answer-a-structured-query evaluate a query against the corpus
found_by: probe
source: "a throwaway node -e spike run this session (se_run, exit 0, 60ms wall time) — not committed anywhere, per the throwaway law"
---

## Mechanism

The open question: does evaluating v1's harvested filter strings need a
real expression parser, or does a narrow pattern suffice?

The probe built the cheapest runnable version: one regex matching
`field == "value"`, and an `and` combinator that requires every clause to
match. Run against both spec/queries/requirements.base's single-condition
shape and spec/queries/decisions-architecture.base's two-condition shape
(read at ref main earlier this session), both filtered correctly.
Measured: 177.9 microseconds for 4 fake nodes across 2 queries. A
deliberately malformed expression (`type ~= badregex(`) was correctly
rejected rather than silently matching nothing or throwing somewhere
unexpected.

FAKED, so the finding is honest about its limits: 4 handwritten node
objects, not the real ~328-file corpus. The code was not kept; only the
finding is.

CHECKED AFTER THE PROBE, not before: a search of all 25 harvested files at
ref main (spec/queries/*.base) shows `==` is not the only operator in use.
fundamentals.base, methods.base and references.base each carry
`referenced != false` — a second operator (`!=`), and a non-string operand
(a boolean literal, not a quoted string).

What survived: the probed grammar shape (one clause is `field OP literal`,
combined with `and`) is still cheap and still refuses malformed input. What
did NOT survive unchanged: a closed grammar for the full pinned subset
needs at least `==` and `!=`, and literals that are not always quoted
strings — narrower than a general expression parser, but wider than the
probe first assumed.
