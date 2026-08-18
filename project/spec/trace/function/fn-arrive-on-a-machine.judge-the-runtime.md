---
minted_in: i35-the-cloud-run-s-findings-land-the-fix-fi
id: fn-arrive-on-a-machine.judge-the-runtime
type: "[[function]]"
cluster: the-arrival
statement: judge the running runtime against the floor the project declares
satisfies:
  - req-the-declared-runtime-floor-is-read-never-edited
inputs:
  - flow-arrival-request
outputs:
  - flow-runtime-verdict
---

## Rationale

The engine spawns every script as `node <file>.ts` with no flag, so the runtime is a hard precondition rather than a preference. Judging it early turns a syntax error deep in a spawned script into one sentence naming two versions.

IT JUDGES AND NEVER ADJUSTS. Editing the declaration to pass would turn a loud failure into a silent one, which is req-the-declared-runtime-floor-is-read-never-edited.
