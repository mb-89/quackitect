---
id: opt-unrepresentable-not-checked
type: "[[option]]"
statement: make an illegal act impossible to express rather than refusing it when somebody expresses it
cluster: cluster-the-walk
found_by: heuristic
source: "heuristic — make the illegal unrepresentable, not merely checked"
---

## Mechanism

THE RULE BIT HARDEST HERE. This system's defences are almost all CHECKS. A
call arrives, a clause refuses it, and a remedy is handed back. That is good
behaviour and it is the second-best shape.

Three live examples where the illegal is representable and merely refused.

- SE-C-134 refuses a method write from inside a record. The write is
  expressible; the file is right there. Making it unrepresentable is
  opt-worktree-holds-only-the-record, where the shared file is not in the
  tree at all.
- SE-C-129 refuses a shell command doing a lane tool's job, after one warned
  run. The command is expressible.
- The archive is read-only by a rule that refuses every edit. A checked-out
  copy at a committed ref would be read-only because git says so.

WHAT IT WOULD COST. Every one of these trades a clear refusal for an absence,
and an absence teaches nothing. SE-C-134's refusal carries a remedy the agent
follows in one turn; a missing file just fails. So the rule is not free here,
and a candidate taking it must pair each unrepresentable act with a way to
say why the thing is not there.
