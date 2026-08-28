---
minted_in: i62-background-work-reports-its-own-end-the-
id: raid-risk-two-engines-run-one-folder-and-neither-says-so
type: "[[raid]]"
kind: risk
statement: Two engines can be started on one folder and one network port, and neither of them says that the other is there.
owner: the maintainer
trigger: any process listing showing more than one engine against one folder, and any report of a session dying without being stopped
status: open
looked: 2026-08-24
impact: Two engines writing one call log and one machine-state folder means neither log is the whole trail. The walk one of them serves is invisible to the other, so a person reading either sees a partial account and cannot tell that it is partial.
breaks_how_badly: corrosive
how_likely: plausible
source_refs:
  - i62-background-work-reports-its-own-end-the-
weighs_with: raid-risk-the-one-engine-guard-locks-out-a-restart-after-a-crash
weighs_against: none
---

## What was observed

FOUR PROCESSES ON ONE MACHINE, 2026-08-24, in two parent-and-child pairs. They
were started 47 seconds apart and carried identical arguments.

## What the second one does when the bind fails

THAT WAS AN OPEN QUESTION until a restart the same day took the session down
and answered it.

The answer is why this is a risk with a story rather than a worry. The second
engine does not stop cleanly and does not announce itself, so what it leaves
behind is two half-accounts rather than one refusal.

## The story, with no coincidence in it

A person or a hook starts the engine while one is already running. Nothing in
the start path asks whether the folder is taken.

## What closes it

ONE ENGINE HOLDS A GIVEN FOLDER AND ITS PORT. A second that cannot bind says
so and stops, rather than running on half-alive.

WHAT THAT COSTS is the sibling risk in this register: a guard that stops a
second engine can also stop a legitimate restart. Binding the port rather than
writing a lock file is what keeps that cost at zero.
