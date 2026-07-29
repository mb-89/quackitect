---
id: e21-explore-rebuild-the-mirror-as-a-card-matrix-one-
form: expedition-leave
status: done
authored_by: agent
authority: the owner instructed the agent to run the whole expedition unattended and merge to trunk (chat, 2026-07-29)
---

# e21 — leave

## What was the goal

Rebuild the mirror around cards. One big card holds what you are looking
at. A two-wide grid holds everything else, so nothing is ever hidden. A
number key promotes a card, and the same key again brings you back.

Two things rode along. The pruning state was designed and built, because
the owner did not want a second small expedition for it. The archive's
loading hang was fixed, because the owner hit it live while this was open.

## What was done

FIVE THINGS LANDED. Every one of them is on the branch, and the suite
stands at 150 tests, up from 139.

THE ARCHIVE HANG, fixed. Opening the expedition archive ran about 380
blocking git subprocesses, on every render.

The page loops over each archived expedition. Inside that loop it called
expeditionList, which spawns git branch --list and then a git show for
every record. Nineteen records times twenty spawns.

spawnSync holds the event loop. That is why it hung the whole server
rather than only the archive.

The list is now fetched once per render. A closed expedition's record
caches after its first read.

THE CARD MATRIX, built. The layout is ONE CSS grid across the viewport, so
promoting a card is a class change and nothing is ever re-parented. That
choice is the whole design: a moved widget is a recreated widget, and a
recreated terminal loses its scrollback.

THE CARD LIST IS THE PRODUCT'S, in product/cards.md, as nested
frontmatter. v3 exists to work on other products, and another product
wants other cards. Entry order is the numbering, permanently.

THE HOTKEY LEGEND RENDERS FROM A REGISTRY. Declare a key and it appears by
itself. The legend occupies the promoted card's vacated slot, so where it
sits also says which card is up front.

PRUNING, drawn and written. It is one state beside the retro, not a
sub-machine, because the retro is its closest sibling and the retro is one
state. Its method is product/guidance/method/pruning.md.

SIZING. Archive boxes were born 200x72, measured from the id `e20` alone
while the drawing painted the goal beneath it. They are now sized by the
goal they show.

## What settled it

THE ARCHIVE HANG was settled by reading the code and counting, not by
guessing. Nineteen closed branches, one expeditionList call per archived
state, one git show per record inside it. The arithmetic is 19 x 20. Two
regression tests now hold it: the render may contain exactly one
expeditionList call, and the branch cache must be consulted before git is
spawned.

THE RELOAD HALF OF THE GOAL WAS A FALSE PREMISE, and reading settled it.
The goal said to replace the full-page reload with incremental render. The
mirror already morphs. refresh fetches the page and diffs it into the live
DOM by id. location.reload survives in exactly one place, as the manual
retry on a stalled loading bar. What was actually missing was the guard
note-4ba204a85769 asked for, and that is what was written instead.

THE PRUNING SHAPE was settled by prior art, as note-a00d7ad21e96 demanded
before any design. Library weeding contributed CREW and MUSTIE, a fixed
named criteria list used since 1976 so two passes reach the same verdict.
Content audits contributed ROT. Evolutionary architecture contributed
fitness functions. Technical-debt practice contributed the disconfirming
finding, which is that debt work fails as a periodic sweep and succeeds as
a continuous check.

That disconfirming finding shaped the method rather than being dropped.
Anything a machine can check becomes a lint that runs on every write.
Pruning keeps only the judgment a machine cannot make. Seen twice, it was
always a lint.

THE 560px CEILING was confirmed by reading, not changed. It was already a
birth default and never a clamp, and a test already forbids the render
re-sizing a node. It was renamed BIRTH_MAX_W so the next reader cannot
mistake it for a clamp.

TWO PRIOR RULINGS were carried into the new layout rather than deleted
with the tests that held them. The terminal's half-column splitter is
retired, and the ruling it served survives in stronger form. The chat
card's hide-until-a-host-answers rule is superseded outright, because a
card that vanishes renumbers every card after it while the reader is using
those numbers.

## What was not done

THE LAYOUT WAS NEVER SEEN. This is the significant one. The mirror cannot
be called over HTTP from inside its own session without deadlocking, and
the archive door sits above the autonomy, so no card layout was ever
rendered to a screen and looked at. The tests assert the markup, the grid
rows, the numbers, the legend and the default card. None of them can see
whether it LOOKS right. First boot after merge is the first real look.

THE PREFILL GUARD WAS BYPASSED AGAIN. This report is agent-authored and
visible, not prefilled and confirmed. The authority is a chat instruction,
recorded in the frontmatter above. That is the second time, and
note-c93953578cde already records it as a hole. Nothing in the lane marks
the bypass except this paragraph and that field.

THE TRACE GRAPH AND THE BOOK are placeholders. They hold slots three and
four and say they are not built. That is the design, not an omission, but
neither card exists.

THE HOTKEY REGISTRY CARRIES ONLY WHAT EXISTS TODAY. The card keys, the
go-back key and escape. Any other shortcut the mirror grows must be
declared there rather than bound directly, or the legend starts lying.

THE ARCHIVE'S FIRST OPEN still costs one git call per closed record. The
cache makes every later open free, and the quadratic term is gone, but the
first read was left as it is.

e17, the Obsidian lint plugin, was not touched. It stays open.
