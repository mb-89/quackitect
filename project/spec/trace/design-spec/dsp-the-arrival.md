---
minted_in: i35-the-cloud-run-s-findings-land-the-fix-fi
id: dsp-the-arrival
type: "[[design-spec]]"
statement: the one-act cloud arrival — refs, runtime, install, cage, headless lane and a written client — fired by a session-start hook that can never cost the session
realizes:
  - "el-arrival"
  - "if-arrival-to-walk-engine"
files:
  - "project/deliverable/engine/bin/se-arrive.ts"
  - "project/deliverable/engine/bin/se-hook-arrive.ts"
  - ".claude/settings.json"
---

## The shape

TWO FILES AND A WIRE. `se-arrive.ts` is the act; `se-hook-arrive.ts` is what
fires it without an agent asking; the committed root `.claude/settings.json` is
the only file a fresh clone reads at session start, so it is the only place the
wire can be.

THE CAGE TEMPLATE CANNOT CARRY THIS HOOK, and that is the whole reason the root
settings file is in the design at all. `project/.claude/settings.json` is placed
BY the arrival, so a session that has not arrived yet never reads it.

## The order, and why it is that order

1. REFS, first, because it is the only step that repairs something the clone
   arrived wrong. It also degrades rather than stops: an unreachable remote
   costs `ref:` searches and nothing else.
2. RUNTIME, before anything is installed or spawned. Everything below it runs
   `node <file>.ts` unflagged, so a wrong runtime makes every later failure a
   syntax error deep in a spawned script.
3. INSTALL, because the lane cannot start without it.
4. CAGE, AFTER the runtime check and never before. A cage placed beside a lane
   that never came up is exactly the silent half-arrival this element exists to
   prevent.
5. LANE, headless. An agent that already exists cannot be launched into a lane,
   so the lane is raised beside it.
6. CLIENT, last, because it names the port the lane actually came up on.

## What is NOT here

NO SHARED MODULE WITH `se-start.ts`, and four functions are therefore
implemented twice. That is deliberate for this iteration and filed as
[[raid-iss-two-entrypoints-place-the-cage-and-nothing-compares-them]]: folding
them changes the unattended start path, which deserves its own verification.

NO DIAL DECISION. The arrival takes the autonomy as a parameter and never
chooses it. The dial is the person's, and a script that raised it would be an
agent granting itself autonomy through a file.

## The hook is invoked from wherever the host sets

The hook is invoked from wherever the host sets cwd, so the root is derived
from this file's own location rather than trusted from the environment.
SE_ARRIVE_ROOT OVERRIDES IT, AND ONLY THE SUITE USES IT. Without an override
this hook is untestable in the one way that matters: its own tests would run
the arrival against the REAL repository, place a cage there and start a lane
beside the one the walk is using. That happened on 2026-08-17 — two lanes came
up on one clone and the walk reset — and the case still went green, because it
was checking the exit code of a run against the wrong tree.

## The dial is the owners

THE DIAL IS THE OWNER'S, AND THE DEFAULT IS NOW TACTICAL EVERYWHERE (owner
ruling 2026-08-18). It used to rest at operational, and operational cannot
enter a gate — gate-kickoff is the first gate of every iteration, so an
unattended run stopped at the first milestone every time. That is how the
i15 run and the first half of the i35 run both stopped.

TACTICAL IS EXACTLY ENOUGH AND NO MORE. A gate is the heaviest state inside
an iteration; retros, overhauls and seeding are strategic and stay with the
person. SE_AUTONOMY overrides it, by NAME.
