---
minted_in: i37-training-iterations-a-disposable-iterati
id: opt-the-ceiling-rests-on-the-ancestry-primitive-git-already-answers
type: "[[option]]"
found_by: probe
statement: "The boundary test is delegated to the version control system's own ancestry answer rather than reimplemented, so it is exact by construction."
source: "PROBE run 2026-08-19 \u2014 git merge-base --is-ancestor against the i33 rewind point, both directions"
---

## What the probe showed

RUN 2026-08-19, two calls.

- `git merge-base --is-ancestor 20abd831 HEAD` exits **0**.
- The same test reversed exits **1**.

The primitive is exact, cheap and already installed.

## The finding that came with it, and it is the useful half

`merge-base` IS NOT ON `se_git`'S ALLOWLIST. The allowlist holds status, log,
diff, show, add, commit, fetch, branch, rev-parse, restore, merge and checkout.

So the ceiling's natural implementation verb is unreachable through the lane
today. Either the allowlist grows by one, or the ancestry answer is derived
from `log` or `rev-parse`, which is more code for a worse answer.

## What it faked

The probe ran the primitive through `se_run` under a declared
`no_tool_reason`, not through the lane. It shows the ANSWER is obtainable; it
does not show the lane can obtain it.

## Mechanism

One ancestry call per resolved commit or ref while a run is bound, with the
verb added to the git lane.
