---
form: sweep-consistency
by: agent
signed_off: 2026-08-13T14:51:56.738Z
authors: agent
files:
---

# Evidence form / sweep-consistency

## current_situation

The sweep was RUN, not claimed. Every vocabulary this iteration changed was searched for across the tree, and the hits judged one at a time.

WHAT THIS ITERATION CHANGED, and therefore what had to be re-taught:

- se_test now demands a question on a scoped run, and records it.
- SE-C-136 is a new refusal clause.
- se_why is a new verb.
- se_trace_puml and se_trace_puml_dump are removed.
- A state's priority is authored as a rung word, and `blocked` sits above the ladder.
- "slider" gives way to "dial" and "rung".

THREE GAPS FOUND, two closed here and one named.

## swept

- [x] command and tool docs
- [x] engine-served strings (grep the engine for the changed vocabulary - the
- [x] method cards
- [x] matrix rows
- [x] templates and skeletons
- [x] guidance chapters
- [x] book chapters
- [x] README and entry documents
- [x] panels and form help

## follow_up

TWO THINGS RIDE FORWARD FROM THIS SWEEP.

THE ENTRY DOCUMENT IS STILL STALE beyond what this delta touched. Its replacement table now lists 12 of 35 lane verbs. se_git, se_file_move, se_file_replace, se_note and the rest are absent, and se_next and se_submit survive in its roadmap section as verbs that were never built. This delta fixed only the row it made wrong.

THE TIER CUT-OVER IS DONE IN THE CORPUS, NOT IN THE ENGINE. Numeric priorities still live in engine/expmachine.ts, engine/iterations.ts, engine/rigor-matrix.ts and the tests, and "slider" survives in about 120 comments and test names. Neither is in the spec's stated sweep. If the cut-over is meant to be total, that is the next pass.

## anything_else

WHAT THE SWEEP ACTUALLY FOUND, per class.

COMMAND AND TOOL DOCS. se_test's description now states the question requirement and that the battery is exempt. se_why carries its own description. GAP FOUND AND CLOSED: the README's replacement table listed 11 verbs and omitted se_test entirely, whose contract just changed. A row was added.

ENGINE-SERVED STRINGS. Swept for the changed vocabulary. se_trace_puml and se_trace_puml_dump return ZERO hits anywhere in the tree - the cut is complete. SE-C-136's refusal text names the legal shape and the battery's exemption. The feed's autonomy line now carries the tier word.

METHOD CARDS. meth-verification-discipline and meth-find-the-fault are unchanged by this delta and still describe what runs.

MATRIX ROWS. Twelve rows were struck at minor this iteration, each with its minor_note rewritten to say what the size cuts and why. That was the change and it is its own documentation.

TEMPLATES AND SKELETONS. GAP FOUND AND CLOSED: guidance/authoring/machines.md showed `priority: 0.25` in its worked example with the numeric range beside it. Every state note in the tree says a word; the page that teaches the next author still said a number, so the corpus would have grown back one state at a time. It now teaches rung words, and a test reads the page.

GUIDANCE CHAPTERS. refusals.md carries SE-C-136 with its rule stated ahead of the refusal. machines/scale.md carries `blocked` as a priority, and why the two sides of the word sit at opposite ends of the range.

BOOK CHAPTERS. Nothing this delta changed is taught in the book.

README AND ENTRY DOCUMENTS. Closed above.

PANELS AND FORM HELP. machines/panels/controls.md declares the autonomy control as rungs from the scale, so it cannot drift from the ladder. Its two mentions of sliders are the rule AGAINST them, which is the same class as the anti-slider law in craft/ux.md.

THE GAP NAMED AND NOT CLOSED. "slider" still stands in roughly 120 places: engine comments, tests, the vscode extension, and eight trace nodes. None is in tsp-autonomy-tiers' stated sweep of machines/ and guidance/, and none is a surface that teaches. Renaming them is a a separate pass over the whole corpus, not this delta's.
