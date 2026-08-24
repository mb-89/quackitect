---
id: i23-judgment-the-ui-sitting-cut-the-html-mir
status: seeded
opened: 2026-08-12T19:47:09.097Z
goal: "JUDGMENT — the UI sitting: cut the HTML mirror, settle the VS Code shell, and build the coverage dashboard, with the owner at the screen."
vision: |-
  NEEDS THE OWNER AT THE SCREEN. Visual design is his, and several items here are one-surface-versus-two decisions that only make sense while looking at them.

  THE SPLIT RULE (owner ruling 2026-08-23). This record holds ONLY what needs the owner's judgment. Everything already ruled, and every item shaped like a defect with one right answer, belongs to i4 and is struck from here.

  STRUCK AND MOVED TO i4: the HTML mirror cut, ruled 2026-08-06; the shell defect list, including the two renderers that draw the same controls and disagree silently; honest degradation, ruled in; the no-green-ocean law; the UI rulings of 2026-08-10; no silent drops in the trace graph; both autonomy-control defects; and the table-editor extraction. Read them here for their argument; build them there.

  WHAT STAYS IS JUDGMENT: the coverage dashboard's design, v1's filter-column trick as a proposal to adopt, the owner's own layout and the log-placement test, the five-files-per-level law as something to adopt, the deferred layout direction with its technology question, v1's open risk that an item-level node-link graph has no tooling precedent, and the open question of where a contract-only interface hangs.

  THE MIRROR CUT IS ALREADY RULED (2026-08-06): the HTML mirror goes out. The pre-cut checks ride the backlog — the widget and doc routes, the twin form renderers, and the finding that code serve-web never surfaces a folder-dropped extension's contributions, which decides the shape.

  THE DASHBOARD IS THE COVERAGE SURFACE WE LACK. The mechanical coverage checks already exist in engine/trace.ts; what is missing is the live view. The owner's own words: humans cannot read the data in the database without visualisations, so we need them.

  V1'S TRICK IS WORTH COPYING AND IT IS ALMOST FREE: the register's FILTER COLUMNS CARRY THE FACET COVERAGE, so A ZERO-COUNT VALUE IS THE COMPLETENESS CHECK, LIVE. The board doubles as the register's filter row. Nobody runs a report; the hole is visible on the surface.

  AND THE LAW THAT SHAPES EVERY PANE: NO GREEN OCEAN. Failing and missing items render prominently and easily reachable; passing masses collapse into counts. With zero exceptions the block is one green sentence.

  HONEST DEGRADATION BINDS EVERY PANE TOO, and it is ruled in. A pane showing partial information SAYS SO instead of looking complete. Fifty of three thousand one hundred and twenty, not fifty rows. Absence, staleness and error are three different things and a blank conflates all three. We already do it in two places as requirements — the missing web-search provider is named, and the tour admits absence — and there is no rule binding the rest.

  THE SHELL ITEMS FROM THE BACKLOG: the launcher must refuse a second agent while one runs; the extension hard-codes a second control bar so the engine's control changes are invisible; two renderers draw the same controls and disagree silently; the hot-swap junction cannot work while package.json carries the brand; the launcher has no real activation event and retries with a fake Enter; and no VS Code extension can synthesise keystrokes, which the API refuses on purpose.

  THE OWNER'S LAYOUT: agent and log stacked in ONE side bar, the panel left empty. Test the log-under-Claude placement before building the editor-area layout.

  HIS UI RULINGS OF 2026-08-10 ride here: one editor per field, wiki links clickable everywhere, draggable columns, the pareto redo, the morph box drawing straight row-to-row segments rather than crisscross curves, and the compare card's own buttons wired.

  A LAW FROM V1 WORTH ADOPTING WHILE HERE: at most about five visible files and folders per level, dotfolders exempt. That is the rule behind the owner's complaint that .quack-watch.json clutters the folder he opens.

  FULL CONTEXT: project/spec/version-planning.md, section J5.

  FROM THE POOL, 2026-08-13. Five more, and the first is the layout round's first requirement.

  NO SILENT DROPS (owner, note-4e2562432ae6), which the owner named as the trace-graph rework's first requirement. Measured 2026-08-11: 136 of 150 requirements drew before an edge fix, with 14 already missing silently, and 106 of 150 draw once test-specs and elements fold in - 44 missing. Nothing reports it. A node the layout cannot fit simply does not appear, so the graph reads as complete while missing a third of the register, which is worse than the cramming the owner flagged. One related defect is fixed with a regression case: the loader never folded two edge kinds into the drawn slot, so three node levels drew nothing at all. ONE QUESTION STAYS OPEN: a contract-only interface has no upward edge and nowhere to hang.

  THE LAYOUT DIRECTION, AND THE TECHNOLOGY QUESTION FIRST (note-dcbbd54e1605). Nodes cram at their ring's inner edge and waste the band, with the requirements filling about half their segment's area while the next radius is already sized to fit everything - so the crowding is placement rather than space. Nodes should tend toward the MIDDLE of their band and spread radially within it, so a dense level uses its whole annulus instead of one circle line. THE OWNER DEFERRED THE LAYOUT WORK pending a discussion of whether the trace graph keeps its current drawing technology at all. Do not sink more layout work in before that is settled.

  AND V1 RECORDED THE SAME RISK AS OPEN (note-6ba748959a02). The item-level node-link graph has NO TOOLING PRECEDENT proving it scales for browsing, and the prior art's item-level trace views are tabular with type-level diagrams only. Its mitigation is the useful part: collapsible cluster bundling shrinks the rendered graph an order of magnitude.

  TWO DEFECTS ON THE AUTONOMY CONTROL, both with line references (note-e3231231fc37). THE LAG IS THE POLL, NOT THE ENGINE: the log measured the owner's two clicks at zero and one millisecond, and what they wait for is the feed LINE, which waits for the next poll tick at one second. The note branch posts and then awaits a log poll at once; the autonomy branch posts and returns. Same fix, and it wants a sweep, since emergency, power and narration take the same path. THE FEED STILL SPEAKS THE OLD NUMERIC SCALE, printing a bare decimal where the rungs are named and every pull already carries the tier word, and the old slider survives in two more places painting a two-decimal label. A sweep for every surviving numeric autonomy surface closes this, not a single edit.

  A TABLE EDITOR IS A MATRIX EDITOR (note-195c34f89ac0). Each editor writes its own pager, its own column widths and its own cell rendering. Extract one generic grid layer carrying all three and let each editor configure it. THE TRIGGER IS THE ARGUMENT: column resize was built for tables and then requested again for the node table, which is the second ask for the same machinery.
