---
minted_in: i1
id: uc-land-work-on-trunk
type: "[[use-case]]"
statement: Move a record's finished work onto the trunk, with the checks it owes run rather than assumed.
actor: stk-engineer-driving-agents
trigger: a record's work is finished
precondition: the record's states are filled, and its worktree holds the work
guarantee: the work is on trunk in one piece, with a green battery and a person's bless behind it
refines:
  - sty-land-the-work
priority: should
---

## Main scenario

1. The walk is aimed at landing.
2. It stops at the land gate.
3. The full battery runs here, and its verdict is a field on the form rather than a claim about one.
4. The gate's rounds are filled from what the run and the artifacts actually show.
5. The person reads the form, opens some of what it points at, and blesses it.
6. The work lands on trunk in one piece and the worktree goes.

## Lane doors

- `se_git_sync` keeps the record and trunk in step mid-iteration, long before anything lands.
- `se_git_land` is the landing itself, behind the release gate.
- `se_git` runs the allowlisted git verbs. The push stays with the person.

## Extensions

- 3a. Tests are red. The walk does not advance, nothing is marked known-broken, and each red is understood and fixed properly.
- 3b. The battery was run recently and nothing changed since. It still runs — this is the one place it is earned.
- 5a. The person rejects. The work stays in the worktree and the gate names what to redo.
- 6a. The trunk moved while the record was open and the two conflict. The land refuses and names the conflicting files rather than merging silently.
- 6b. The record's expedition stays open after the land. Landing does not need a close, so a day's bundle keeps collecting.
