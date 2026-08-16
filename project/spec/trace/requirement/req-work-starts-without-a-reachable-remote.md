---
minted_in: i28-the-cloud-runs-from-its-seed-alone-a-fre
id: req-work-starts-without-a-reachable-remote
type: "[[requirement]]"
statement: If the remote cannot be reached, then the engine shall list iterations from local refs and shall enter one, recording on the walk that the claim did not land.
kind: functional
characteristic: reliability
verify_method: test
breaks_if_removed: A machine off the network is told there is no work, which removes a capability the folders on disk provide today.
breaks_how_badly: corrosive
refines:
  - uc-start-an-unattended-machine
source_refs:
  - uc-start-an-unattended-machine ext 4a
  - uc-start-an-unattended-machine ext 5b
  - raid-no-iterations-are-visible-without-a-reachable-remote
priority: must
---

## Detail

TWO ACTS, TWO ANSWERS, and conflating them is what made the first version of
this demand wrong.

| act | needs the remote | offline behaviour |
| --- | --- | --- |
| listing what exists | no | answered from local refs, unchanged |
| entering an iteration | no | proceeds |
| recording the claim | yes | warns, and the walk continues unclaimed |

THE DESYNC RISK IS ACCEPTED KNOWINGLY, by owner ruling. Two machines may enter
the same iteration while one is offline. That cost is taken so that work is
never blocked by a network.

THE WARNING IS NOT A REFUSAL. It says the iteration is unclaimed and another
machine may take it. It does not stop the walk, and it does not pretend the
claim landed.

AND THE LIST SAYS HOW OLD IT IS. Where the last fetch is old, the answer says
when the remote was last heard from rather than presenting a possibly stale
list as complete.

## Where the earlier answer went wrong

The M1 pressure test found the offline case and answered that entering was
impossible. That contradicted a ruling settled before this iteration opened.
The finding underneath is recorded on the M1 gate: a pressure test that folds a
discovery upstream never checks whether the discovery contradicts a standing
decision, and nothing in the method asks it to.
