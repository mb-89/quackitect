---
form: expedition-leave
status: done
by: agent
files:
---

# e29 — today's bucket for 2026-08-01, second session

## What was the goal

Hold the day's second-session work. It opened for one urgent thing and grew into
one large thing.

The urgent item was the VS Code control bar. The owner had redrawn the controls
in the previous expedition, restarted the window, and still saw the old sliders.

The large item was the Bases-equivalent live database. The owner rejected the
direction the previous expedition took: what had been built was a renderer for
view files somebody else authors, and what was wanted is the view AS THE
INSTRUMENT, built and changed and saved from the interface.

The goal was amended mid-expedition to say so, because the bucket had grown past
what it was opened for.

## What was done

THE CONTROL BAR. The extension hard-coded its own bar while only the engine's
had been replaced, so the two disagreed and the copy the owner touched was the
one with no test on it. The hand-written HTML is deleted. The bar is now rows
built from two panel specs, served by the engine, asserted by a test.

THE EXPRESSION LANGUAGE (engine/expr.ts, new). It did not exist at all, and
filters and formulas both stand on it. Typed values, a lexer, a recursive-descent
parser, and call-by-name for filter, map and reduce. The function registry is two
open maps rather than a switch, so our own functions join the language the same
way Obsidian's do. 104 tests, nearly all of them worked examples copied out of
the reference.

THE WARM MODEL (engine/vault.ts, new). One index of every note, built once and
held. Frontmatter and a file member are kept; the body is read, mined for
wikilinks, and dropped. A watcher keeps it current one file at a time. The index
persists to .se/vault-index.json so a restart does not re-read the vault.

THE CONTROLS (engine/bases.ts, new). Every control writes the .base file:
properties, sort, group-by, column order, column widths, view lifecycle, and the
query typed by hand. Each edit round-trips the WHOLE document, so keys the
renderer does not model travel through untouched.

THE CARD (engine/baseui.ts and engine/basesclient.ts, new). The toolbar, the
popovers, the query panel that flips with the table, and help that lands in the
details pane. The function help is generated from the live registry.

GROUPING AND NESTED SORTING. Sort takes several levels, each settling what the
one above left tied. Group-by takes several levels too, each subdividing the one
above it — a deliberate widening past Obsidian, which allows one.

WHAT WAS TAKEN OUT, and this is half the work. Filter, Search, the view
switcher, a New button, a formula button and a drag grip were all drawn before
they worked. Every one of them was removed, and each removal now has a test
holding it out. The old tableWidget went with them, superseded by the card.

The three matrix bases left the vault and became test fixtures, so the vault
holds one database file beside cards.md, as the owner specified.

## What settled it

MEASUREMENT, not assertion. engine/bin/bench-vault.ts builds a synthetic vault
and reports. At 30,000 notes: the cold pooled build takes 5.4 s, a warm start
from the saved index takes 442 ms, and filtering 30,000 rows down to dozens
takes 1.9 to 15.9 ms. Changing, adding and removing one note cost 0.6, 1.3 and
1.2 ms. Heap held is 68 MB.

That settles the owner's first proof point: the hot path is filtering, and it is
fast enough with room to spare.

PROFILING CORRECTED AN ASSUMPTION. I had assumed YAML parsing dominated the
build. It is about 20%; reading the files is about 60%. The fix was therefore
concurrency, not a faster parser. I would have optimised the wrong thing.

THE TESTS. 571 pass. The ones carrying the most weight are the round-trip suite
in tests/bases.test.ts, which proves a control write does not delete the
formulas and summaries the renderer does not model, and tests/grouping.test.ts,
which proves the sort and group levels actually apply.

THE OWNER'S OWN HAND. The columns now in product/database.base were ticked by
the owner in the card, not written by me. That is the control writing the file,
observed rather than claimed.

FOUR THINGS I GOT WRONG AND THE OWNER CAUGHT.

I told the owner to restart the engine to see work that was still sitting on the
expedition branch. It had never been landed, so the restart could only redraw
the old code. Landing is now the step before saying restart.

I copied controls off the screenshots without asking what they do. The New
button creates a note in Obsidian and nothing here.

I put the query behind the details pane. It has to sit beside the controls,
because the point is watching a tick change a line of YAML.

I read "the code" as my TypeScript. The owner meant the query.

## What was not done

The embed. Referencing a view from inside a note, the ![[database.base#View]]
form, is captured in note-9a0d4ccb25d5 and waits on the owner's word.

Filter and Search. Removed rather than fixed. The filter builder and its raw
escape hatch still exist in engine/bases.ts with tests behind them; only the
surface is gone. Putting them back is wiring, not design.

Formulas. The renderer ignores the formulas key entirely. The expression
language supports them and the evaluator resolves formula. references, so the
gap is in renderView alone.

Cards, List and the pivot as a chosen layout. The registry names them; only
table draws.

HAND VERIFICATION. I have not driven the card myself. The owner has, and found
the things above. Column drag-and-resize in particular is asserted in the markup
and has never been dragged by a person.

The i1 iteration stands open with a bound worktree. The owner ruled it is not
the vehicle and said they will reuse it later for something else.

The comments in the three matrix bases were stripped by Obsidian when it opened
depends.base, and the merge carried that into the fixture copy. The text is
recoverable from git history. Nobody has decided whether to restore it.
