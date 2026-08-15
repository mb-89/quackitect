---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: req-acts-carry-role-and-channel
type: "[[requirement]]"
statement: The engine shall stamp every recorded act with the acting role and the arrival channel, and with zero personal identifiers.
kind: quality
verify_method: test
breaks_if_removed: Nobody can say who authorized what, and the authorization strength of every grant is unknowable.
breaks_how_badly: crippling
refines:
  - uc-quality-maintainability
  - uc-adjudicate-a-gate
  - uc-land-work-on-trunk
source_refs:
  - uc-quality-maintainability step 3
  - uc-quality-maintainability ext 3a
  - ".se/req-mine-v2.md: gates, offers and grants (v2-021, v2-025)"
  - ".se/req-mine-v1.md: the ledger and truth (actor stamps)"
  - uc-adjudicate-a-gate step 6
  - ".se/req-mine-v2.md: gates, offers and grants"
  - ".se/req-mine-v1.md: the ledger and truth"
  - uc-land-work-on-trunk step 5
priority: should
weighs_against:
  - req-repo-search-carries-intent >
  - req-engine-folder-is-sealed >
---

## Detail

- The role vocabulary is fixed and recorded (owner, agent).
- The channel is recorded per act (lane, board, phone, chat).
- Usernames, hostnames and other personal identifiers are never recorded.

The record carries the time of the act.

## Scenario

- source: any actor: a person over a channel, an agent on the lane
- stimulus: an act is recorded: a grant, a fill, an answer
- artifact: the recorded stamp
- environment: every channel, the phone lane included
- response: the record carries the acting role and the arrival channel from a fixed vocabulary
- response measure: acts stamped with role and channel = every act; personal identifiers in records = 0
