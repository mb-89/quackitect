---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: req-the-machine-names-a-driver-and-starts-nothing
type: "[[requirement]]"
statement: "The lane shall publish the named driver on the pull and shall start no process on account of it, on any host and in any mode."
kind: constraint
verify_method: inspection
breaks_if_removed: "A lane that starts agents is a lane that acts outside the record on its own judgment, which is the same class of act as pushing and opening records unasked. Once it holds that power every other boundary is a convention."
breaks_how_badly: fatal
refines:
  - uc-let-the-machine-name-the-driver
source_refs:
  - "uc-let-the-machine-name-the-driver step 5"
  - "nbr-the-driver-that-performs-the-spawn"
  - "raid-iss-the-engine-does-spawn-an-agent-and-the-seed-says-it-does-not"
priority: must
---

## Detail

THE ENTRYPOINT MAY AND THE WALK MAY NOT, and the seam is when. `se-start.ts`
starts an agent before any walk exists, and `se-pty.ts` starts one inside a
pseudo-terminal for a person to watch. Neither is a walking state acting on a
computed value.

WHAT THIS FORBIDS is the milestone itself spawning. The value goes outward and
something already listening decides what to do with it.

AND SOMETHING IS LISTENING, corrected 2026-08-20: the lane answers over HTTP
before an agent is ever launched, the launched agent pulls, and `se-pty` even
carries keystrokes back into a running one. The receiver reads today; what no
path does is start a new agent on a different model mid-walk.
