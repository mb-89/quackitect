---
id: se.adr-comment-readback-lister
kind: decision
statement: The read-back is quack note --file2list <file>, with no new top-level command. It turns a commented copy into a printed LIST of note candidates (anchor, quote, thread, marks, status). This list is read-only and byte-stable, with author names already replaced by the reader role. The agent reads the list and mints the keepers as ordinary notes. One file can yield many notes, and rejection is normal. The retro's field-feedback question includes returned commented copies. A bulk importer stays rejected, since nothing enters the ledger without judgment.
provenance:
  migrated_by: se.set.migrate v1-import
  iteration: bootstrap-b3
  ai_involvement: engine-migrated
  adjudicated_by: user
v1_decided_in: i0013_comments
v1_type: adr
v1_kind: architecture
v1_adjudicated_by: user
v1_class: review
v1_killer: "false"
v2_amendment: command name changes with the v2 surface
---

## Rationale (not load-bearing)
Owner rulings 2026-07-07: no additional command (fold under the note family); "copy" naming was unclear - file2list names the transformation; the flag generalizes to other file kinds later. Owner stance: comments are an unreliable source; triage is the agent's judgment step.

## v2 amendment (applied at mint)

command name changes with the v2 surface
