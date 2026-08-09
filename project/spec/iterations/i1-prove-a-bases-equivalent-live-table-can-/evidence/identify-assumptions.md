---
form: identify-assumptions
amended: 2026-08-07T14:01:04.495Z by agent — the follow-up named raid-posix-untested, a node renamed to raid-lane-works-on-posix in the same pass
by: agent
signed_off: 2026-08-07T13:14:49.488Z
authors: agent
files:
---

# Evidence form / identify-assumptions

## current_situation

The register carried zero assumptions across 146 requirements until now, on a system that runs inside an agent harness, on an experimental runtime flag, on one platform family, against git worktrees. The shape was declared from the start and nothing filled it.

This sweep asks each source in turn, so a nil answer has to be defended per source rather than once in total.

## assumptions

- raid-strip-types-flag-holds
- raid-lane-works-on-posix
- raid-corpus-stays-small

## sweep

- environment: raid-corpus-stays-small — green is recomputed from disk on every look, and nothing bounds the corpus but the work itself. This one already bit: the corpus was being reloaded once per state, the cost landed on the render path, and the engine stopped answering three times on 2026-08-07.
- toolchain: raid-strip-types-flag-holds — every engine entry point runs on a flag Node itself calls experimental. Not one tool starts if it changes.
- host: NO ASSUMPTION, but the sweep turned up an ISSUE. A verb added by a reload is not callable until the client re-lists, and it was observed failing before it was observed working. Something already happening is an issue, not something believed — raid-reload-hides-new-verbs.
- platform: raid-lane-works-on-posix — written and run on Windows only, never once on macOS or Linux. The sharpest edge is the fan-out's root comparison, which tests a string against a platform separator.
- neighbours: none. Obsidian and the agent harness are both load-bearing and both already stand as raid-obsidian-and-harness, a DEPENDENCY rather than an assumption. Somebody else owns them and we know it, which is exactly what separates the two kinds.
- people: none. The driving roles are the owner and the agent. What is assumed about them is recorded as raid-supervision-paradox, a RISK rather than an assumption: it is not a condition the work leans on, it is a harm being watched for.

## follow_up

- every assumption carries its Probe section, so each one says how it would be checked before anybody gets round to checking it
- probe-assumptions is the state that runs them; none has been probed, and the absent probe field is what makes that visible
- raid-lane-works-on-posix is the cheapest to close and the most load-bearing. One battery run on a second platform settles it.
- raid-reload-hides-new-verbs came out of this sweep as an ISSUE and is not probed here. Issues are fixed, not probed.
- raid-adjudication-provenance-gap was closed during this pass, on the owner's ruling that git already settles responsibility. It is kept rather than deleted so nobody re-derives it.
- the sweep is per source and repeats, so a later iteration answers all six again rather than inheriting this list

## anything_else

