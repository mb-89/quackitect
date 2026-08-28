---
minted_in: i4-the-panel-round-the-archived-iteration-b
id: raid-a-hand-with-no-role-recorded-is-a-walker
type: "[[raid]]"
kind: issue
statement: A registered hand carrying no role is counted as a walker, and reviewers are registered with no role, so a reviewer counts against a ceiling it was ruled to sit outside of.
owner: the owner
trigger: a reviewer or a researcher registered without a role, which would then be counted against a ceiling it was ruled to sit outside of
status: open
probe: false — the probe ran and the assumption did not survive. 10 of 12 registered hands carry no role, and one of them is a reviewer.
probed: 2026-08-23
impact: A reviewer counted as a walker can push the count over a ceiling of zero and refuse the spawn state, blocking a walk that broke no rule. The refusal names walkers, so the reader looks for a walker that is not there.
breaks_how_badly: abrasive
how_likely: plausible
source_refs:
  - deliverable/engine/bin/hands-spawned.ts, the running-and-walker filter
  - deliverable/engine/tools-run.ts, roleAsked
  - "owner ruling 2026-08-23: only walkers count towards the number"
place: i64-the-diamond-and-the-orchestrator-handove
---

NOT ESTABLISHED. The default exists so that hands registered before the role
argument existed still count. Nobody checked whether anything registers
without a role today.

NOT CONTROLLED. The role rides the registering call, and the registering call
is made by whichever hand did the spawning. A hand that forgets the argument
gets the default.

WHY THE DEFAULT LEANS THE WRONG WAY. It counts an unknown hand as the one kind
that is capped. The safer default counts it as the kind that is not, and lets
the ceiling be exceeded rather than a legal walk refused.

THAT IS A DESIGN QUESTION AND NOT THIS NODE'S TO SETTLE. It is written here so
the question exists.

## Probe

READ THE REGISTRY AND COUNT.

- List every hand in the job registry.
- Count how many carry no role.
- Of those, name any that were in fact a reviewer or a researcher.

THE PROBE PASSES when no roleless hand turns out to have been anything but a
walker. It is a read over one folder and costs seconds.

## Probe result, 2026-08-23

IT RAN AND IT FAILED. The assumption is false, so this node is now an issue.

TWELVE AGENT JOBS STAND IN THE REGISTRY. Ten of them carry no role at all.
Only two carry one: a walker and a researcher.

ONE OF THE TEN IS A REVIEWER. Its own description says so in as many words:
"reviewer M1: judge the motivation gate cold". Nothing else about the row says
reviewer, so the ceiling check reads it as a walker.

WHAT THAT MEANS IN PRACTICE. With the ceiling at zero, a reviewer doing
exactly what the gate method asks for would push the count to one and refuse
the spawn state. The refusal names walkers, so the reader looks for a walker
that does not exist.

WHY IT WAS NOT SEEN. The role argument was added the same day the ceiling
learned to ignore reviewers. Everything registered before that has no role,
and nothing backfills.

WHAT RESTS ON IT. The walker ceiling, which the owner set to zero by default
on 2026-08-23. Any record whose spawn state runs against the current registry
will count these ten.

WHAT WOULD FIX IT. Two candidates, and neither is settled here.

- Flip the default so an unknown hand is NOT counted, letting the ceiling be
  exceeded rather than a legal walk refused.
- Require the role on registration and refuse without it, which makes the gap
  impossible but breaks every already-registered row.
