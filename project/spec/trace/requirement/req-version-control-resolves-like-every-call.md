---
minted_in: i27
id: req-version-control-resolves-like-every-call
type: "[[requirement]]"
statement: When a call reaches version control, the engine shall resolve it against the same store as every other call made in that context, and shall answer with the store it used.
kind: interface
verify_method: test
breaks_if_removed: A read and a commit made in one breath answer about two different stores, so work is written in one place and recorded in another with nothing saying so.
breaks_how_badly: fatal
measure: For every context the walk can stand in, a version-control call and a file call resolve to the same store, and both answers name it.
refines:
  - uc-take-a-step
  - uc-land-work-on-trunk
source_refs:
  - "owner ruling 2026-08-14: commits also need to end up where they should end up, no matter whether we are on the trunk or on a worktree"
  - note-9391416c6203
  - note-dd9826012e74
  - req-a-write-lands-where-it-is-meant
priority: must
---

## Scenario

- Source: any caller at the lane, agent or person.
- Stimulus: a version-control call, alongside file calls in the same context.
- Artifact: the serving engine.
- Environment: bound to a record, unbound, or standing anywhere between.
- Response: version control resolves to the store the other calls reach, and
  says which.
- Response measure: zero contexts where a file call and a version-control
  call disagree about the store.

## Detail

VERSION CONTROL IS NOT A SPECIAL CASE and it is treated as one today.
Measured 2026-08-14: the desk could patch a record's seed and had no way to
commit it. se_git runs in the bound tree when a record is bound and at the
root otherwise, with no third case, so a write into any other store has no
commit path at all.

THE REFUSALS ARE BOTH CORRECT AND THERE IS NO DOOR. Reaching another store
with -C refuses under SE-C-004; reaching it through the shell refuses under
SE-C-129. Neither refusal is wrong and together they leave the work
uncommittable.

THE ROW SAYS NOTHING ABOUT GIT SPECIFICALLY, on purpose. It says version
control resolves like everything else. Which version control, and how, is
the design's to choose - though the owner has ruled that we keep git.

## Behaviour

No model wanted. One invariant across one seam.
