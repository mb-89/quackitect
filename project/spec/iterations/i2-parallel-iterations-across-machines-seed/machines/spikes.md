---
steps:
  - id: claim-verb-race
    statement: "spike the claim verb: build it as a throwaway and race two clients against a local bare origin - timeboxed three hours; exercise the lost race, the offline record-then-announce, and the force release"
    depends_on: []
    realization: code
---

# The spike drawing

One spike, seeded from rank-unknowns' pick (owner-sanctioned 2026-08-11):
the claim verb built early as a throwaway, so a red is found before the
M7 build stands on it.

What the spike proves, all against a LOCAL bare origin so no push leaves
the machine:

- Claiming writes claims/<iteration>.md and pushes; exactly one of two
  racing clients lands, the loser rejects non-fast-forward, re-fetches
  and sees the holder.
- Offline, the claim records locally and the announce waits; the later
  push reconciles or surfaces the conflict.
- Release is a force commit recording who and why.

What it fakes: the network and the real forge's receive layer — the
origin half stays owed at M7, where the engine's machinery-push right
exists. Throwaway means throwaway: the finding promotes, the code does
not ship.
