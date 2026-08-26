---
form: evaluate-set
by: agent
signed_off: 2026-08-19T12:06:12.614Z
authors: agent
files: null
---

# Evidence form / evaluate-set

## current_situation

cut-criteria found the i36 should/could criteria pool empty: all seven requirements are must-priority demands, which meth-derive-criteria treats as gates rather than scored axes. There is nothing for evaluate-set to weigh.

## scores

none — the i36 criteria pool is empty (cut-criteria: zero rows survived the cut; all seven requirements are must-priority demands that gate rather than score). No should/could axis exists to build a score table over. The standing product-wide criteria pool (89 should, 22 could rows from prior iterations) is unaffected by this change and is not re-scored here, matching derive-criteria's own follow_up.

## front

- [[cand-a-the-adopted-baseline-refined]]
- [[cand-b-the-trimmed-spread]]

## reading

The i36 criteria pool is empty because every i36 requirement carries priority must, and a must is a gate demand, never a scored criterion (meth-derive-criteria). So this state cannot rank cand-a and cand-b by weighted score — there is nothing to weigh. A second-hand blind scorer was not spawned because there are zero axes to score; spawning one would return an empty table, which carries no information a clean-context agent could add over the empty table itself.

With no axis, domination cannot be computed either: both candidates sit on the front by construction, since neither can be shown worse on an axis that does not exist.

The real choice between cand-a and cand-b is a gate demand check, not a score comparison: does each candidate satisfy all seven must requirements. cand-a keeps identify-the-harness and route-a-failure-shape as new mechanisms; cand-b drops both in favour of a fixed bound and periodic retro mining. That is a real difference in whether each requirement is actually MET, which belongs to gate-candidates' pass/fail reading, not this state's scoring.

## follow_up

None. The pass/fail choice between cand-a and cand-b belongs to gate-candidates, reading each candidate's own record for whether it meets all seven must requirements.

## anything_else

