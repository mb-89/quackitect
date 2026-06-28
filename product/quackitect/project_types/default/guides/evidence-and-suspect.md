---
id: evidence-and-suspect
scope: always
statement: Pick a verifier class — executed (re-runnable), grounded-review (points at a referent), or judgment (human) — and how suspect/bless works.
---
## Guide (load on demand)
Use **executed** when the claim can be run (tests, compiles, a command exits 0) — the engine
adjudicates and caches. Use **grounded-review** when it can't run but points at an inspectable
referent (file:line). Use **judgment** for taste/fit. On any input change a check goes SUSPECT,
not open; a human blesses it back to DONE, which re-attests it against the new inputs.
