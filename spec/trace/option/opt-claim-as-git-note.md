---
minted_in: i2
id: opt-claim-as-git-note
type: "[[option]]"
statement: the claim is a git note attached to the seed stub's own commit, in a pushed notes ref
cluster: cluster-the-record-life
found_by: prior-art
source: git notes - metadata attached to commits without touching them; used by Gerrit review-notes and kernel patch tracking
---

## Mechanism

git notes attach data to the stub commit itself, so the claim travels
WITH the thing claimed. The notes ref pushes like a branch and races
the same way.

WHAT IT COSTS HERE: notes MERGE when they collide - git notes merge
strategies exist precisely because two writers edit one notes tree -
which reintroduces the conflict the one-file-per-iteration shape
designs away. Notes are also near-invisible in github's UI.
