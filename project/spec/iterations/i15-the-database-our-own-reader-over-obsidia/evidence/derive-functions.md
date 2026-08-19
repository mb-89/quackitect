---
form: derive-functions
reopened: "2026-08-19T17:27:07.758Z — same claims-registration gap, cascading fix through M3"
by: agent
signed_off: 2026-08-16T17:26:27.526Z
authors: agent
files: null
---

# Evidence form / derive-functions

## current_situation

write-requirements closed with 208 standing requirements, seven new this iteration. Three new functions derive from them: one answering the structured query (folds the four query-verb requirements, since determinism is a property of that same function's behavior), one ranking BM25 candidates, one recording each candidate's disposition — split from ranking because rank and record are different verbs.

## functions

- project/spec/trace/function/fn-run-a-governed-walk.answer-a-structured-query.md
- project/spec/trace/function/fn-run-a-governed-walk.rank-candidate-couplings.md
- project/spec/trace/function/fn-run-a-governed-walk.record-a-coupling-disposition.md
- project/spec/trace/function/fn-run-a-governed-walk.answer-with-tests.md
- project/spec/trace/function/fn-run-a-governed-walk.catch-the-system-up.md
- project/spec/trace/function/fn-run-a-governed-walk.close-a-record.md
- project/spec/trace/function/fn-run-a-governed-walk.diverge-before-deciding.md
- project/spec/trace/function/fn-run-a-governed-walk.help-find-a-capability.md
- project/spec/trace/function/fn-run-a-governed-walk.hold-a-stray.md
- project/spec/trace/function/fn-run-a-governed-walk.hold-the-method.md
- project/spec/trace/function/fn-run-a-governed-walk.hold-the-work.md
- project/spec/trace/function/fn-run-a-governed-walk.judge-a-claim.md
- project/spec/trace/function/fn-run-a-governed-walk.keep-the-archive.md
- project/spec/trace/function/fn-run-a-governed-walk.keep-the-record.md
- project/spec/trace/function/fn-run-a-governed-walk.land-the-work.md
- project/spec/trace/function/fn-run-a-governed-walk.md
- project/spec/trace/function/fn-run-a-governed-walk.resolve-a-path.md
- project/spec/trace/function/fn-run-a-governed-walk.route-the-work.md
- project/spec/trace/function/fn-run-a-governed-walk.serve-a-step.md
- project/spec/trace/function/fn-run-a-governed-walk.show-where-it-stands.md
- project/spec/trace/function/fn-run-a-governed-walk.stand-up-a-product.md
- project/spec/trace/function/fn-run-a-governed-walk.teach-the-newcomer.md
- project/spec/trace/function/fn-run-a-governed-walk.work-the-register.md

## flows

- project/spec/trace/flow/flow-query-request.md
- project/spec/trace/flow/flow-query-result.md
- project/spec/trace/flow/flow-change-description.md
- project/spec/trace/flow/flow-candidate-list.md
- project/spec/trace/flow/flow-coupling-disposition.md
- project/spec/trace/flow/flow-refusal.md

## neutrality

None of the three new functions failed the test on the first pass.

answer-a-structured-query: could be built as an index, a linear scan over the markdown files, a database view, or something else entirely — no technology is named, only the outcome.

rank-candidate-couplings: could be BM25, embeddings, or a hand-tuned heuristic — the function names the outcome (rank candidates against a description), not the ranking method.

record-a-coupling-disposition: could be a manual checklist, a gate condition, or an automated tracker.

One thing worth naming rather than hiding: three of the underlying requirements (req-bm25-returns-ranked-candidates, req-bm25-below-threshold-returns-empty, req-bm25-candidates-need-disposition) name "the BM25 sibling" in their own statements. That is not a slip at this state — scope-non-goals already committed to BM25 specifically at M1 ("BUILD THE BM25 RETRIEVAL SIBLING"), before requirements were written. The function layer still stays neutral: rank-candidate-couplings names no ranking algorithm, so if BM25 is ever replaced, only the requirement's own wording needs revisiting, not the function structure.

## follow_up

M4 (partition-functions) is next for this cone: cluster is unset on all three new functions, correctly, since partitioning is M4's own work. The two new flows crossing in (flow-query-request, flow-change-description) and the two crossing out (flow-query-result, flow-coupling-disposition) are already excused the half that faces the world; flow-candidate-list is internal, produced by rank-candidate-couplings and consumed by record-a-coupling-disposition, and flow-refusal is an existing shared flow now also produced by answer-a-structured-query.

## anything_else

nothing
