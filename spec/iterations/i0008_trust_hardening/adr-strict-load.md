---
id: adr-strict-load
type: adr
addresses: [req-strict-frontmatter, req-ref-integrity]
adjudicated_by: human
statement: Strictness applies at EVERY graph load, with all findings batched (file, key, direction) and nonzero exit — chosen over write-path-only or lint-only strictness, because a status rendered from a misparsed graph IS the silently-shrunk cone. A node file is recognized by a first-line frontmatter fence; iteration.md is its own strict key class; evidence docs are excluded naturally.
depends_on: []
class: review
killer: true
---
## Rationale (not load-bearing)
Pugh vs C1b/C1c on record-fidelity(5): only C1a closes the read path. Brick risk is owned by the recognition rule + the M5 zero-false-rejection spike (kill-criterion), not by weakening the refusal. `quack note` loads no graph and stays available mid-repair.
