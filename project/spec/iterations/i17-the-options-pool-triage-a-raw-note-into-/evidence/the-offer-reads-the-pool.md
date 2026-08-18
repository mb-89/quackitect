---
form: the-offer-reads-the-pool
by: agent
signed_off: 2026-08-18T10:01:36.233Z
authors: agent
files:
---

# Evidence form / the-offer-reads-the-pool

## current_situation

The mint lands options on trunk and nothing reads them yet. This chunk closes the loop, and it is the one the iteration's own kill criterion is about.

## built

engine/survey.ts lists standing options from the repository instead of parked notes from the machine-local store.

WHAT WAS THERE BEFORE: `backlogNotes(seDir(projectRoot))`, reading `.se/notes.jsonl`, which .gitignore excludes. That single line is the defect the whole iteration exists to remove — measured 2026-08-18, this clone reported 0 parked options while the machine that parked them reported 205, and neither was wrong.

WHAT DOES NOT CHANGE, deliberately: everything downstream of the survey. The pool is mapped into the shape callers already expect — ref, ready_when, title, priority — so no consumer of the survey needed touching. The windowing is inherited rather than reinvented: `counts.backlog` stays the whole count and `backlog_window` says what was shown and what remains, which is already how the notes list windows.

AN UNDRAINED CAPTURE NEVER ENTERS THIS LIST, and the comment in the code says why rather than only that. It has not been judged, and this list is what somebody may commit to. The pending count above it stays the separate signal it always was, and the two must never merge.

THE SEVENTEEN CASES THAT WERE RED AT observe-red ARE GREEN. Two standing cases in tests/retro.test.ts went red and both were right to: they encoded the pre-i17 contract. They now assert the new one.

## follow_up

- verification runs the battery and the inspection checklist, which can finally discriminate now that exactly one writer of the option kind exists

## anything_else

