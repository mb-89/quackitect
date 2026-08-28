---
form: sty-answer-what-does-this-touch
by: agent
signed_off: 2026-08-19T20:25:50.864Z
authors: agent
files: null
---

# Evidence form / sty-answer-what-does-this-touch

## current_situation

se_query was wired this iteration but never demonstrated end to end against a real harvested .base file. gate-implementation blessed the build on unit tests alone.

## built

The demonstration ran against the real engine (deliverable/engine/query.ts answerStructuredQuery), via reports/demo-answer-what-does-this-touch.ts, from a real question over spec/queries/decisions-architecture.base. It surfaced a real bug on first run - parseBase silently dropped every harvested .base file own top-level filters, so the query matched the whole vault (1907 rows) instead of the filtered set. Fixed in deliverable/engine/tables.ts (parseBase), with two new regression tests in tests/query.test.ts. Re-run after the fix returned the correctly filtered single row. The unknown-field refusal (SE-C-144) was demonstrated clean on the first run. Full account: reports/rpt-answer-what-does-this-touch.md.

## follow_up

The fourth procedure step (follow one returned id to its file) did not complete: the one matched row carries name: undefined, because that note uses id as its identifier key and the view asks for name. Not a code defect - captured as note-b20975667464 for a future sweep of the 26 harvested .base files against the frontmatter conventions their matching notes actually use.

## anything_else


