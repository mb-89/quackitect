---
form: run-demos
by: agent
signed_off: 2026-08-19T20:25:18.006Z
authors: agent
files:
---

# Evidence form / run-demos

## current_situation

gate-implementation is blessed. fill-story-evidence had never authored the demos.md drawing for this record (a corpus-wide gap i33 already named: i15 and i27 both carried the placeholder). Authored it now, scoped to the two must stories i15 itself unblocked this iteration: sty-answer-what-does-this-touch and sty-dispose-a-candidate-coupling. Both were blocked on a missing verb until this iteration wired se_query and se_couplings.

## follow_up

Neither demonstration ran clean on the first try, and both findings are on file rather than smoothed over. Demo1 found a real bug: parseBase in tables.ts silently dropped every harvested .base file own top-level filters, so every real query matched the whole vault. Fixed in this pass with two new regression tests; battery green 1501/1501. Demo2 found that BM25 alone cannot tell unrelated from related the way a human means it, when the description is built from ordinary English words the corpus itself uses constantly - a measured data point for the embeddings-later decision record.md already defers. Demo2 also could not clear its own pass line at full scale: 706 real candidates came back for one real change, and only the top 15 were individually disposed in this run, not all 706. That gap is named in the report and the story deck rather than hidden, and belongs to whoever next disposes a real change at this scale. A harvest-content finding (a harvested view asks for a name column some matching notes do not carry) is parked as note-b20975667464 for a future sweep of the 26 harvested files. Next: sweep-consistency, then gate-validation.

## anything_else

Two reports on file: reports/rpt-answer-what-does-this-touch.md and reports/rpt-dispose-a-candidate-coupling.md, each with its demo script alongside it. Both story decks (sty-answer-what-does-this-touch.md, sty-dispose-a-candidate-coupling.md) carry new dated evidence paragraphs citing the reports.
