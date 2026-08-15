---
form: record-one-name
by: agent
signed_off: 2026-08-15T12:53:06.543Z
authors: agent
files:
---

# Evidence form / record-one-name

## current_situation

THE CHUNK IS HALF BUILT AND THE OTHER HALF IS UNDERSTOOD RATHER THAN GUESSED.

The corpus and the code carry one name. The folders do not, because renaming a record's folder while the engine identifies that record by its WORKTREE wedges the record. It was tried, it wedged, and it was reverted inside the same pass.

The chunk's own statement says the folder IS the id and the fallback can be deleted. That is not true yet, and this form does not pretend it is.

## built

WHAT LANDED, all of it verified rather than asserted.

THE CORPUS CARRIES ONE NAME.

- 658 minted_in values swept to the short id, in one regex with the count pinned. A follow-up search for the long shape returns ZERO.
- 25 further references collapsed across prose, source_refs and paths, in trace nodes, raid entries, requirements and both record files.
- THREE OF THOSE 25 WERE WRONG AND WERE RESTORED. They were quoted measurements — paths the machine actually printed into evidence. Rewriting them would have made the record say the machine printed something it never did. Caught by reading the landings the tool hands back, not by the count. Filed as note-81168863130f.

THE CODE ACCEPTS EITHER SPELLING.

- engine/stateform.ts gains shortRecordId, and recordDirFor now reduces BOTH sides to the short id before comparing. A folder called i12, a folder called i12-some-long-slug, a worktree named either way and a state id carrying just i12 all answer to one record.
- The promotion sweep's owner comparison rides the same reduction, so minted_in matches whichever form it carries.
- 26 of 26 green in requirement-checks.test.ts, including the two fixtures that name their record itx-here and depend on the older prefix rule still working.

ONE FOLDER IS RENAMED. project/spec/iterations/i27 . It did not wedge, because nothing binds a closed record.

WHAT DID NOT LAND, AND EXACTLY WHY.

Renaming project/spec/iterations/i12-performance-hold-the-one-second-rule-on- to .../i12 made every signed state of this record read as MISSING. The pull served onboard-retro unfilled, with its instance still pointing at the old path, and the walk restarted at M0 on a record standing at its implementation gate.

THE CAUSE. A bound record's identity is its WORKTREE directory. The spec folder moved and the worktree did not, so the engine kept resolving evidence under the old name — and kept RECREATING the old folder, appending decisions.jsonl to it on every call. That is how the mismatch made itself visible without reading any code.

THE REVERT. evidence, machines and record.md were moved back and the record came alive again on the next pull, sweeping four states and finding its claims. The 88KB decision history could not be swapped back, because the engine recreates the live file on every call, so it sits beside it as decisions-before-the-rename.jsonl.

## follow_up

- THE ORDER WAS THE MISTAKE, and it is the one thing worth carrying out of this chunk. The data was renamed before the code could follow. An identifier the engine RESOLVES BY must be led by the resolution, never trailed by it.
- WHAT THE FOLDER HALF NEEDS, in order: the record store resolves by short id everywhere — iterations.ts and worktree.ts, since stateform.ts already does; then the worktree directory is renamed WITH the spec folder as one act, because they are one identity; only then do the folders move.
- WHY IT IS NOT DONE HERE. Rewriting how every record is identified, from inside the record being walked, would wedge that record again with no route back mid-flight. That is a bar worth stopping at, and it is the only piece of this chunk that stopped.
- IT IS CARRIED, not dropped: note-f40b2052e59b holds the cause, the order and what already stands so none of it is redone.
- THE TWO DECISION GRAPHS want merging at the retro.

## anything_else

ON SIGNING A CHUNK WHOSE STATEMENT IS ONLY HALF MET.

The alternative was to narrow the statement in the drawing until it matched what landed. That is exactly the move this record failed its own gate for a few hours ago — rewriting a demand to fit the result — so it is not taken here.

The drawing keeps the intent. This form carries the truth. A reader comparing the two learns something real about the change; a reader of a narrowed statement learns nothing.

WHAT THE OWNER ASKED FOR IS STILL RIGHT. Two names for one record is a defect, and the silent fallback in recordDirFor is load-bearing precisely because of it. Nothing here argues against the rename. It argues only that the rename is an engine change with a data migration behind it, rather than a data change with a helper in front of it.