inputs:
  - project/spec/version-planning.md
  - project/deliverable/engine/trace.ts
  - spec/man-verification-validation.md at ref main
depends_on:
  - i4-the-panel-round-the-archived-iteration-b
  - i27
  - i11-the-engine-fix-bundle-about-twenty-named
---

# i23-judgment-the-ui-sitting-cut-the-html-mir

## Goal

JUDGMENT — the UI sitting: cut the HTML mirror, settle the VS Code shell, and build the coverage dashboard, with the owner at the screen.

## Rough vision

NEEDS THE OWNER AT THE SCREEN. Visual design is his, and several items here are one-surface-versus-two decisions that only make sense while looking at them.

THE SPLIT RULE (owner ruling 2026-08-23). This record holds ONLY what needs the owner's judgment. Everything already ruled, and every item shaped like a defect with one right answer, belongs to i4 and is struck from here.

STRUCK AND MOVED TO i4: the HTML mirror cut, ruled 2026-08-06; the shell defect list, including the two renderers that draw the same controls and disagree silently; honest degradation, ruled in; the no-green-ocean law; the UI rulings of 2026-08-10; no silent drops in the trace graph; both autonomy-control defects; and the table-editor extraction. Read them here for their argument; build them there.

WHAT STAYS IS JUDGMENT: the coverage dashboard's design, v1's filter-column trick as a proposal to adopt, the owner's own layout and the log-placement test, the five-files-per-level law as something to adopt, the deferred layout direction with its technology question, v1's open risk that an item-level node-link graph has no tooling precedent, and the open question of where a contract-only interface hangs.

