---
minted_in: i62-background-work-reports-its-own-end-the-
id: fn-run-a-governed-walk.hold-a-workspace-alone
type: "[[function]]"
cluster: the-record-life
statement: serve a workspace only while no other instance is serving it, and tell any instance that cannot have it why
satisfies:
  - req-one-instance-holds-a-folder-and-its-port
inputs:
  - flow-workspace-hold
outputs:
  - flow-refusal
controls:
  - whether the thing that carries the hold releases itself when its holder dies
source_refs:
  - uc-hold-a-folder-against-a-second-engine
  - raid-risk-two-engines-run-one-folder-and-neither-says-so
  - vp-autonomy-range
---

## Rationale

WHY IT IS A FUNCTION AND NOT A DETAIL OF COMING UP. Bringing a product up is
about reaching a lane that answers. This is about not reaching one twice, and a
design could do either without the other.

IT IS LOAD-BEARING FOR THE ACCOUNT. Settling entries a previous instance left
behind is only safe because one instance serves a workspace. That reasoning is
already relied on and nothing checks it, so this function turns an assumption
into a mechanism.

WHAT KEEPS IT SOLUTION-NEUTRAL. It does not say a network port, a file, or an
operating-system primitive. It says the hold must release itself when its
holder dies, which is a property any of those either has or lacks.

THE CONTROL IS THE WHOLE DESIGN DECISION IN ONE LINE. A hold that outlives its
holder turns a crash into a workspace nobody can start in. That is why the
condition sits here rather than being buried in whichever mechanism gets
chosen.

WHAT IT DOES NOT REACH. Two copies of a project on two machines. There is no
shared thing to hold, and one instance per copy is an assumption in the
register rather than something this function could enforce.
