---
form: sweep-consistency
by: agent
signed_off: 2026-08-16T10:19:26.122Z
authors: agent
files:
---

# Evidence form / sweep-consistency

## current_situation

i34 changed four things a document could still be teaching wrongly.

- Worktrees and record branches are gone; every record is a folder on trunk.
- The resolution seam that picked between trees is deleted.
- The claim ledger is retired, and `se_git_land` and `se_git_sync` with it.
- Both containers now offer an exit door and enter nothing uninvited.

THE SWEEP WAS RUN MECHANICALLY, not from memory. One search over the deleted vocabulary — worktree, se_git_land, se_git_sync, claims.jsonl, itAdopt, claim ledger — across every surface class in turn.

SIX DOCUMENTS TAUGHT THE SUPERSEDED WAY. All six are fixed. Four were engine-served strings, which is the worst class: they are handed to an agent at the state, so a wrong one teaches every walk that passes.

## swept

- [x] command and tool docs
- [x] engine-served strings
- [x] method cards
- [x] matrix rows
- [x] templates and skeletons
- [x] guidance chapters
- [x] book chapters
- [x] README and entry documents
- [x] panels and form help

## follow_up

WHAT THE SWEEP ACTUALLY CHANGED, per class, so the boxes above can be checked rather than believed.

ENGINE-SERVED STRINGS — four, and the reason this class matters most is that the engine hands these to an agent at the state. A wrong one teaches every walk that passes through.

- `machines/states/work.md` served `guidance: ... it works in the bound worktree`. Corrected to the one tree.
- The same file's body said "Everything the lane does lands in the worktree, never on the main branch". That was the exact opposite of what now happens, and it was being taught at every expedition work state.
- `machines/states/leave.md` said leaving a record open "keeps the worktree for continue_expedition to find again".
- `machines/methods/meth-emit-back.md` said a write "cannot land in the record's worktree and fan out", present tense, about a tree that no longer exists.

README AND ENTRY DOCUMENTS — one, and it was the furthest out of date. `project/product.md` taught i34's whole result as an INTENT: "The intent is that its records get NO worktree and walk on trunk", followed by a plan to build a git adapter and level each record. It now states what runs, and records that the destination changed — the seam was deleted rather than the records levelled.

GUIDANCE CHAPTERS — clean, checked not assumed. Both hits were already historical framing: refusals.md says a method write "used to land" in a worktree, and engineering.md says "ONE TREE ENDS THAT WHOLE CLASS".

METHOD CARDS AND MATRIX ROWS — clean beyond the one fix above. The surviving mentions cite WHEN a ruling was made — "after the claim ledger shipped with seven correct rows" — which is provenance, not teaching. Deleting those would erase why a rule exists.

COMMAND AND TOOL DOCS, TEMPLATES, PANELS AND FORM HELP — zero hits across the cage, the views and the VS Code surface.

BOOK CHAPTERS — there is no book folder in this repository. The class is checked and empty rather than skipped.

ONE FALSE CORRECTION WAS CAUGHT BEFORE IT LANDED, and it is the reason this sweep is worth trusting. product.md names `levelRecordTree` in `engine/supervisor.ts`. i34 deleted `levelTree` from session.ts, and the two are easy to confuse. Searching first showed `levelRecordTree` alive and still used by the satellite, so the sentence stands and the correction went to what was actually stale. An assertion about the system is checkable, so it was checked.

CODE COMMENTS ARE NOT THIS STATE'S CLASS and were handled at trace-design. Three cited deleted requirements and now state the harm instead.

## anything_else

THE GRAIN OF THIS SWEEP IS THE VOCABULARY, NOT THE READING. Searching the deleted terms finds every document that NAMES the old thing. It cannot find a document that describes the old behaviour in different words.

SAYING SO IS THE HONEST FORM OF THE CLAIM. The boxes above mean "no document names the superseded mechanism", which is checkable and was checked. They do not mean "no document is wrong", which nothing mechanical can establish.

WHAT WOULD CLOSE THAT GAP is a cold read by someone who did not do the work — the same control that caught four rounds of defects in this iteration, applied to the documents rather than the code.
