---
minted_in: i35-the-cloud-run-s-findings-land-the-fix-fi
id: req-one-command-takes-a-fresh-clone-to-a-live-lane
type: "[[requirement]]"
statement: When a session starts on a clone that has no lane, the system shall bring that clone to a caged agent standing on a live lane in one act, requiring no decision from the agent.
kind: functional
verify_method: demonstration
breaks_if_removed: "Every cloud run pays the arrival by hand again. Measured twice, on i15 and i35: most of an hour before the first se_pull, and none of it judgment."
breaks_how_badly: fatal
refines:
  - uc-arrive-on-an-unattended-machine
source_refs:
  - uc-arrive-on-an-unattended-machine main scenario
  - sty-send-an-agent-to-a-cloud-box
  - vp-qualities success criteria
priority: must
---

## Detail

ONE ACT MEANS ONE, and the count is the requirement. The five acts of Arrival A
were each individually simple and the cost was in there being five of them, each
with a way to be got wrong.

WHAT THE ACT COVERS: the refs, the runtime check, the install, the cage, the lane,
and a client the agent can call the lane with. Anything the agent must supply
beyond invoking it fails this requirement.
