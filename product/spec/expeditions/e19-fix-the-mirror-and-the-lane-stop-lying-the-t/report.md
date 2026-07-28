---
form: expedition-leave
status: done
---

# e19 — the mirror and the lane stop lying

## TLDR

Eight fixes shipped, each pinned by a test. The suite went from 116 to 123.

Every one of them was the same shape: a mechanism that kept saying something
true, after it had stopped being true. A loading bar that leaned on a page
load that no longer happened. A terminal sized to content that was never
there. A proof that hashed one tree while the lane served another.

Two things are deliberately NOT fixed, and both are named below with the
reason. Neither is a code problem.

## What shipped

### The loading bar stops lying

The bar had no way down. `showLoading` created it and relied on the full page
load that followed to replace it. Expedition e18 replaced full page loads with
morphing, and nothing hid it again — so entering the expedition archive left
it up for good, exactly as the owner reported.

It now owns its lifetime. Every load carries a token and settles once. A load
nobody answers within eight seconds turns red and offers a retry, instead of
spinning in front of a page that finished long ago. A restored or
back-navigated page drops any bar it was showing. And a click that opens
somewhere else raises no bar here — the expand controls advertise ctrl-click
and shift-click, and those never navigate the current page.

The double load was real and related. A tick both navigates the page and wakes
the event stream, so the page on its way out fetched itself again. View jumps
now go through one `navigateTo` that latches a flag, and `refresh` returns
early once we are leaving.

### The terminal earns its space

It sat tiny because `flex: none` with no height sizes to CONTENT, and
`max-height: 50vh` merely capped that. It starts at an explicit half of its
column now, with a splitter above it that hands the height to the reader. No
cap — the owner asked to be able to drag past half.

The flicker was a ResizeObserver feedback loop: `term.resize` relaid out
inside the observed pane, the observer saw the relayout and synced again. A
browser fullscreen cycle only ever cured it by letting the loop settle
somewhere new. The pane is now measured on the next animation frame, and a
resize that would change neither rows nor columns never fires.

### The layout packs tighter

Measured before changing anything, by running `compact` over the main canvas
and printing the resulting grid. The waste was not vague: the comment node is
520 wide and banded into a COLUMN like any state, so every other row left that
column empty for the full height of the drawing.

A comment is an annotation, not a state. Text now sits out of the column grid,
keeps its own row, and anchors at the left edge. Gutters tightened with it.

The main machine goes from 1389x906 to 1003x816 — 28% narrower, 10% shorter,
with every state's left-right and up-down order unchanged.

### Narration stops vetoing the work it narrates

The retro measured it: 18 of 25 sampled refusals came from the update riding
on every call. One cause, two shapes.

A malformed brief used to reject the whole call and discard the payload with
it. What was actually lost this session, to the punctuation of a label riding
alongside:

- A four-thousand word answer.
- A four-file atomic patch.
- Two finished notes.

The work now lands, and the complaint rides home as `update_refused`. The toll
goes unpaid, so the rule keeps its teeth. It just bites the narration instead
of the work.

Resolving a node twice the same way is now a no-op. `plan` and `fork` were
already idempotent for exactly this reason, with the cause named in a comment;
`done`, `obsolete` and `revert` never got the same treatment. A conflicting
re-resolution still refuses — that is a real disagreement.

### The close refuses early on a dirty trunk

Found live closing e18. Git refuses to overwrite uncommitted local changes, so
the merge failed — and the abort after it failed too, because no merge had
started. The record was already stamped closed by then.

The check runs at the top of the close now, before anything is stamped.
Tracked changes only: untracked files are ignored on purpose, because the
worktrees directory lives there and a guard that cries wolf gets worked
around.

### The details pane survives a machine switch

The view URL carried only the view, so switching machines silently threw away
whatever the reader had open beside it. It carries the detail now.

The owner has raised this shape more than once, so it is stated as a rule
rather than patched again: an action in ONE surface never resets ANOTHER.

### The survey rides the legal-tools links

It was already human-callable, with a button in the machine header. The owner
never found it there, in a row shared with the crumbs, the slider and the
escape control. The gap was discoverability, not capability.

It is registered human-callable now, so it appears wherever a state lists its
legal tools. The button is gone. No lane tool earns bespoke chrome.

### `.se/` stops hiding in the worktree

`.se/` is session state, not branch content. It resolved into the bound
worktree, which has no `.se` — so writing the handover from inside an
expedition landed it where the next session never looks, and said nothing.

The lane now resolves per path: `.se/` to the project root, everything else to
the work root. A patch batch spanning both trees is refused rather than half
written, because atomicity has no meaning across two roots.

## What is NOT fixed, and why

**Which tree owns guidance.** The read-proof half of the worktree bug still
stands. I tried the obvious fix and the suite refused it: preferring the
worktree voids every check the human made before binding, and a worktree
stands at a commit, so its copy differs from the tree they were reading. The
real question underneath is where an expedition's guidance edits should LAND,
and that is a ruling about work, not a bug fix.

**One sparse row** in the packed layout, holding only ideation on the far
right. Closing it means moving a state relative to its neighbours, which is
the one thing the drawing owns. The owner should look at the packed render
first.

## Open threads

- The voice principle for "one surface never resets another" is deferred to
  idle. It edits pulled guidance, which is precisely the bug above.
- The memory sweep left 64 entries in the session scratchpad rather than
  deleted, recoverable until the owner confirms.
