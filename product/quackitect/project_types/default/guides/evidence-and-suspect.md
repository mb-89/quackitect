---
id: evidence-and-suspect
scope: always
statement: Pick a verifier class. Executed, grounded-review, or judgment. Plus how suspect and bless work.
---
## Guide (load on demand)
Pick the verifier class by how the claim is checked.

- **Executed** — the claim can be run. A test, a compile, a command that exits 0. The engine adjudicates and caches.
- **Grounded-review** — the claim cannot run. It points at an inspectable referent (file:line). A human reads it.
- **Judgment** — the claim is about taste or fit. A human decides.

On any input change a check goes SUSPECT, not open. A human blesses it back to DONE. The bless re-attests it against the new inputs.

**Compound checks are all-or-nothing.** A check may bundle several requirements. It passes only when every part is met. Never bless a compound because most parts hold. One unmet clause fails the whole check.
