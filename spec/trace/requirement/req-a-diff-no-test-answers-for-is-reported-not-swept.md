---
minted_in: i51-work-running-out-of-sight-reports-itself
id: req-a-diff-no-test-answers-for-is-reported-not-swept
type: "[[requirement]]"
statement: When a change maps to no test that answers for it, the product shall report which parts are unanswered rather than running every test it has.
kind: functional
verify_method: test
measure: "a documents-only change starts zero test files, and the answer names every changed part that no test covers"
breaks_if_removed: "Every documents-only edit fires the whole suite, which answers a question nobody asked and hides the fact that nothing answers the question that was asked."
breaks_how_badly: corrosive
priority: should
weighs_against:
  - req-survey-counts-only-open-records > — both are honesty rows about what an answer states, but a wrong count is read and corrected in a glance while a wrong test scope costs a minute of real time on every occurrence
  - req-clean-sweep-is-dated > — both concern what a check reports about itself; recording a clean date is a traceability nicety, while answering a question nothing covers is a wrong answer wearing a green
  - req-repo-search-carries-intent = — both make a call say why it was worth its cost, one before the fact and one after; neither outranks the other
refines:
  - uc-choose-which-tests-answer-a-question
source_refs:
  - sty-a-documents-edit-does-not-fire-the-whole-battery
  - raid-risk-a-narrower-test-scope-misses-a-break
  - vp-rigor-without-toil
---

## Detail

TWO PLACES FALL BACK TODAY, and both are inside this row.

| branch | what it does today | what it must do |
| --- | --- | --- |
| some changed parts map to no test | runs everything | runs what does map, and names the unmapped parts |
| nothing maps to any test | runs everything | runs nothing from the suite, and says no test answers for this diff |

THE SECOND BRANCH ALREADY KNOWS IT IS WRONG. The code at that point carries a
comment saying the whole suite is the wrong answer to a diff of pure documents.

WHAT DOES NOT CHANGE, and it is what keeps this row safe. The full suite still
runs at verification, fired by that state's own leaving check. This row governs
a question asked mid-walk, never the release evidence.

THE OTHER FALLBACKS ARE UNTOUCHED. A red standing suite, a tree whose changes
cannot be read, a direct request for a full run, and the piecemeal threshold
all keep running everything. Each has a reason that survives this row.

WHY `should` AND NOT `must`. The evidence is a count from one session: ten
suite runs, most fired by edits to markdown alone. That is enough to act on and
not enough to gate a candidate on, and the register grades its risk
`plausible` for the same reason.

REPORTING THE GAP IS THE HALF THAT LASTS. A part with no test that answers for
it is invisible while the fallback keeps passing. Naming it is what makes the
missing test findable.
