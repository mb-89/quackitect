---
id: tasks
statement: The background-task table, its own panel so it always sits last. The engine READS this file; edit it here.
---

# Background tasks

ONE PANEL, ONE ROW. It is separate from `controls.md` for one reason: it must
be the LAST thing in the sidebar, under the note row and under anything added
later (owner ruling 2026-08-23).

ITS HEIGHT FOLLOWS THE WORK. A job starts and the table grows; a job ends and
it shrinks. Anywhere but the bottom, that movement pushes whatever sits below
it while a person is reaching for a control.

BEING ITS OWN PANEL IS WHAT MAKES THAT SAFE. A row inside `controls.md` sits
wherever its line sits, and the next control appended after it would end up
underneath. A panel is placed by `renderSidebar`, which puts this one last
whatever the other specs come to hold.

## Parameters

- BG tasks | table | running | what is running out of sight — the name, how far along, and when it lands; hover a name for what it is

## The three columns

TASK is a short handle, one or two words. Hover it for the full description —
the description has no column of its own, because a person scanning wants how
far along and when, and reaches for what it is only when a row surprises them.

PROGRESS is steps behind over steps in total. EVERY BACKGROUND TASK DECLARES
ITS STEP COUNT when it starts, and the interface refuses to start one that
will not say. A guess is fine, and the total may RISE later: work found while
working is real, and a total that never moves is the lie.

ETA IS THE ENGINE'S ARITHMETIC, never the task's opinion. The engine knows
when the task started, how many steps are behind it and how many are ahead;
elapsed time over steps behind is what one step costs, and the steps ahead are
what remain.

A DASH INVITES LAZINESS, which is why the step count is forced. Two steps into
a run of twenty is a real basis for a figure. Refusing to estimate until a task
volunteers one means most rows say nothing and a person waiting learns nothing.

A TASK THAT MEASURES ITS OWN PACE KEEPS ITS FIGURE. A test battery times its
own cases and projects better than arithmetic on steps, so its own estimate
wins where it has one.

## What never appears here

WORK THAT FINISHES QUICKLY IS NOT LISTED. A row that appears and vanishes
inside a second cannot be read, and it makes the table jump under the reader's
eye. `PANEL_MIN_MS` in `deliverable/engine/run.ts` holds that floor.
