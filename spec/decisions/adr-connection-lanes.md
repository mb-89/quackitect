---
id: adr-connection-lanes
type: adr
kind: architecture
adjudicated_by: user
statement: Two lanes per kind - edges.jsonl holds trivial edges one line per edge, con- notes hold prose-bearing ones - an edge lives in exactly one lane, mint and promote are determinizers, and quack connections merges jsonl, notes, and code-derived implements into one deterministic adjacency answer.
class: review
killer: false
---
## Rationale (not load-bearing)
Owner option A, 2026-07-06. Storage aligns with audience: machine edges in the ledger's own JSONL format (no file explosion - the red-team measured 2.6x worst case for one-file-per-edge), human edges as real notes (Obsidian-queryable, statement column, addressable id). The single-index benefit of the central-jsonl rival lives in the merging determinizer instead of the storage. Rejected: status quo (no prose, no symmetric home, two-system smell), one-file-per-edge (bloat kills the status feel), central jsonl with details pointers (the human-facing kinds lose their Obsidian preview or duplicate display frontmatter).
