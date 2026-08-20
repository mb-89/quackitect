---
minted_in: i36
id: tsp-stop-hook-yields-only-at-a-machine-stop
type: "[[test-spec]]"
statement: While the walk holds executable unblocked work the stop hook refuses to let the session end, and it yields only when the machine itself reports a wait, a blocker or a reached target.
method: "test"
verifies:
  - "req-stop-hook-yields-only-at-a-machine-stop"
files:
  - tests/stophook.test.ts
---

## Scope

The stop hook's decision, on every supported harness stop event. One question,
asked of the machine rather than of the agent.

- WORK STANDING, unblocked, above nothing. The hook blocks.
- THE MACHINE'S OWN STOP. A wait with no target, a blocker, a reached target.
  The hook yields.

The four stop-at notches are part of the scope, because each moves where the
line sits without changing who draws it.

WHAT IS DELIBERATELY OUT. Whether the agent SHOULD stop. The hook reads the
machine's last answer; it never forms an opinion of its own.

## Approach

DESIGN METHOD: a decision table, and it is already built. The axes are the
machine's last reported instruction, whether a target stands, and which
stop-at notch is set.

Robustness cases carry unusual weight here, because the hook reads a log that
another process writes. A truncated record, a string-encoded record and a
missing log are all real, and all three must fail SAFE — which for this hook
means yielding only where the machine genuinely stopped.

LEVEL: component. The hook is a script reading a log, and both are reachable
without a host.

DEPTH: high. Losing the hook is silent. The session simply ends early, the
work in flight is dropped, and nothing reports that anything went wrong.

## Steps

Every case in `tests/stophook.test.ts` is one step. Twenty cases stand there
today, and this requirement is GREEN.

The decision itself.

- A walk standing mid-work blocks the stop, and the reason names the state.
- The machine's own wait passes — idle, the desk, or a step above the slider.
- The desk with nothing routed passes, whatever the pull called it.
- The desk WITH a target set still blocks, because a routed goal is a standing
  instruction.
- A wait with a target blocks; an escape does not launder a stop.
- A wait with an empty or whitespace target passes, because blank is blank.

The four notches.

- Stop at state end passes every stop, because the engine is the one holding.
- Stop at agent judgement is the default and blocks mid-work.
- Stop at bless passes at a gate and blocks anywhere else.
- Stop at blockers only passes a refused pull and blocks a working one.

The valve, so a blocking question can still be asked.

- A targeted wait already blocked once passes.
- A stop already blocked once passes.

Reading a log somebody else wrote.

- No pull on record passes, because the engine never ran here.
- An absent log passes rather than breaking the turn.
- A string-encoded response still parses, and newer non-pull records are
  skipped.
- A response stored as a whole string still blocks.
- A response stored truncated still blocks, because the hook must not need the
  whole answer.
- A truncated wait with no target still passes, so the fix does not make the
  hook bite the machine's own stop.
- A truncated wait with a target still blocks.

## Why this spec claims green and the requirement still matters

Twenty cases is unusual coverage, and it exists because this hook has been
wrong before in both directions — blocking the machine's own stop, and
yielding while work stood.

The requirement's measure is a rate across every supported harness. What the
file proves is the DECISION, once, for every input shape. What it does not
prove is that each harness delivers its stop event to the hook at all, and
that gap belongs to the harness-contract requirement rather than to this one.
