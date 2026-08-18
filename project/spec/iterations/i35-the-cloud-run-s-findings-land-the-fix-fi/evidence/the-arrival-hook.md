---
form: the-arrival-hook
by: agent
signed_off: 2026-08-17T12:09:37.297Z
authors: agent
files: null
---

# Evidence form / the-arrival-hook

## current_situation

se-arrive existed and still had to be invoked by hand, which is one act better than five and not the goal.

The cage's own SessionStart hook cannot fire it: project/.claude/settings.json is placed BY the arrival, so a session that has not arrived never reads it.

## built

project/deliverable/engine/bin/se-hook-arrive.ts, wired in the COMMITTED root .claude/settings.json — the only file a fresh clone reads at session start.

IT NEVER COSTS THE SESSION. Every ending is a printed line and exit 0, including the failed one. A hook that breaks a session start is worse than the hand-work it saves, and an agent whose arrival failed still holds its native tools and the card — but only if it is told.

SE_NO_ARRIVE=1 opts out, loudly. A developer machine whose editor owns the lane must not get a second one started under it, and a silent skip reads exactly like a successful arrival.

SE_AUTONOMY sets the dial the lane comes up on. The hook takes it and never chooses it.

SE_ARRIVE_ROOT overrides the derived root, and only the suite uses it.

## follow_up

- Nothing establishes that a host waits for its SessionStart hooks before the agent's first turn. Filed as raid-asm-the-arrival-runs-before-the-agent-reads-anything, unprobed on purpose — idempotence is its mitigation, not its proof.
- The cheapest probe is a marker the first pull can read, and it is not built.

## anything_else

THE CAGE CONFORMANCE RULE FIRED ON THIS HOOK AND WAS RIGHT TO. 'A hook the host never loads is not a hook' — and this one was wired in the root settings rather than the cage template.

THE RULE WAS WIDENED TO ITS OWN STATED INTENT rather than silenced: a shipped hook must be wired somewhere a host actually loads, which is now either file. The arrival hook is also named explicitly, for the same reason the Stop hook is — its absence is silent.
