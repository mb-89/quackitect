---
id: i57-migrate-every-help-surface-in-the-produc
status: seeded
opened: 2026-08-21T13:17:18.293Z
goal: "Migrate every help surface in the product onto the preview system, and delete the two-tier help split. Ninety native title attributes across twenty-one files become marks resolving against the dictionary. The portable-versus-live branch that gives an exported copy a deliberately worse experience is removed."
vision: "DONE LOOKS LIKE: no native title attribute survives anywhere in the product as a help mechanism, and no code path asks whether it is rendering for the mirror or for an export.\n\nWHY EVERY SITE HAS TO MOVE RATHER THAN BE EXTENDED. A native title is plain text. It cannot hold a link, cannot be entered by the pointer, cannot be styled, auto-hides on the browser's own schedule, and does not exist on touch. So the open-details link that every preview must carry cannot be added to any of them. None of the ninety migrates by adding markup; each is replaced.\n\nMEASURED STARTING STATE, from scratchpad/tooltip-census.mjs: 169 TypeScript files scanned, 90 native title attributes across 21 files, and zero custom tooltip components. The heaviest are renderclient-form.ts at 12, morph-box.ts at 10 and params.ts at 10.\n\nTHE SPLIT TO DELETE is at deliverable/engine/stateform-sheet.ts line 202, which says in its own comment that the portable copy names a template rather than linking it because it travels with no editor to open, and hangs the path on a native title while the mirror draws the same chip clickable. Under the export rule the exported copy is not a lesser copy, so that branch has no reason to exist.\n\nTHE TRIGGER SPLITS TWO WAYS AND THIS ITERATION APPLIES THE RULE. A word in prose has no other job, so it is a real anchor with an href and is already in the tab order. A control has a job, so it is never a link and never takes a help click; its keyboard path is the chord on the focused control. Ninety sites get sorted into those two kinds, and the sorting is the judgment work here rather than the typing.\n\nTHE UI CONTROLS HAVE NO FRONTMATTER, so their abstracts come from somewhere the corpus rename does not reach. Deciding that home is part of this iteration: authored beside the control in code, or a help file of its own. Either way both kinds share one id space in the dictionary.\n\nWATCH FOR: a control whose abstract is written as a label rather than as a sentence that stands alone. Ninety of them written badly is the same failure the details panel already has, spread thinner."
inputs:
  - "i56-build-the-help-dictionary-and-the-previe"
  - "note-027b8e463fe8"
  - "scratchpad/tooltip-census.mjs"
  - "deliverable/engine/stateform-sheet.ts"
depends_on:
  - "i56-build-the-help-dictionary-and-the-previe"
---

# i57-migrate-every-help-surface-in-the-produc

## Goal

Migrate every help surface in the product onto the preview system, and delete the two-tier help split. Ninety native title attributes across twenty-one files become marks resolving against the dictionary. The portable-versus-live branch that gives an exported copy a deliberately worse experience is removed.

## Rough vision

DONE LOOKS LIKE: no native title attribute survives anywhere in the product as a help mechanism, and no code path asks whether it is rendering for the mirror or for an export.

WHY EVERY SITE HAS TO MOVE RATHER THAN BE EXTENDED. A native title is plain text. It cannot hold a link, cannot be entered by the pointer, cannot be styled, auto-hides on the browser's own schedule, and does not exist on touch. So the open-details link that every preview must carry cannot be added to any of them. None of the ninety migrates by adding markup; each is replaced.

MEASURED STARTING STATE, from scratchpad/tooltip-census.mjs: 169 TypeScript files scanned, 90 native title attributes across 21 files, and zero custom tooltip components. The heaviest are renderclient-form.ts at 12, morph-box.ts at 10 and params.ts at 10.

THE SPLIT TO DELETE is at deliverable/engine/stateform-sheet.ts line 202, which says in its own comment that the portable copy names a template rather than linking it because it travels with no editor to open, and hangs the path on a native title while the mirror draws the same chip clickable. Under the export rule the exported copy is not a lesser copy, so that branch has no reason to exist.

THE TRIGGER SPLITS TWO WAYS AND THIS ITERATION APPLIES THE RULE. A word in prose has no other job, so it is a real anchor with an href and is already in the tab order. A control has a job, so it is never a link and never takes a help click; its keyboard path is the chord on the focused control. Ninety sites get sorted into those two kinds, and the sorting is the judgment work here rather than the typing.

THE UI CONTROLS HAVE NO FRONTMATTER, so their abstracts come from somewhere the corpus rename does not reach. Deciding that home is part of this iteration: authored beside the control in code, or a help file of its own. Either way both kinds share one id space in the dictionary.

WATCH FOR: a control whose abstract is written as a label rather than as a sentence that stands alone. Ninety of them written badly is the same failure the details panel already has, spread thinner.

## Inputs

- i56-build-the-help-dictionary-and-the-previe
- note-027b8e463fe8
- scratchpad/tooltip-census.mjs
- deliverable/engine/stateform-sheet.ts
