---
minted_in: i62-background-work-reports-its-own-end-the-
id: req-registering-a-spawned-hand-is-accepted-wherever-the-walk-stands
type: "[[requirement]]"
statement: When a driving agent records that it has started a hand, the product shall accept that record in every state, and shall widen nothing else the same verb carries.
kind: functional
verify_method: test
measure: "states where the registration is refused: zero. Other arguments of the same verb that become legal in a state that did not already allow them: zero."
breaks_if_removed: The registration is refused exactly where a hand was just spawned, which is the only place it is ever needed, so the account is wrong about a hand that genuinely exists.
breaks_how_badly: corrosive
priority: should
refines:
  - uc-let-the-machine-name-the-driver
source_refs:
  - raid-risk-widening-a-verb-s-legality-weakens-the-state-gate
  - vp-autonomy-range
---

## Detail

A HAND THAT WAS STARTED IS A FACT ABOUT THE WORLD. Refusing to record a fact
does not make it untrue; it makes the account wrong, and the account is what a
person reads to see whether the run is working.

THE WIDENING IS PER ARGUMENT, NOT PER VERB.

| what becomes legal everywhere | what does not |
| --- | --- |
| recording that a hand was started | running a shell command |
| closing a hand that has finished | listing or inspecting jobs |
|  | acknowledging settled work |

WHY THE NARROWNESS IS PART OF THE DEMAND. The state gate's whole value is that
a tool being illegal where you stand means the product holds that job
elsewhere. A verb that is legal everywhere teaches the walk to reach for it,
and every power it carries becomes ambient.

WHERE LEGALITY CANNOT BE EXPRESSED PER ARGUMENT, the honest answer is a
separate verb for registration rather than a wider one for everything. That
choice belongs to the design, and this row does not pre-empt it: it names the
outcome, not the mechanism.

NO BEHAVIOUR MODEL HERE. One condition, one response, with the scope of the
widening in the table.
