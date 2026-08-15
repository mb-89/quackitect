---
minted_in: i1
id: uc-browse-the-archive
type: "[[use-case]]"
statement: Read a finished record as it stood, without disturbing anything running now.
actor: stk-engineer-driving-agents
trigger: a question about how something was decided in a record that has closed
precondition: the record is closed and archived
guarantee: the record is readable exactly as it finished, and nothing live was touched
refines:
  - sty-look-at-a-closed-record
priority: should
---

## Main scenario

1. The person opens the archive, which holds every closed record and no live one.
2. They pick the record the question belongs to.
3. Its states are drawn as they finished — which passed, which were struck, where the walk went.
4. They open a state and read its evidence form as it was filled.
5. A gate additionally shows its rounds, its verdict, and the hand that blessed it with the day.

## Lane doors

A past version of the repository is read at a committed `ref`, without
checking it out. Three verbs take one:

- `se_file_read`
- `se_file_search`
- `se_file_glob`

## Extensions

- 1a. Browsing is attempted by an agent. The archive sits above every autonomy setting, so only a person's own hand opens it — there is nothing for an agent to do in a closed record.
- 3a. A state was struck by the record's change size rather than walked. It is drawn as struck, with the column that struck it, rather than omitted.
- 4a. An edit is attempted. The archive is read-only and says so; a finished record is evidence, and evidence that can be edited is not evidence.
- 5a. The gate carries a suspect mark from an input that moved after the bless. The mark and its reason are shown with the bless rather than instead of it.
