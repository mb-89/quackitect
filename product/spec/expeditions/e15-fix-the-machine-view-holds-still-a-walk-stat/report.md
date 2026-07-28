---
form: expedition-leave
status: done
by: agent
files:
---

# e15-fix-the-machine-view-holds-still-a-walk-stat — expedition-leave

## What was the goal

Seeded for one UX law — a walk state change never jumps the machine
view — and then, per the owner, kept open as the collecting record for
the day's rounds: mirror robustness, log clarity, records hygiene, and
two new machines.

## What was done

THE VIEW HOLDS STILL: every refresh pins the viewed machine explicitly;
pan/zoom persists per machine; a ☉ header button names the walk's
current state and jumps to it. Breadcrumbs walk the real parent chain
(main › expedition_archive › e1-e10). Decades stack top to bottom in
both archives. Session settings (autonomy, shutdown) persist in
.se/settings.json — one store, restored wholesale at boot.

THE LOG grew a KIND column after source; all formatting (bold, italic,
colors) lives on the kind, the text renders plain. New kind aq: the
se_answer tool records a question and its full answer — the feed line is
the question, the click shows both; voice.md carries the rule that every
direct question answered in chat is also recorded.

RECORDS HYGIENE: closed expedition records live in git only — the close
merges, then retires the record dir from the tree; e1–e14's merged
copies are swept; persistence.md is deleted (its two-agents seams live
on as a note). The close itself now refuses over open decision points —
the graph-is-evidence gate holds at both doors, and the form surface
announces it.

TWO MACHINES: the FRONT DESK (idle door, "In doubt, go here") — consult
reads the machinery fresh, recommends the vehicle, and executes by
seeding, noting, and deferring, carrying the bureaucracy; idle routes
every unsure user there. IDEATION (door at priority 1, the slider's
notch): frame → diverge → converge → route, with an eleven-card method
catalog under machines/methods/ any state may pull. The compiler now
takes a door statement from a sub-canvas frontmatter.

## What settled it

The suite in this worktree, green after every round: 97/97 selftests
plus preflight at close — new tests cover the pinned view and chain
crumbs, the settings store, the door shapes of both new machines, the
aq feed row, record retirement with branch serving, and the close
refusing open points.

## What was not done

Pruning is designed only as a note — too early, per the owner. The
front desk and ideation ship as machinery plus guidance; their first
real walk is the acceptance test. e15's own record folder lands on
trunk at this close (the running engine predates the retirement) — it
gets retired right after, at idle. Render-consistency lints and the
decision-render branch clarity stay noted for the iterations era.

## Files


