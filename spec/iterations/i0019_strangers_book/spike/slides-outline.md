# The five-minutes deck - slide outline (owner, 2026-07-12, authoritative for p4)

1. **Get it.** SELF-CONTAINED - the deck never points at the README (owner rule). Option A:
   download/clone the repo, run RUNME. Option B: the starter prompt INLINE, verbatim on the
   slide: say to your agent - "clone https://github.com/mb-89/quackitect, and lets start a new
   project". (Prerequisites named on the slide, matching RUNME's actual checks.)
2. **Start the loop.** `engage start` - tell the system what you want; the attest grant (the
   human's one console command). HERE the rigor-mismatch warning appears: systematic is
   overkill for pong - noted, chosen deliberately to show every milestone.
3. **Design input.** Walking the input side - how requirements are collected; the few most
   important pong requirements shown (paddle control, ball physics + scoring, single file).
4. **Design output.** Architecture, the actual design, and the working deliverable taking shape.
5. **Validation & packaging.** It ships MORE than the deliverable: the docs ride along - a
   small BOOK for pong, the report, the zip. (Timeline: measured minutes per milestone across
   the bottom, from timings.tsv.)
6. **Discussion (last).** Pong is deliberately small. The rigor mismatch catches misfit in BOTH
   directions - too much ceremony for a toy, too little for a real system. For throwaway vibe
   coding you would not use quackitect at all - but it will warn you about it. (The playable
   pong embeds here, lazy-init, if the budget holds - it does: 3.9KB.)

Timeline across all slides: elapsed minutes from the measured walk (timings.tsv) - honest numbers.

## Round 2 (owner, 2026-07-12 - binding)
- TIMELINE: ends AT the discussion slide - no tick/space reading as a step after the last slide; the total label is a caption, never a phantom step.
- s6 DISCUSSION: two columns. LEFT = the game, AUTO-STARTED the moment the slide is entered (no start button; lazy relative to page load - slide entry is the trigger; restart stays). RIGHT = the discussion.
- s6 TEXT (owner formulation, verbatim base): "Pong is not an example you would usually use quackitect for. That is why quackitect warned you that it is overkill. We used Pong as a small example to show you how the workflow works. The bigger the project, the more the rigor pays off. quackitect itself will tell you if the rigor does not match the project." Then the prior points beneath, cleaned (both directions, vibe-coding stance, roadmap warning).
- s1: Option A / Option B lines BOLD (fat), bigger spacing before each option block.
- s2: a CHAT-HISTORY figure (Teams/SMS-style speech bubbles): user <-> agent exchange of the start step - INCLUDING the rigor exchange (agent: systematic is overkill for pong, keep it? / user: yes, show every milestone). Figure with title + caption.
- s3: a TRACE-GRAPH figure filtered to design input - pong's needs, use cases, requirements. Figure with title + caption.
- s4: a design-output RESULT figure (pong's architecture sketch; SVG-with-text, never raster). Figure with title + caption.
- EVERY rendered artifact on a slide is a FIGURE: caption + title describing what it is.
- FIGURE REUSE (owner correction): never hand-author an SVG the book already renders - the deck is IN the book; slides reference the book's own figures (the fig: mechanism). s3 = the real trace graph scoped to design input; s4 = the real model/onion figure. Authored SVG only where no book figure exists (s2 chat, s5 zip).