THE MIRROR CUT IS ALREADY RULED (2026-08-06): the HTML mirror goes out. The pre-cut checks ride the backlog — the widget and doc routes, the twin form renderers, and the finding that code serve-web never surfaces a folder-dropped extension's contributions, which decides the shape.

THE DASHBOARD IS THE COVERAGE SURFACE WE LACK. The mechanical coverage checks already exist in engine/trace.ts; what is missing is the live view. The owner's own words: humans cannot read the data in the database without visualisations, so we need them.

V1'S TRICK IS WORTH COPYING AND IT IS ALMOST FREE: the register's FILTER COLUMNS CARRY THE FACET COVERAGE, so A ZERO-COUNT VALUE IS THE COMPLETENESS CHECK, LIVE. The board doubles as the register's filter row. Nobody runs a report; the hole is visible on the surface.

AND THE LAW THAT SHAPES EVERY PANE: NO GREEN OCEAN. Failing and missing items render prominently and easily reachable; passing masses collapse into counts. With zero exceptions the block is one green sentence.

HONEST DEGRADATION BINDS EVERY PANE TOO, and it is ruled in. A pane showing partial information SAYS SO instead of looking complete. Fifty of three thousand one hundred and twenty, not fifty rows. Absence, staleness and error are three different things and a blank conflates all three. We already do it in two places as requirements — the missing web-search provider is named, and the tour admits absence — and there is no rule binding the rest.

THE SHELL ITEMS FROM THE BACKLOG: the launcher must refuse a second agent while one runs; the extension hard-codes a second control bar so the engine's control changes are invisible; two renderers draw the same controls and disagree silently; the hot-swap junction cannot work while package.json carries the brand; the launcher has no real activation event and retries with a fake Enter; and no VS Code extension can synthesise keystrokes, which the API refuses on purpose.

THE OWNER'S LAYOUT: agent and log stacked in ONE side bar, the panel left empty. Test the log-under-Claude placement before building the editor-area layout.

HIS UI RULINGS OF 2026-08-10 ride here: one editor per field, wiki links clickable everywhere, draggable columns, the pareto redo, the morph box drawing straight row-to-row segments rather than crisscross curves, and the compare card's own buttons wired.

A LAW FROM V1 WORTH ADOPTING WHILE HERE: at most about five visible files and folders per level, dotfolders exempt. That is the rule behind the owner's complaint that .quack-watch.json clutters the folder he opens.

FULL CONTEXT: project/spec/version-planning.md, section J5.

FROM THE POOL, 2026-08-13. Five more, and the first is the layout round's first requirement.

NO SILENT DROPS (owner, note-4e2562432ae6), which the owner named as the trace-graph rework's first requirement. Measured 2026-08-11: 136 of 150 requirements drew before an edge fix, with 14 already missing silently, and 106 of 150 draw once test-specs and elements fold in - 44 missing. Nothing reports it. A node the layout cannot fit simply does not appear, so the graph reads as complete while missing a third of the register, which is worse than the cramming the owner flagged. One related defect is fixed with a regression case: the loader never folded two edge kinds into the drawn slot, so three node levels drew nothing at all. ONE QUESTION STAYS OPEN: a contract-only interface has no upward edge and nowhere to hang.

THE LAYOUT DIRECTION, AND THE TECHNOLOGY QUESTION FIRST (note-dcbbd54e1605). Nodes cram at their ring's inner edge and waste the band, with the requirements filling about half their segment's area while the next radius is already sized to fit everything - so the crowding is placement rather than space. Nodes should tend toward the MIDDLE of their band and spread radially within it, so a dense level uses its whole annulus instead of one circle line. THE OWNER DEFERRED THE LAYOUT WORK pending a discussion of whether the trace graph keeps its current drawing technology at all. Do not sink more layout work in before that is settled.

