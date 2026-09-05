---
kind: [[rationale]]
title: one source projected everywhere
explains:
  - src/engine/project.go
  - util/projections.json
---

## decided

Projection is one mechanism and not a feature of one file. What is projected where is data. The engine projects and nobody copies by hand. A changed original re-projects on its own. A projection is read-only to the user, and it says that it is one.

## why

Instructions, cage configuration and anything a future tool insists on are the same shape: authored in one place and written to another. A second mechanism per kind of file would carry its own bugs, and the cheap targets would never get made.

What is projected where was made data. A list of sources, a target, and how that format writes a comment. Adding one became an entry rather than a change to a program.

A source may name the roots and the engine. A cage has to say which program its guards call, and only the projector knows where that program sits.

v3 placed files as a step in the installer, so a projection could be refreshed only by running the installer again. That made a projection correct immediately after an install and drifting afterwards. Here a changed original re-projects on its own. The point of naming it a projection is that the relation is maintained rather than performed once.

Guidance is authored once and projected many times. The same rules written out three times agree for about a month.

## costs

A projection is output, so a person who edits one loses the edit, and that is why the single forbidden destination is a projection. The projector has to know the roots and the engine, so it carries machine-specific knowledge that the source must never hold. A target the format cannot express as data needs the program changed after all.

## revisit when

- a host needs a file the projector cannot express as data
- a projection has to be editable by a person
- the projector is asked to write outside the roots
