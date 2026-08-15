---
minted_in: i1
id: req-roles-never-usernames
type: "[[requirement]]"
statement: The engine shall record every acting party as a role from the fixed vocabulary, with zero usernames or hostnames in stored records.
kind: constraint
verify_method: inspection
breaks_if_removed: Personal data lands in durable records, breaking the privacy law over the whole corpus.
breaks_how_badly: fatal
refines:
  - uc-trace-a-decision-to-its-origin
  - uc-browse-the-archive
source_refs:
  - ".se/req-mine-v2.md: gates, offers and grants"
  - ".se/req-mine-v1.md: the ledger and truth"
  - "guidance/voice.md: people & privacy"
  - uc-browse-the-archive step 5
priority: must
---

## Detail

## Detail

- The recorded form is a role from the stamp vocabulary (owner, agent).
- The sweep covers every stored record class: grants, stamps, log entries, evidence files.
- Prose surfaces name the role too, never a person.

This binds any stored record or render.
