---
minted_in: i5-engine-hygiene-one-version-source-every-
id: raid-iss-an-ephemeral-box-loses-the-whole-record-of-a-session
type: "[[raid]]"
kind: issue
statement: The call log, the notes and the handover all live in `.se/`, which git ignores. Nothing a session learns can reach the next clone by that route, and the design that retired the written handover assumed a machine that persists.
owner: the maintainer
trigger: every cloud run, and the first retro after one
status: open
impact: A retro can only mine the container it runs in. The window for i5's retro opened at this container's first pull, so three earlier sessions of the same iteration are simply absent from it. A session that wrote a handover for its successor wrote it into a directory the successor never sees.
breaks_how_badly: crippling
how_likely: expected
source_refs:
  - dsp-resolution-seam
  - dsp-walk-machine
  - dsp-call-log
  - nbr-cloud-host
  - i5-engine-hygiene-one-version-source-every-
weighs_with: none
weighs_against: none
---
## What was observed

MEASURED ON THIS CLONE, 2026-08-19, and stated carefully because the first
reading of it was wrong.

TEN READS OF `.se/HANDOVER.md` WERE REFUSED SE-C-102, file not found. They
were not a file being eaten. They were an agent looking for a predecessor's
account and finding that none can exist here: this clone was fresh, and a
handover is not something a previous session could have left on it.

A HANDOVER WAS THEN WRITTEN, at 13:05Z, for whoever comes next. It is at
`.se/HANDOVER.md`. `.gitignore` line 2 is `.se/` and `git ls-files .se`
returns nothing, so that file will not reach the next clone either. The act of
writing it changes nothing about whether it arrives.

THE RETRO WINDOW SAYS THE SAME THING FROM THE OTHER SIDE. Step 1 takes the
oldest record since the last judged drain. It returned this clone's FIRST PULL,
10:40:44Z — not a previous retro, because no earlier call exists in this log.
The whole of i5, 10:47 to 14:04, is one window because there is nothing else
here to be in one.

`.se/roots.json` DOES NOT EXIST ON THIS CLONE EITHER, so step 6's memory drain
could not reach the harness memory folder through a declared root. Nothing was
surfaced in context and nothing was reachable, and that is recorded rather than
ticked.

## Why the design points the other way

`dsp-resolution-seam` and `dsp-walk-machine` both say `.se/` IS session
state, and that the handover, the notes and the call log belong to the person's
machine. `dsp-call-log` retired the written handover on the grounds that the
log replaces it.

BOTH DECISIONS ARE RIGHT ON A LAPTOP. On a laptop the machine outlives the
session, so session state persists exactly as long as the person does.

ON A RECLAIMED CONTAINER NEITHER HOLDS. The log dies with the box, so it cannot
replace anything. `nbr-cloud-host` already forbids a prose handover crossing,
which closes the obvious repair and leaves the gap open.

## What repair consists of

- Decide what a session owes its successor when the box does not persist, and
  which artifact carries it. Today the answer is nothing.
- The candidates that already travel: raid entries, work tokens, corpus nodes,
  the evidence forms. All of them are on trunk and all of them are reviewed.
- What must NOT happen is a committed prose handover. That was tried and ruled
  against, and this entry does not reopen it.

THE OWNER NAMED THIS DIRECTLY, 2026-08-19: "the notes, they are local, they
stay with this container, the debt does not. So that's why we need to work the
findings into something that travels over git."
