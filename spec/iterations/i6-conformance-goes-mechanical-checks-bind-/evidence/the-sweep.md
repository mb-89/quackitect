---
form: the-sweep
by: agent
signed_off: 2026-08-16T17:02:33.942Z
authors: agent
files: null
---

# Evidence form / the-sweep

## current_situation

THE SWEEP IS BUILT AND BOTH ITS CASES ARE GREEN. `se_test` over `tests/writeguard.test.ts`: 10 total, 8 pass, 2 fail.

THE CHUNK'S OWN STATEMENT WAS WRONG, and so was the case that drove it. `se_lint` already sweeps by glob and has since before this iteration. The gap was never the PROSE sweep; it was the CONFORMANCE sweep, which is a different question about the same files.

THE NOTE THAT SEEDED BOTH IS STALE. raid-iss-se-lint-has-no-whole-repo-sweep quotes note-d7a26094f592 from 2026-07-28, and `glob` was added since.

## built

### The code

- `project/deliverable/engine/sweep.ts` — NEW. `sweepCorpus(root, rel)` walks every markdown file under a root-relative directory, parses each node's frontmatter, and returns `{scanned, findings}`.
- `project/deliverable/tests/writeguard.test.ts` — the case that drove `se_lint` now drives `sweepCorpus`, and a second case was added for the report itself.

### What it finds, and what each finding says

TWO KINDS TODAY, and both name the DIFFERENCE rather than a category.

- `unparseable` — a node whose frontmatter does not load, with the parser's own first line. The write guard stops these now, so one found here is either older than the guard or came in outside the lane, which raid-asm-a-break-made-outside-the-lane-is-caught-by-the-sweep says is an expected writer.
- `outside-vocabulary` — a value outside its key's list, quoted, with the whole allowed list beside it.

IT SHARES ITS SOURCES WITH THE GUARD. The same `yaml` parse, the same `outsideVocabulary` reading the same item templates. A sweep that disagreed with the guard about what is sound would be worse than no sweep.

### Why it reports and never refuses

ITS SUBJECT IS THE CORPUS AS IT STANDS, so every break it finds predates whatever write is in flight. Refusing would make an unrelated edit carry somebody else's debt, and the rational answer to that is to route around the check.

THAT IS raid-dec-a-check-refuses-a-wrong-write-and-reports-a-wrong-corpus, applied.

### The run

10 total, 8 pass, 2 fail. Both new cases green.

- the sweep answers with findings and says how many nodes it read
- the sweep names a standing break once, says which check found it, and quotes the value

THE TWO REMAINING REDS belong to chunk five (report-versus-refuse on the write's own result) and chunk eight (the way-forward demand).

## follow_up

CHUNK FIVE IS NEXT — `report-versus-refuse`. It depends on this chunk and on chunk three, and both now stand.

ITS CASE IS ONE OF THE TWO REDS: a break the corpus already carried must LAND and be REPORTED on the write's own result. The sweep proves the finding can be computed; chunk five makes it ride the write.

ONE CORRECTION IS OWED TO THE REGISTER. raid-iss-se-lint-has-no-whole-repo-sweep is stale on its central claim and should be re-stated as the conformance gap rather than the prose one. It goes to sweep-consistency, which owns exactly this.

NOTHING IS BLOCKED.

## anything_else

### The chunk statement and the case were both aimed at the wrong verb

THE CHUNK SAYS "se_lint takes a whole tree". It already does — `glob: project/guidance/**/*.md` sweeps every matching markdown file and returns only those with findings.

THE CASE ASSERTED `se_lint({path: <directory>})` and got SE-C-046, correctly: se_lint's `path` takes a file and its `glob` takes a pattern. Neither is a defect.

BOTH INHERITED A STALE NOTE. note-d7a26094f592 recorded on 2026-07-28 that se_lint takes one file per call. That was true then. `glob` landed afterwards, and raid-iss-se-lint-has-no-whole-repo-sweep repeated the claim on 2026-08-16 without re-checking it.

I WROTE THAT REGISTER ENTRY AT gate-motivation, from the note's text rather than from the tool. That is the second-hand citation the voice rules name, and the build is where it got caught.

### What the correction cost, and what it bought

COST: one wrong chunk statement, one wrong case, and a register entry that now needs re-stating.

BOUGHT: the conformance sweep, which is what the iteration actually needed and which no chunk had named. Chunk five and the corpus-wide checks both depend on it.

THE ENTRY IS NOT DELETED. Its subject is real — there was no whole-repo conformance pass — and only its evidence was wrong. Re-stating it at sweep-consistency keeps the finding and fixes the citation.

### One thing the run showed about the guard's cost

THE SWEEP CASES RUN AGAINST A FRESH ROOT with almost no corpus, so they say nothing about the sweep's cost on the real one. That number is owed where it matters — at the state that fires the sweep, not here.
