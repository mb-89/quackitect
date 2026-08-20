---
form: find_by_heuristic
by: agent
signed_off: 2026-08-19T11:23:22.729Z
authors: agent
files:
---

# Evidence form / find_by_heuristic

## current_situation

Four finders (prior art, contradiction, analogy, without) are recorded. This is the heuristics catalogue, run whole against every touched cluster.

## applies

yes

## sweep

| heuristic | cluster | what_it_suggests |
| --- | --- | --- |
| Group what changes together; separate what changes apart | identify-the-harness | already grouped: harness profile and payload sizing change together on one flow |
| Group what changes together; separate what changes apart | hold-the-session-through-work | nothing |
| Group what changes together; separate what changes apart | name-the-stopping-layer | nothing |
| Group what changes together; separate what changes apart | route-a-failure-shape | nothing |
| Group what changes together; separate what changes apart | tolerate-old-test-records | nothing |
| Make the common case cheap; make the rare case possible | identify-the-harness | nothing beyond the existing bound design |
| Make the common case cheap; make the rare case possible | hold-the-session-through-work | nothing |
| Make the common case cheap; make the rare case possible | name-the-stopping-layer | already the design: zero cost on a normal call, diagnostic cost only on an interrupted one |
| Make the common case cheap; make the rare case possible | route-a-failure-shape | nothing |
| Make the common case cheap; make the rare case possible | tolerate-old-test-records | nothing |
| One source of truth; everything else derives | identify-the-harness | nothing |
| One source of truth; everything else derives | hold-the-session-through-work | nothing |
| One source of truth; everything else derives | name-the-stopping-layer | nothing |
| One source of truth; everything else derives | route-a-failure-shape | the call log stays the one source; classification derives from it rather than duplicating occurrences |
| One source of truth; everything else derives | tolerate-old-test-records | the test record file stays the one source; boot keeps no parallel synthesized copy |
| Push decisions to the last responsible moment | identify-the-harness | nothing |
| Push decisions to the last responsible moment | hold-the-session-through-work | confirms the design: the block is re-derived from the machine's current state at the moment of the stop event, never cached in advance |
| Push decisions to the last responsible moment | name-the-stopping-layer | nothing |
| Push decisions to the last responsible moment | route-a-failure-shape | nothing |
| Push decisions to the last responsible moment | tolerate-old-test-records | nothing |
| Make the illegal unrepresentable, not merely checked | identify-the-harness | opt-closed-harness-type-with-explicit-unknown |
| Make the illegal unrepresentable, not merely checked | hold-the-session-through-work | nothing |
| Make the illegal unrepresentable, not merely checked | name-the-stopping-layer | nothing |
| Make the illegal unrepresentable, not merely checked | route-a-failure-shape | nothing |
| Make the illegal unrepresentable, not merely checked | tolerate-old-test-records | nothing |
| Small interfaces between big parts beat the reverse | identify-the-harness | nothing |
| Small interfaces between big parts beat the reverse | hold-the-session-through-work | nothing |
| Small interfaces between big parts beat the reverse | name-the-stopping-layer | nothing |
| Small interfaces between big parts beat the reverse | route-a-failure-shape | already one small flow (flow-failure-disposition) into keep-the-record |
| Small interfaces between big parts beat the reverse | tolerate-old-test-records | nothing |
| If it must be remembered, it must be recorded | identify-the-harness | nothing |
| If it must be remembered, it must be recorded | hold-the-session-through-work | nothing |
| If it must be remembered, it must be recorded | name-the-stopping-layer | opt-attach-diagnosis-to-the-call-log-record |
| If it must be remembered, it must be recorded | route-a-failure-shape | nothing |
| If it must be remembered, it must be recorded | tolerate-old-test-records | nothing |
| The default should be the safe thing | identify-the-harness | nothing |
| The default should be the safe thing | hold-the-session-through-work | confirms the design: uncertain-whether-work-remains defaults to blocking the stop, not allowing it |
| The default should be the safe thing | name-the-stopping-layer | nothing |
| The default should be the safe thing | route-a-failure-shape | nothing |
| The default should be the safe thing | tolerate-old-test-records | nothing |

## options

- opt-closed-harness-type-with-explicit-unknown
- opt-attach-diagnosis-to-the-call-log-record

## follow_up

The transform/SCAMPER finder and probing run next, then enumeration converges on a morphological chart.

## anything_else

