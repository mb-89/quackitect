---
minted_in: i36
id: opt-exit-code-blocks-the-stop-event-until-cleared
type: "[[option]]"
statement: Give the walk's own stop event a blocking decision a hook can return, so the session continues until the hook itself says otherwise, rather than a host-side timer or a fixed retry count.
cluster: cluster-the-walk
found_by: prior-art
source: "Claude Code hooks reference, Exit code 2 behavior per event: the Stop event 'Prevents Claude from stopping, continues the conversation' on a blocking exit code. https://docs.claude.com/en/docs/claude-code/hooks"
---

## Mechanism

Claude Code already ships a named Stop event with a blocking decision: a
hook can refuse the stop outright, and the session keeps going.

WHAT SURVIVES THE TRANSFER. The shape hold-the-session-through-work needs:
a stop is a DECISION POINT a hook can veto, not a foregone conclusion the
walk has to race against.

WHAT DOES NOT. The vendor page documents no override ceiling on how many
times a hook may block one stop event; this project's own live testing
found the hook stops enforcing after eight consecutive blocks
(scope-non-goals.md), which is harness behaviour outside anything the
primary source states and is carried as its own finding rather than
projected from the vendor doc.
