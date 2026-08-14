---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: req-parallel-iterations-own-worktrees
type: "[[requirement]]"
statement: While two or more records stand open, the engine shall let no record's unlanded work alter or overwrite another record's, so zero record is put in the way of any other.
kind: functional
verify_method: demonstration
breaks_if_removed: Two records working at once overwrite each other, so only one may run and two ready streams queue behind each other for no reason.
breaks_how_badly: abrasive
refines:
  - uc-open-an-iteration
source_refs:
  - ".se/req-mine-v2.md: Worktrees and parallel streams"
priority: could
weighs_against:
  - req-desk-states-the-folder-rule > — needless queuing costs throughput every day; the folder rule costs one confused search
---
