---
minted_in: i6-conformance-goes-mechanical-checks-bind-
id: raid-iss-se-lint-has-no-whole-repo-sweep
type: "[[raid]]"
kind: issue
statement: se_lint takes one file or one block of text per call, so no check can ask a question about the corpus as a whole — and its own description already promises the sweep.
owner: the driving agent
trigger: the first check whose subject is the corpus rather than one file
status: open
impact: Half this iteration's named checks are corpus-wide by nature. The register against its folder, the capability coverage, the stories against their proving runs — none of them fits in a per-file call, so without a sweep they have no runner and become prose again.
breaks_how_badly: crippling
how_likely: certain
source_refs:
  - note-d7a26094f592
  - raid-dec-a-check-refuses-a-wrong-write-and-reports-a-wrong-corpus
  - i6 scope-non-goals — third, the four checks the pool already named
---

## What the note said, and when

`note-d7a26094f592` recorded it on 2026-07-28, as a RELATED GAP beside
the fitness-function design, in the same breath.

> se_lint takes ONE file or ONE block of text per call. No whole-repo
> sweep exists. The tool's own description already promises that
> "pruning sweeps it over everything later" — the intent is recorded and
> unbuilt. Whole-system MEASURING should not wait for the pruning
> machine; it is cheap and carries no risk.

THE RETRO DRAINED THAT NOTE INTO THIS ITERATION on 2026-08-13, naming
this gap explicitly as part of what i6 carries.

## Why the kickoff missed it

THE SCOPE WAS BUILT FROM THE RECORD'S VISION, which quotes the note's
fitness-function half and not its related-gap half. Fourteen items were
listed and this was not among them.

IT WAS FOUND HERE, at gate-motivation, by reading the note in full
rather than the record's summary of it.

THAT IS ITS OWN SMALL LESSON: a scope derived from a summary of a note
inherits whatever the summary dropped.

## Why it is not scope creep

THE RETRO ALREADY PUT IT HERE. The drain says so in as many words. This
entry corrects a list, it does not widen a decision.

AND HALF THE NAMED CHECKS NEED IT. Three of the four checks the pool
handed this iteration ask a question about the corpus as a whole.

- The register against its node folder — two sets compared, both
  corpus-wide.
- The capability coverage — the verbs the engine registers against the
  verbs named in use cases.
- Stories against their proving runs — 24 stories, zero links.

WITHOUT A SWEEP THEY HAVE NO RUNNER. They would go back to being prose
asking somebody to look, which is the exact failure this iteration
exists to end.

## How it fits the refuse-versus-report seam

CLEANLY, AND IT IS WHY THE SEAM MATTERS. Every corpus-wide check REPORTS
by `raid-dec-a-check-refuses-a-wrong-write-and-reports-a-wrong-corpus`,
because its subject predates any one write.

So the sweep is a reporting runner, not a refusing one. It does not
belong in the write path at all, and that keeps it clear of
`raid-asm-a-bound-check-runs-inside-the-write-budget` entirely.

TWO MECHANISMS, ONE SEAM. The write refuses what this write broke. The
sweep reports what the corpus has been carrying.
