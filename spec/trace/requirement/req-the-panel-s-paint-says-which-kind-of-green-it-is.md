---
minted_in: i5-engine-hygiene-one-version-source-every-
id: req-the-panel-s-paint-says-which-kind-of-green-it-is
type: "[[requirement]]"
statement: While the panel draws a state, the engine shall paint submitted, blessed and law-proven as three states a reader can tell apart, and shall paint none of them the same as an unproven claim.
kind: quality
characteristic: interaction-capability
verify_method: test
breaks_if_removed: A reader cannot tell an agent's assertion from a person's thumb or from a check that actually ran, so every green on the panel is worth the least of the three.
breaks_how_badly: corrosive
measure: 3 distinguishable paints asserted, and 0 of them equal to the unproven paint.
refines:
  - uc-watch-the-walk-live
  - uc-adjudicate-a-gate
source_refs:
  - "note-b4544437d0c9: the paint rules want their test pin"
  - "engine/renderstyle.ts: the palette reserves ok, fail and warn as verdict colours"
priority: should
---

## Scenario

SOURCE. Anybody reading the panel — the owner adjudicating a gate, an agent
checking where the walk stands.

STIMULUS. A state has been submitted, blessed, or proven by a check that ran.

ENVIRONMENT. The panel drawn normally, in either theme the palette defines.

ARTIFACT. The panel's state paint.

RESPONSE. The three kinds are drawn differently from each other and from a
claim nothing has proven.

RESPONSE MEASURE. Three distinguishable paints, and none of them equal to the
unproven paint.

## Detail

THE THREE RULES, each already true somewhere in the code and none of them
pinned in one place.

| rule | what it means |
| --- | --- |
| green is submitted | the form was stamped by whoever filled it |
| the thumb is blessed | a person or an authorised agent ruled on it |
| a law-proven green is its own thing | a check ran and passed, which is not the same as somebody saying so |

WHY IT IS ONE ROW AND NOT THREE. All three verify the same way, by inspecting
one rendering, and they fail together the moment two paints collide. The
method's split rule is that detail verifying DIFFERENTLY is a sibling row, and
this detail does not.

CASES EXIST ALREADY in drift.test.ts, reopen.test.ts and claimops.test.ts, and
they cover parts of this. What is missing is one place that says which of the
three are covered, which is why the pin is worth writing even where an
assertion already stands.

## Behaviour

None wanted. Three paints and one prohibition, with no order between them.
