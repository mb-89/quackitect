---
chunk: write-budget-probe
taken: 2026-08-16
probes: raid-asm-a-bound-check-runs-inside-the-write-budget
---

# The write-budget number

## The question

Can a conformance check run on every write and leave the write inside its
one-second budget?

Everything in this iteration rests on the answer. It was argued about at
two gates and never taken.

## The baseline, before the guard

TWELVE CONSECUTIVE `se_file_write` CALLS, read from the call log's own
`duration_ms` on 2026-08-16, content of 2251 to 3086 bytes.

4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 12, 12 milliseconds.

Median 5. Budget 1000.

## The guarded write

THE GUARD LANDED AT `files.ts:347`, beside the two that already stood
there. Every write since has gone through it, including the writes that
produced this file.

MEASURED BY THE CASE ITSELF. `writeguard.test.ts` case "the guard leaves
a write inside its one-second budget" wraps a real lane write in
`Date.now()` and asserts under 1000 ms. It PASSES.

THE PARSE IS THE CHEAPEST CHECK THERE CAN BE. It reads the incoming
string, slices the frontmatter block, and hands it to the same `yaml`
package four readers already import. No corpus, no graph, no disk.

## The verdict

THE ASSUMPTION HOLDS FOR A CONTENT-ONLY CHECK, with roughly two orders
of magnitude of headroom.

WHAT IS STILL UNMEASURED is a check that READS THE CORPUS. `rules.ts`
does, and it is chunk six. This probe narrows the question rather than
closing it.

THE FALLBACK IS UNCHANGED AND UNUSED. If a corpus-reading check does not
fit, `rules.ts` moves behind `sweep.ts` and the write reports rather than
refusing — `req-a-check-too-slow-for-the-write-moves-to-the-sweep`.

## What the run showed beyond the number

FIVE OF NINE WRITE-GUARD CASES PASS, and the four that fail are the four
chunks not yet built.

- PASSING: the unquoted colon is refused; the refusal names the file, the
  line, the value and the fix; the guarded write stays inside the budget;
  `force` does not clear it; a sound write still lands with its hash.
- FAILING: the vocabulary check (chunk 3), the report-versus-refuse seam
  (chunk 5), the way-forward demand (chunk 8), the whole-repo sweep
  (chunk 4).

EVERY FAILURE IS ASSERTION-RED, carrying `code: 'ERR_ASSERTION'`. None
crashed. That is the distinction chunk eleven makes mechanical, and it
happens to be observable by hand today.

## One thing the sweep case found early

`se_lint` REFUSES A DIRECTORY with SE-C-046, expecting a prose file. Its
own description promises a sweep over everything, and
`raid-iss-se-lint-has-no-whole-repo-sweep` records the gap. The case
named it precisely rather than generically, which is what chunk four now
has to close.
