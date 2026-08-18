---
minted_in: i35-the-cloud-run-s-findings-land-the-fix-fi
id: dsp-the-arrival
type: "[[design-spec]]"
statement: the one-act cloud arrival — refs, runtime, install, cage, headless lane and a written client — fired by a session-start hook that can never cost the session
realizes:
  - el-arrival
files:
  - project/deliverable/engine/bin/se-arrive.ts
  - project/deliverable/engine/bin/se-hook-arrive.ts
  - .claude/settings.json
  - project/deliverable/engine/bin/se-hook-start.ts
  - project/deliverable/engine/pullnotice.ts
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
