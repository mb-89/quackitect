---
minted_in: i9-se-and-the-corpus-move-the-machine-state
id: opt-exclude-at-the-packaging-boundary-and-prove-it
type: "[[option]]"
statement: Let the machine-state folder sit inside the tree for whoever is working in it, and have every act that produces a copy exclude it by name, with a test that packages a tree and asserts it is absent.
cluster: the-bootstrap
question: how a produced copy withholds the machine state
found_by: contradiction
source: TRIZ separation IN RELATION, on improving 33 Ease of operation against degrading 23 Loss of substance
---

## Mechanism

TWO OBSERVERS, ONE FOLDER. The person working in the tree sees the machine
state and can read it. Everything that produces a copy — packaging, vendoring,
producing a project — does not.

THE CONTRADICTION IT DISSOLVES. Moving the folder inside the product is what
makes it readable, and it is also what makes it shippable. Both demands were
assumed to apply to one view of the tree, and they never did: they belong to
different readers.

WHAT IT COSTS HERE. The exclusion becomes a written rule that somebody must
remember, where it used to be geometry that could not be forgotten. Before the
collapse, forgetting cost nothing. After it, forgetting ships the call log.

THE DEFAULT FLIPS FROM SAFE TO UNSAFE, and that is the whole reason this
option carries a test rather than a rule alone. A packager that changes
nothing now includes the folder by default rather than by mistake.

TWO PATHS NEED IT SEPARATELY. A packaged copy and a vendored copy are produced
by different code, and fixing one proves nothing about the other.

## A probe ran both claims above and neither survived intact

PROBE P3 AT M4, 2026-08-19. It ran the engine's own `travels` filter against
the folder at both depths, and then looked at which producing paths share it.

THE DEPTH DOES NOT MATTER TO THE PRODUCING ACTS. `travels` withholds `.se`
wherever it appears, because `produce.ts` line 93 tests every path segment
against a set of names. Measured: `.se/calls.jsonl` and `.se/calls.jsonl`
both come back withheld, and so does one inside a nested worktree. Files that
must travel came back travelling in the same run, so the answer is informative
rather than a filter that refuses everything.

THE TWO PATHS ALREADY SHARE ONE LIST. `engine/bin/package.ts` imports `travels`
from `produce.ts`. The comment above that list records that they were two lists,
that the difference was 20.8 MB of release archives travelling into every
vehicle, and that they were merged.

SO THE LIVE RISK IS NARROWER AND IT IS ELSEWHERE. It sits in version control.
`.gitignore` line 2 ignores `.se/` wholesale today, which is safe and is exactly
what this iteration intends to change. The moment the folder becomes tracked,
what is committed is decided by that file and by nothing this option describes.

THIS OPTION IS NOT WITHDRAWN BY THE PROBE. The rule and its test are still worth
having, because a producing act added later inherits nothing. What changed is
the urgency and the place: the argument for it is no longer that today's default
flipped, because it did not.

WHAT WOULD LEAK IF IT IS MISSED. The raw call log, which holds every lane call
with its arguments, and the raw note file, which a standing rule keeps out of
version control entirely because it may carry anything.
