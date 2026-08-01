---
form: expedition-leave
status: done
---

# e28 — the day's bucket for 2026-08-01

## What was the goal

Five known machinery defects, every one already ruled, bundled so the owner
could leave the walk running. The goal was amended once at 12:50 when the
bundle outgrew it, and it outgrew that amendment too: the last third of the
day was a table renderer over the notes, so that Obsidian can be dropped.

Stated plainly: make the machinery safe to work with, then make the project's
own data visible and editable without a second application.

## What was done

THE FIVE RULED DEFECTS. `se_file_move` now understands SOURCE, not only prose,
and reports every reference it could not rewrite. Preflight parses the WEBVIEW
scripts inside `extension.js` rather than only the file around them. The
palette remainder became configuration by parsing `palette.css` at runtime.
The voice-lint prose sweep took 37 findings down to 4. The render pull was
DECLINED rather than done — see below.

THE CONTROL BAR, redrawn from the owner's sketch, with no sliders anywhere:
autonomy became five cumulative rungs, the shutdown control was struck, and
the cadence became two typed integers. That redraw earned the PARAMETER PANEL
SYSTEM — a panel is a spec and a deterministic renderer draws only the types
it knows, refusing any it does not. The ux rule about staying close to a
sketch is now enforced by the renderer instead of by attention.

SE_SHOOT, so the agent can look at what it built. It caught a bug in itself
within a minute of existing, and it is what caught the matrix defect below.

THE TABLE, which became the largest single piece. `engine/tables.ts` reads the
owner's own `.base` format, so no new grammar was invented; a vault reader
turns all 169 notes into rows in 67ms. A filter clause or view type it does
not know REFUSES BY NAME rather than dropping rows quietly, because a table
missing rows for an invisible reason is the worst failure it can have. The
PIVOT is ours and goes past Obsidian: a list-valued dimension spreads across
its elements, which is what makes `name` crossed with `depends_on` BE the
dependency matrix, with no second data model and no export. It is mirror card
7, reachable at `ctrl+alt+7`, and needed no extension change because the card
list is read live from `/api/cards`.

THE WRITE PATH, on two owner rulings taken this session. Frontmatter
write-back FORMATS rather than splices — take the format you have, require it
to be valid, print a properly formatted result, exactly as ctrl-s does in a
programming language. And an editor copies on ENTER, discarding on Escape,
which is the Qt delegate contract. Cells are editable where the row maps to a
note and the value is expressible; `file.*` and nested values are drawn locked
WITH THE REASON, because a cell that ignores a double-click reads as broken.

## What settled it

THE RENDER PULL WAS MEASURED BEFORE IT WAS BUILT, and the premise did not
survive: a render is 96ms, not the 892ms the ruling rested on, and the
guidance pull is 3% of it. The work was declined with the number rather than
executed. That is recorded rather than quietly dropped.

THE FORMATTER RULING RETIRED A MEASURED BLOCKER. Research had established that
150 of 1,219 real key edits refuse under a line splice, covering 100% of
`depends_on` and 100% of `evidence` — precisely the fields a matrix editor
exists to change. A canonical rewrite has no such class. Its cost was then
measured rather than assumed: all 147 frontmatter blocks in the vault carry
ZERO YAML comments, so a plain re-serialize is lossless here, and 57 of 147
notes would reformat when edited — the only difference inspected was redundant
quotes being dropped. The whole vault round-trips with meaning and body intact.

THE FIRST DEPENDENCY MATRIX WAS WRONG, AND A SCREENSHOT DID NOT CATCH IT.
`depends_on` names the `name` field, never the filename. Crossing `file.name`
with `depends_on` gives two different vocabularies: measured, 0 of 50 row
labels appeared among the 49 column labels, so a 50x49 grid was drawn with no
diagonal anywhere in it. It rendered, it looked plausible, and it meant
nothing. Research found it; the count confirmed it. Behind it sat a second
fault — sorting the axes alphabetically threw away the triangularity, putting
31 of 58 marks above the diagonal in a graph with no cycles. The view now
declares the order and the renderer obeys. Both are pinned by tests: zero
marks above the diagonal, 58 below.

A GUARD THAT HAD NEVER RUN. The webview preflight test passed alone and failed
in the full suite. `preflight.ts` exits early on `SE_SELFTEST_SKIP`, which
`selftest.ts` sets for every test process — so the spawned preflight printed
"skipped" and checked nothing. The sound case passed for the wrong reason and
the broken case failed. The guard against silently dead panes had never once
been exercised in the run that gates boot.

Evidence: 359 of 359 tests green, twice, plus preflight green. The read side
and the corrected matrix were both photographed and looked at.

## What was not done

THE FRONTMATTER PROPERTIES PANEL, Obsidian-style. The owner asked for it
explicitly and nothing is started. It is the same surface as `engine/params.ts`
— the type comes from the metadata, one editor per type.

NOBODY HAS DRIVEN THE TABLE BY HAND. Everything is proven by tests and by
rendered screenshots, not by a person clicking a cell. Three older notes stand
on VS Code work in the same position.

`product/spec/table-and-pivot.md` landed from research late and has NOT been
read in full. It found the matrix defect above, so it is worth reading rather
than assuming it is superseded.

THE INBOX STANDS AT 61 NOTES. Draining was not attempted. Two of today's own
notes are rulings that belong in guidance rather than in an inbox.

THE STALE-COMMENT CLASS WAS NOT SWEPT. One was corrected — `selftest.ts`
claimed boot ran the full suite when `prepare_idle` names the preflight and
the smoke test, half a second between them. That comment caused a wrong
estimate to be given to the owner. Others of its kind were not looked for.