AND V1 RECORDED THE SAME RISK AS OPEN (note-6ba748959a02). The item-level node-link graph has NO TOOLING PRECEDENT proving it scales for browsing, and the prior art's item-level trace views are tabular with type-level diagrams only. Its mitigation is the useful part: collapsible cluster bundling shrinks the rendered graph an order of magnitude.

TWO DEFECTS ON THE AUTONOMY CONTROL, both with line references (note-e3231231fc37). THE LAG IS THE POLL, NOT THE ENGINE: the log measured the owner's two clicks at zero and one millisecond, and what they wait for is the feed LINE, which waits for the next poll tick at one second. The note branch posts and then awaits a log poll at once; the autonomy branch posts and returns. Same fix, and it wants a sweep, since emergency, power and narration take the same path. THE FEED STILL SPEAKS THE OLD NUMERIC SCALE, printing a bare decimal where the rungs are named and every pull already carries the tier word, and the old slider survives in two more places painting a two-decimal label. A sweep for every surviving numeric autonomy surface closes this, not a single edit.

A TABLE EDITOR IS A MATRIX EDITOR (note-195c34f89ac0). Each editor writes its own pager, its own column widths and its own cell rendering. Extract one generic grid layer carrying all three and let each editor configure it. THE TRIGGER IS THE ARGUMENT: column resize was built for tables and then requested again for the node table, which is the second ask for the same machinery.

## Inputs

- project/spec/version-planning.md
- project/deliverable/engine/trace.ts
- spec/man-verification-validation.md at ref main

## Carried work tokens

These stood in the options pool referenced by no iteration at all. Assigned
here in a pass over the pool.

- wt-an-extension-of-the-two-armed-diagram-idea-the-picture-carri
- wt-show-an-iteration-s-footprint-as-the-two-armed-diagram-engin

## Carried in by the retro of 2026-08-24

TWO JUDGMENTS ABOUT SURFACES, both needing the owner at the screen.

### Every custom editor is checked against a native one first

THE RULE. Before an editor is built or kept, name the native control that would
do the job. Build the custom one only where no native control fits, and record
which one was ruled out.

THE OWNER'S CAVEAT, kept because it cuts against the rule: their experience is
that this has not worked so far. So the check must record WHY a native control
failed, or the next round repeats the same disappointment.

WHICH EDITORS IT REACHES: the checklist, the node table, the compare card, the
dependency matrix and the table editor.

THE COMPARE CARD IS THE SHARPEST CASE. It is a two-button question over a set,
which is exactly what a native quick pick answers.

### Source nobody modelled could be refused at the write

HALF OF IT STANDS. Every design spec declares its files, and one state sweeps
for files no spec claims.

TWO THINGS ARE MISSING: teeth and timing. It reports instead of refusing, and
it reports at the end of a record instead of at the write.

THE COST NEEDS PRICING BEFORE IT IS BUILT. Every new file would need its design
spec first, including a helper split out during a refactor.

## The editor is the only surface that counts (owner ruling 2026-08-23)

THIS NEEDS NO JUDGMENT, and the owner said so plainly on 2026-08-24. It is here
because this is the record that owns the surfaces, not because anything about it
is still open to debate.

THE OWNER'S WORDS: whenever you work on markup, it must be the markup the editor
panel renders. Rendering the same files somewhere else for an agent to look at
is fine. Carrying files that do not show up in the panel is not.

THE TEST IS NOT WHETHER A FILE IS REGISTERED. It is whether the panel actually
uses it. A file the panel does not use may not exist.

WHAT KEEPS GOING WRONG, in the owner's words again: the agent repeatedly says it
has fixed something that cannot be seen in the editor, because it was fixed
somewhere else. That has to stop.

SO THE SORTING QUESTION IS ONE, NOT THREE. Does the panel use this file. Yes, it
stays. No, it goes.

THE SECOND SURFACE MAY STILL SERVE THE SAME FILES. What it may not do is carry
anything the panel does not.

THE GENERAL FORM IS A SIBLING AND STILL NEEDS JUDGMENT: which surfaces a person
looks at are declared once, where both a person and a check can read them. That
one is above, with the other judgment items.