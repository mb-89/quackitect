---
minted_in: i5-engine-hygiene-one-version-source-every-
id: req-the-actor-is-recorded-where-the-call-is-served
type: "[[requirement]]"
statement: Where a reader draws the acting role of a recorded act, it shall take that role from the record, and shall not derive it from the act's tool name.
kind: quality
characteristic: maintainability
verify_method: test
breaks_if_removed: Every reader re-derives the actor from a string prefix, so a new server-side tool reads as a person until somebody edits a hand-kept list, and nothing says the column is a guess.
breaks_how_badly: corrosive
measure: 0 readers deriving the role from a tool name, for records that carry one.
refines:
  - uc-trace-a-decision-to-its-origin
  - uc-act-on-a-control-and-know-what-it-did
source_refs:
  - 'engine/render.ts: srcOf returns tool.startsWith("mirror_") ? "human" : "agent"'
  - "engine/render.ts: SELF_SERVED is a hand-kept set of three tool names"
  - "i34 retro: the derived actor was wrong for 52 records in one measured window"
priority: should
weighs_with:
  - req-acts-carry-role-and-channel — the same axis, accountability of a recorded act, split by who is responsible for the truth
---

## Scenario

SOURCE. Anybody reading a surface that shows who acted — the owner
adjudicating, a maintainer auditing the feed, an agent checking the trail.

STIMULUS. A recorded act is drawn, and the surface must say which role made
it.

ENVIRONMENT. A live feed carrying a mix of acts: lane calls, control presses,
and the server's own polls. New server-side tools have been added since the
reader was last edited.

ARTIFACT. Every reader that draws an acting role.

RESPONSE. The role shown is the one on the record. Nothing infers it from the
act's tool name where the record carries one.

RESPONSE MEASURE. Zero readers deriving the role from a tool name, for records
that carry one.

## Detail

THIS ROW IS THE READER'S HALF. The writer's half is
req-acts-carry-role-and-channel, which demands that a recorded act carries the
acting role. This row demands that nothing downstream invents one.

WHY THEY ARE TWO ROWS AND NOT ONE. They verify differently, which is the
method's own split rule.

| row | what is inspected | how it fails |
| --- | --- | --- |
| the stamping half | a written record | the field is absent |
| this row | every reader of that record | the field is present and ignored |

A STAMP THAT NOTHING READS IS NOT ACCOUNTABILITY. The record could carry a
perfect role on every act while the surface a person actually looks at still
paints a guess, and the stamping row would still pass.

THE FALLBACK IS NOT FORBIDDEN, and the statement is worded to allow it. A
record written before a stamp existed carries no role, and a reader may fall
back for exactly those. What is forbidden is deriving a role for a record that
HAS one.

| role | what it means |
| --- | --- |
| human | a person acted through a surface |
| agent | the driving agent called the lane |
| ui | the server acted on its own behalf, such as a poll |

## Behaviour

None wanted. One condition, one prohibition, with no order between anything.
