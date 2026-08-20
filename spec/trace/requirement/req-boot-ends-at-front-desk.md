---
minted_in: i2
id: req-boot-ends-at-front-desk
type: "[[requirement]]"
statement: When a session boots, the engine shall land the walk at the front desk within 20 seconds of the first pull on the reference machine.
kind: functional
verify_method: test
breaks_if_removed: Boot walks into whatever record stands open, serves that route's reading as its own, and the session opens inside work nobody routed — the person meets a gate instead of the desk.
breaks_how_badly: crippling
refines:
  - uc-resume-after-an-absence
  - uc-install-quackitect
source_refs:
  - "the owner's emergency ruling of 2026-08-11: a boot always ends at the front desk"
  - "req-walk-resumes-from-repo — the resume Detail this row tightens: the standing position is served, and the walk still parks at the desk"
  - the 2026-08-11 boot that walked into open i2 and served its route's 10 documents (call log, session 19:57)
priority: must
---

## Detail

- A boot always ends with the walk standing at front_desk. An open record keeps its standing position; re-entering it takes an aim on the person's word.
- From the FIRST se_pull of the session to the walk standing at front_desk: no more than 20 seconds.
- The reference machine is a 2025 mid-tier laptop.
- Boot's reading serves boot's own demands only, never an open record's route.

The resume requirement is untouched: the engine still serves the walk from its recorded position out of the repository alone. What this row pins is where the SESSION starts — at the desk, fast — not what the engine remembers.
