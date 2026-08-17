---
form: generalize-use-cases
by: agent
signed_off: 2026-08-16T16:49:12.005Z
authors: agent
files:
---

# Evidence form / generalize-use-cases

## current_situation

write-stories is signed with three new stories: the agent's structured-query pass and the engineer's repeatable-answer pass (both refining vp-the-ledger), and the agent's forced-disposition pass over BM25 candidates (refining vp-rigor-without-toil). This state generalizes each into a Cockburn-shape use case, one actor and one goal apiece.

## use_cases

- project/spec/trace/use-case/uc-query-the-corpus-by-structure.md
- project/spec/trace/use-case/uc-get-a-trustworthy-answer.md
- project/spec/trace/use-case/uc-dispose-of-a-candidate-coupling.md
- project/spec/trace/use-case/uc-adjudicate-a-gate.md
- project/spec/trace/use-case/uc-answer-a-question-with-tests.md
- project/spec/trace/use-case/uc-be-handed-the-method.md
- project/spec/trace/use-case/uc-begin-a-product.md
- project/spec/trace/use-case/uc-browse-the-archive.md
- project/spec/trace/use-case/uc-capture-a-stray.md
- project/spec/trace/use-case/uc-change-the-method-mid-walk.md
- project/spec/trace/use-case/uc-close-a-record.md
- project/spec/trace/use-case/uc-diverge-before-deciding.md
- project/spec/trace/use-case/uc-drain-the-inbox.md
- project/spec/trace/use-case/uc-find-the-right-lane-tool.md
- project/spec/trace/use-case/uc-get-work-routed.md
- project/spec/trace/use-case/uc-install-quackitect.md
- project/spec/trace/use-case/uc-land-work-on-trunk.md
- project/spec/trace/use-case/uc-learn-the-machinery.md
- project/spec/trace/use-case/uc-let-the-system-catch-up.md
- project/spec/trace/use-case/uc-open-an-iteration.md
- project/spec/trace/use-case/uc-quality-compatibility.md
- project/spec/trace/use-case/uc-quality-flexibility.md
- project/spec/trace/use-case/uc-quality-functional-suitability.md
- project/spec/trace/use-case/uc-quality-interaction-capability.md
- project/spec/trace/use-case/uc-quality-maintainability.md
- project/spec/trace/use-case/uc-quality-performance-efficiency.md
- project/spec/trace/use-case/uc-quality-reliability.md
- project/spec/trace/use-case/uc-quality-safety.md
- project/spec/trace/use-case/uc-quality-security.md
- project/spec/trace/use-case/uc-research-and-record-an-answer.md
- project/spec/trace/use-case/uc-resume-after-an-absence.md
- project/spec/trace/use-case/uc-set-the-autonomy.md
- project/spec/trace/use-case/uc-shape-the-view.md
- project/spec/trace/use-case/uc-start-an-unattended-machine.md
- project/spec/trace/use-case/uc-take-a-step.md
- project/spec/trace/use-case/uc-trace-a-decision-to-its-origin.md
- project/spec/trace/use-case/uc-vendor-and-overlay.md
- project/spec/trace/use-case/uc-view-notes-as-a-table.md
- project/spec/trace/use-case/uc-watch-the-walk-live.md

## follow_up

Coverage holds both ways across the full standing set: every use case refines at least one story, and every story is refined by at least one use case, including the three pairs minted this state. derive-requirements is next; it should derive the unknown-field refusal and the empty-result case from uc-query-the-corpus-by-structure's extensions, the repeatable-query guarantee from uc-get-a-trustworthy-answer, and the forced-disposition rule from uc-dispose-of-a-candidate-coupling's main scenario step 4.

## anything_else

nothing
