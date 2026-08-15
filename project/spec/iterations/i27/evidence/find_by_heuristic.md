---
form: find_by_heuristic
by: agent
signed_off: 2026-08-14T07:05:14.716Z
authors: agent
files:
---

# Evidence form / find_by_heuristic

## current_situation

EIGHT RULES AGAINST FIVE CLUSTERS IS FORTY CELLS, and the whole grid is below. Thirty-two of them say `nothing`.

THAT RATIO IS THE POINT OF WRITING THE MISSES. A sweep reporting eight hits reads identically whether it ran forty checks or eight, and only one of those is a search.

EIGHT RULES BIT, all on cluster-the-walk, and that concentration is itself a finding: this change is entirely a structural question about one cluster, which is exactly what partition-functions concluded from the other direction.

THREE OPTIONS ARE NEW. The other five rules landed on mechanisms already minted by prior art, contradiction or analogy, and are recorded as confirmations rather than duplicates.

ONE PAIR OF RULES CONTRADICTS ITSELF HERE, and that is the most useful thing this sweep produced.

## applies

yes

## sweep

| heuristic | cluster | what_it_suggests |
| --- | --- | --- |
| Group what changes together; separate what changes apart. | cluster-the-walk | The record's own content and the shared method change on different clocks, so the tree should be split by CHANGE RATE rather than by ownership. That is raid-dec-thin-tree reached from a rule instead of from a decision. |
| Group what changes together; separate what changes apart. | cluster-the-record-life | nothing |
| Group what changes together; separate what changes apart. | cluster-the-account | nothing |
| Group what changes together; separate what changes apart. | cluster-the-holding-pen | nothing |
| Group what changes together; separate what changes apart. | cluster-the-bootstrap | nothing |
| Make the common case cheap; make the rare case possible. | cluster-the-walk | An unqualified path means the bound record and costs nothing; anything else names its tree explicitly, as ref and @name already do. New option. |
| Make the common case cheap; make the rare case possible. | cluster-the-record-life | nothing |
| Make the common case cheap; make the rare case possible. | cluster-the-account | nothing |
| Make the common case cheap; make the rare case possible. | cluster-the-holding-pen | nothing |
| Make the common case cheap; make the rare case possible. | cluster-the-bootstrap | nothing |
| One source of truth; everything else derives. | cluster-the-walk | The bound record is the single source of which tree is meant, and every later path derives from it rather than re-deciding. Confirms opt-mark-the-tree-at-bind-while-intent-is-still-known. |
| One source of truth; everything else derives. | cluster-the-record-life | nothing |
| One source of truth; everything else derives. | cluster-the-account | nothing |
| One source of truth; everything else derives. | cluster-the-holding-pen | nothing |
| One source of truth; everything else derives. | cluster-the-bootstrap | nothing |
| Push decisions to the last responsible moment. | cluster-the-walk | Resolve at the WRITE, where the full context stands, rather than at bind. This CONTRADICTS the rule above, and the contradiction is real rather than a wording slip. |
| Push decisions to the last responsible moment. | cluster-the-record-life | nothing |
| Push decisions to the last responsible moment. | cluster-the-account | nothing |
| Push decisions to the last responsible moment. | cluster-the-holding-pen | nothing |
| Push decisions to the last responsible moment. | cluster-the-bootstrap | nothing |
| Make the illegal unrepresentable, not merely checked. | cluster-the-walk | A path naming another tree should not be expressible, not merely refused. Confirms opt-confine-the-root-to-the-bound-tree, and it is the same argument the capability literature makes against the access-list shape. |
| Make the illegal unrepresentable, not merely checked. | cluster-the-record-life | nothing |
| Make the illegal unrepresentable, not merely checked. | cluster-the-account | nothing |
| Make the illegal unrepresentable, not merely checked. | cluster-the-holding-pen | nothing |
| Make the illegal unrepresentable, not merely checked. | cluster-the-bootstrap | nothing |
| Small interfaces between big parts beat the reverse. | cluster-the-walk | One resolver every verb calls and none may bypass, rather than a rule per tool. New option, and it is what SE-C-134 fails to be. |
| Small interfaces between big parts beat the reverse. | cluster-the-record-life | nothing |
| Small interfaces between big parts beat the reverse. | cluster-the-account | nothing |
| Small interfaces between big parts beat the reverse. | cluster-the-holding-pen | nothing |
| Small interfaces between big parts beat the reverse. | cluster-the-bootstrap | nothing |
| If it must be remembered, it must be recorded. | cluster-the-walk | Which tree was resolved must not live only in the engine's head; it rides on the answer. Confirms opt-name-the-tree-on-the-envelope-not-in-the-body. |
| If it must be remembered, it must be recorded. | cluster-the-record-life | nothing |
| If it must be remembered, it must be recorded. | cluster-the-account | nothing |
| If it must be remembered, it must be recorded. | cluster-the-holding-pen | nothing |
| If it must be remembered, it must be recorded. | cluster-the-bootstrap | nothing |
| The default should be the safe thing. | cluster-the-walk | An undecidable path refuses rather than resolving to whatever the engine happens to hold. New option, and today's default is the unsafe branch. |
| The default should be the safe thing. | cluster-the-record-life | nothing |
| The default should be the safe thing. | cluster-the-account | nothing |
| The default should be the safe thing. | cluster-the-holding-pen | nothing |
| The default should be the safe thing. | cluster-the-bootstrap | nothing |

## options

- project/spec/trace/option/opt-the-common-path-needs-no-tree-the-rare-one-names-it.md
- project/spec/trace/option/opt-one-resolution-seam-not-a-rule-per-tool.md
- project/spec/trace/option/opt-refuse-an-ambiguous-path-by-default.md

## follow_up

TWO RULES IN THE CATALOGUE POINT OPPOSITE WAYS ON THIS CLUSTER, and that is the sweep's most useful output.

ONE SOURCE OF TRUTH says resolve at bind and derive everything after. PUSH DECISIONS TO THE LAST RESPONSIBLE MOMENT says resolve at the write, where the context is complete.

Both are sound rules and they cannot both be followed here. That is not a defect in the catalogue - it is the architecture decision, surfaced by a mechanical pass rather than by argument.

THE ARCHITECTURE MILESTONE OWES A RULING ON IT. The deciding question is which moment holds the CALLER'S INTENT, and the surgical analogy already answers it from another direction: the last responsible moment is the last moment somebody who knows can still confirm, which is bind rather than write.

ONE OPTION IS A PREREQUISITE RATHER THAN A RIVAL. opt-one-resolution-seam-not-a-rule-per-tool is what makes any of the others true. Confinement with a bypass is not confinement, and the i8 field report already measured the bypass being used. build_chart should show it as a floor under the column, not as a cell competing in it.

## anything_else

WHY EVERY HIT LANDED ON ONE CLUSTER, and why that is a result rather than a lazy sweep.

The four other clusters were held against all eight rules and produced nothing. That is honest: this change mints one function, partition-functions showed both its flow ends inside cluster-the-walk, and a rule about grouping or defaults has nothing to say about a cluster the change does not touch.

A SWEEP THAT FOUND SOMETHING EVERYWHERE WOULD BE THE SUSPICIOUS RESULT. Thirty-two `nothing` cells against a change of this shape is what a real pass looks like.

THE CATALOGUE'S OWN RULE ABOUT ITSELF held: it grows by evidence, not by fame. Nothing here wanted a ninth rule.
