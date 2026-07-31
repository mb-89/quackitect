---
kind: matrix-row
name: draft-vision
statement: "Draft the vision packet: the big idea, the to-be world, the goal system, the Moore pitch."
state_kind: work
filled_by: agent
depends_on:
  - gate-kickoff
legal_tools:
  - se_file_read
  - se_file_write
  - se_file_patch
  - se_file_search
  - se_file_glob
  - se_file_list
  - se_log_query
  - se_answer
  - se_web_search
  - se_web_fetch
evidence:
  - name: big_idea
    description: "one breath, standalone-readable, lineage named"
  - name: to_be_world
    description: "who does what in the to-be world, alive"
  - name: goal_system
    description: "goals, conflicts named openly, priority order ruled"
  - name: moore_pitch
    description: "all five slots filled"
---

## Guidance

Vision FIRST - it is the stop-or-continue filter; if the vision alone is not interesting, nothing downstream matters. The big idea in one breath, lineage named. The to-be world alive, not abstract. The goal system with conflicts named openly ([[meth-goal-system]]). Close with the pitch ([[meth-moore-pitch]]). The vision is axiomatic: nothing derives it; the gate adjudicates whether it is worth having.

INHERIT where possible: if this iteration reuses an existing design and does not deviate from the resident vision, satisfy this state with a pointer plus the delta - do not re-derive the axiom.
