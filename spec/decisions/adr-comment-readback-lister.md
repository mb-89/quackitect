---
id: adr-comment-readback-lister
type: adr
kind: architecture
adjudicated_by: user
statement: The read-back is quack note --file2list <file> - no new top-level command. It turns a commented copy into a printed LIST of note candidates (anchor, quote, thread, marks, status), read-only and byte-stable, with author names already replaced by the reader role. The agent reads the list and mints the keepers as ordinary notes - one file, many notes, rejection normal. The retro's field-feedback question includes returned commented copies. A bulk importer stays rejected: nothing enters the ledger without judgment.
class: review
killer: false
---
## Rationale (not load-bearing)
Owner rulings 2026-07-07: no additional command (fold under the note family); "copy" naming was unclear - file2list names the transformation; the flag generalizes to other file kinds later. Owner stance: comments are an unreliable source; triage is the agent's judgment step.
