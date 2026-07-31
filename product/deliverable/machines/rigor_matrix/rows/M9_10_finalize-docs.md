---
kind: matrix-row
name: finalize-docs
statement: "Finalize the docs: the book emits as a projection; docs match the shipped surface."
state_kind: work
filled_by: agent
depends_on:
  - gate-validation
legal_tools:
  - se_file_read
  - se_file_write
  - se_file_patch
  - se_file_search
  - se_file_glob
  - se_file_list
  - se_log_query
  - se_answer
  - se_lint
evidence:
  - name: docs
    description: "the emitted set and the match against the surface"
---

## Guidance

The book is the ship-time report; the live board is the everyday one - there is no separate report artifact. Emit, then read what emitted against the actual surface. Then scrutinize the emitted set as a DOCUMENT: is prose missing or bad, does every stakeholder find what they need, do the Diátaxis modes stay apart ([[meth-doc-quality]]).
