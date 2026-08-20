---
minted_in: i27
id: opt-resolution-varies-with-the-path-kind
type: "[[option]]"
statement: make the resolution rule a function of the path's declared kind, so method, record content, session state and repository-root files each resolve by their own stated rule
cluster: cluster-the-walk
question: what the resolution rule covers
found_by: transform
source: SIT Attribute Dependency, applied to the incumbent — make two attributes vary together that did not
---

## Mechanism

Today one rule tries to serve four different kinds of path and the kind is
never named. This makes the kind explicit and lets the rule depend on it.

- METHOD fans out to every tree, so any tree answers.
- A RECORD'S OWN CONTENT belongs to exactly one tree.
- SESSION STATE lives at the root and belongs to the machine, not to any
  record.
- REPOSITORY-ROOT FILES belong to the root and to no record.

THE FOUR KINDS ARE NOT INVENTED HERE. raid-risk-a-write-lands-in-the-wrong-
tree-silently already names them, and names the seams between them as where
the bug lives. This turns that mitigation into the design rather than into a
test plan bolted on afterwards.

THE MEASURED CASE IT EXPLAINS. On 2026-08-13 a write of the host's settings
file was expected to land in the worktree and landed at the repo root
instead, because the path sits outside the folder the record owns. That was
the wanted outcome, reached by a rule nobody had written down. Under this
option the rule is written down and the outcome is intended.

WHAT IT COSTS. Every path must declare or imply its kind, and a path whose
kind is wrong is misrouted with full confidence. The kinds must therefore be
derivable from the path itself rather than passed by the caller.

WHAT IT PAIRS WITH. A test per kind rather than a test per tool, which the
risk already argues is the right mitigation shape.
