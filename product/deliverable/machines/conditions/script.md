---
condition: script
---

# script — the named script runs and exits 0

Arguments: the script (root-relative path) the engine runs. Exit code 0
satisfies the condition; anything else refuses, with the script's output in
the refusal.

The STATE declares what runs — the engine only knows how to run scripts.
How to satisfy it: trigger a run (the mirror's run button, or a tick
attempt) and fix whatever the output names. The result is engine-observed
evidence; nobody can claim it.
