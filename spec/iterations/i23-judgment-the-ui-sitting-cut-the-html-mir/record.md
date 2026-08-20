---
id: i23-judgment-the-ui-sitting-cut-the-html-mir
status: open
started: 2026-08-14T19:56:05.196Z
opened: 2026-08-12T19:47:09.097Z
goal: "JUDGMENT — the UI sitting: cut the HTML mirror, settle the VS Code shell, and build the coverage dashboard, with the owner at the screen."
vision: |-
  NEEDS THE OWNER AT THE SCREEN. Visual design is his, and several items here are one-surface-versus-two decisions that only make sense while looking at them.

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
