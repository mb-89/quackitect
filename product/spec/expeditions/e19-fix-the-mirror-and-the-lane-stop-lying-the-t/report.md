---
form: expedition-leave
status: done
---

# e19 — the mirror and the lane stop lying

## TLDR

Eight fixes shipped, each pinned by a test. The suite went from 116 to 123.

Every one was the same shape: a mechanism that kept asserting something true
after it had stopped being true. A loading bar leaning on a page load that no
longer happened. A terminal sized to content that was never there. A proof
hashing one tree while the lane served another.

Two things are deliberately not fixed. Both are named below with the reason,
and neither is a code problem.

## What was the goal

Make the mirror and the lane stop lying to the reader.

The owner had just seen the one-screen render for the first time, and it was
telling them things that were not so. A loading bar that never went away. A
terminal that claimed half the screen and took a sliver. A machine drawing
with a column of nothing down the middle. Underneath, the same disease in the
engine: a close that stamped a record it could not finish, and a narration
field that could destroy the call it rode on.

The goal was not a feature. It was to make the visible surfaces and the
recorded state say only what is actually true.

## What was done

Eight fixes.

**The loading bar.** It had no way down. `showLoading` created it and relied on
the full page load that followed to replace it. Expedition e18 replaced full
page loads with morphing, and nothing hid it again — so entering the expedition
archive left it up for good. It now owns its lifetime: every load carries a
token and settles once, an unanswered load turns red after eight seconds and
offers a retry, and a restored page drops any bar it was showing. A click that
opens elsewhere raises no bar here, which is what stranded it.

**The double load.** A tick both navigates the page and wakes the event stream,
so the page on its way out fetched itself again. View jumps go through one
`navigateTo` that latches a flag, and `refresh` returns early once we leave.

**The terminal's height.** It sat tiny because `flex: none` with no height
sizes to content, and `max-height: 50vh` merely capped that. It starts at an
explicit half of its column now, with a splitter above it. No cap — the owner
asked to drag past half.

**The terminal's flicker.** A ResizeObserver feedback loop: `term.resize`
relaid out inside the observed pane, the observer saw that and synced again. A
browser fullscreen cycle only cured it by letting the loop settle elsewhere.
The pane is measured on the next animation frame, and a resize changing
neither rows nor columns never fires.

**The layout.** The comment node is 520 wide and banded into a column like any
state, so every other row left that column empty for the full height of the
drawing. A comment is an annotation, not a state: text now sits out of the
column grid, keeps its own row, and anchors left. Gutters tightened with it.

**Narration.** A malformed brief used to reject the whole call and discard the
payload. The work now lands, the complaint rides home as `update_refused`, and
the toll goes unpaid. Resolving a node twice the same way became a no-op; a
conflicting re-resolution still refuses.

**The close.** It now checks the trunk at the top, before anything is stamped.
Tracked changes only, so the worktrees directory cannot cry wolf.

**Two surfaces.** The details pane survives a machine switch, because the view
URL now carries the open detail. And `.se/` resolves to the project root
rather than the bound worktree, so the handover stops being written where the
next session never looks.

The survey also moved from its own header button into the legal-tools links,
where the owner actually looks for it.

## What settled it

Measurement, not argument.

**The layout was measured before it was touched.** `compact` is exported, so I
ran it over the main canvas and printed the resulting grid rather than
guessing at a picture I cannot see. That is how the empty column turned out to
be the comment's, and it is how the gain is stated: 1389x906 became 1003x816,
28% narrower and 10% shorter, with every state's left-right and up-down order
unchanged.

**The narration fix came from the record, not a hunch.** The retro queried the
call log: 18 of 25 sampled refusals traced to the update riding on every call.
That is what made it the highest-leverage fix available, ahead of anything
that merely felt broken.

**The suite went 116 to 123, and each fix carries its own test.** Two of them
are tests that changed law rather than passing: the feed test pinned "a
malformed update refuses the call", and the compaction test pinned the
comment's column order. Both were the behaviour being corrected, so both were
rewritten to pin the new rule.

**Three fixes were caught being wrong by the suite before they shipped.** The
dirty-trunk guard first counted untracked files and would have refused at
every close. The read-proof change broke the container walk. Preferring the
worktree for hashes broke pre-binding human checks. None of those reached the
owner.

## What was not done

Two things, deliberately, and one deferral.

**Which tree owns guidance.** The read-proof half of the worktree bug still
stands: `se_file_read` serves the worktree while the proof hashes the root, so
editing a pulled guidance doc inside an expedition still makes later ticks
refuse. I tried the obvious fix and the suite refused it. Preferring the
worktree voids every check the human made before binding, and a worktree
stands at a commit, so its copy differs from the tree they were reading. The
question underneath is where an expedition's guidance edits should land, which
is a ruling about work rather than a bug fix.

**One sparse row** in the packed layout, holding only ideation on the far
right. Closing it means moving a state relative to its neighbours, which is
the one thing the drawing owns. The owner should look at the packed render
first and say.

**The voice principle** for "one surface never resets another" is deferred to
idle. It edits pulled guidance, which is precisely the bug above.

Nothing else is open. The memory sweep from the same session left its 64
entries in the session scratchpad rather than deleted, recoverable until the
owner confirms.
